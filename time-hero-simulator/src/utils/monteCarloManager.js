/**
 * Monte Carlo Simulation Manager
 * 
 * Manages multiple parallel simulation runs with variance parameters
 * to generate statistical distributions of game outcomes.
 */

import { SimulationWorkerManager } from './workerManager.js'

export class MonteCarloManager {
  constructor() {
    this.workers = []
    this.runs = []
    this.isRunning = false
    this.completedRuns = 0
    this.totalRuns = 0
    this.results = []
    this.startTime = null
    this.config = null
    this.callbacks = {
      onProgress: null,
      onComplete: null,
      onError: null,
      onRunComplete: null
    }
  }

  /**
   * Configure Monte Carlo simulation
   */
  configure(config) {
    this.config = {
      // Number of simulation runs
      runs: config.runs || 100,
      
      // Maximum parallel workers
      maxWorkers: config.maxWorkers || Math.min(navigator.hardwareConcurrency || 4, 8),
      
      // Base game values
      baseGameValues: config.baseGameValues,
      
      // Variance parameters
      variance: {
        // Player behavior variance
        playerBehavior: {
          checkInTimingVariance: config.variance?.playerBehavior?.checkInTimingVariance || 0.2, // ±20%
          sessionLengthVariance: config.variance?.playerBehavior?.sessionLengthVariance || 0.3, // ±30%
          efficiencyVariance: config.variance?.playerBehavior?.efficiencyVariance || 0.1, // ±10%
          decisionDelayVariance: config.variance?.playerBehavior?.decisionDelayVariance || 0.5 // ±50%
        },
        
        // Game RNG variance
        gameRNG: {
          cropGrowthVariance: config.variance?.gameRNG?.cropGrowthVariance || 0.1, // ±10%
          helperDiscoveryVariance: config.variance?.gameRNG?.helperDiscoveryVariance || 0.3, // ±30%
          materialDropVariance: config.variance?.gameRNG?.materialDropVariance || 0.2, // ±20%
          adventureRewardVariance: config.variance?.gameRNG?.adventureRewardVariance || 0.15 // ±15%
        },
        
        // Timing variance
        timing: {
          upgradeDecisionVariance: config.variance?.timing?.upgradeDecisionVariance || 0.4, // ±40%
          phaseTransitionVariance: config.variance?.timing?.phaseTransitionVariance || 0.2 // ±20%
        }
      },
      
      // Simulation settings
      simulation: {
        maxDays: config.simulation?.maxDays || 28,
        timeoutPerRun: config.simulation?.timeoutPerRun || 300000, // 5 minutes per run
        logLevel: config.simulation?.logLevel || 'minimal'
      },
      
      // Analysis settings
      analysis: {
        confidenceLevel: config.analysis?.confidenceLevel || 0.95,
        trackMetrics: config.analysis?.trackMetrics || [
          'phaseTransitionTimes',
          'totalUpgrades',
          'helpersDiscovered',
          'finalResources',
          'bottleneckDurations'
        ]
      }
    }
  }

  /**
   * Set callback functions
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Start Monte Carlo simulation
   */
  async start() {
    if (this.isRunning) {
      throw new Error('Monte Carlo simulation already running')
    }

    if (!this.config) {
      throw new Error('Monte Carlo configuration not set')
    }

    this.isRunning = true
    this.completedRuns = 0
    this.totalRuns = this.config.runs
    this.results = []
    this.startTime = Date.now()

    try {
      // Initialize workers
      await this.initializeWorkers()
      
      // Start simulation runs
      await this.runSimulations()
      
      // Analyze results
      const analysis = this.analyzeResults()
      
      this.isRunning = false
      
      if (this.callbacks.onComplete) {
        this.callbacks.onComplete(analysis)
      }
      
      return analysis
    } catch (error) {
      this.isRunning = false
      if (this.callbacks.onError) {
        this.callbacks.onError(error)
      }
      throw error
    }
  }

  /**
   * Stop Monte Carlo simulation
   */
  stop() {
    this.isRunning = false
    this.workers.forEach(worker => worker.destroy())
    this.workers = []
  }

  /**
   * Initialize worker pool
   */
  async initializeWorkers() {
    const workerCount = Math.min(this.config.maxWorkers, this.config.runs)
    
    for (let i = 0; i < workerCount; i++) {
      const worker = new SimulationWorkerManager()
      await worker.initialize()
      this.workers.push(worker)
    }
  }

  /**
   * Run all simulations
   */
  async runSimulations() {
    const batchSize = this.workers.length
    const batches = Math.ceil(this.config.runs / batchSize)
    
    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * batchSize
      const batchEnd = Math.min(batchStart + batchSize, this.config.runs)
      const batchPromises = []
      
      for (let runIndex = batchStart; runIndex < batchEnd; runIndex++) {
        const workerIndex = runIndex % this.workers.length
        const worker = this.workers[workerIndex]
        
        batchPromises.push(this.runSingleSimulation(worker, runIndex))
      }
      
      await Promise.all(batchPromises)
    }
  }

  /**
   * Run a single simulation with variance
   */
  async runSingleSimulation(worker, runIndex) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Simulation run ${runIndex} timed out`))
      }, this.config.simulation.timeoutPerRun)

      // Generate variant parameters for this run
      const variantGameValues = this.generateVariantGameValues(runIndex)
      const variantPlayerProfile = this.generateVariantPlayerProfile(runIndex)

      // Set up result tracking
      const runResults = {
        runIndex,
        startTime: Date.now(),
        events: [],
        metrics: {},
        completed: false
      }

      // Subscribe to events
      const unsubscribe = worker.subscribeToMajorEvents((payload) => {
        runResults.events.push({
          timestamp: Date.now(),
          type: payload.type,
          data: payload.data
        })
      })

      const unsubscribeState = worker.subscribeToStateUpdates((payload) => {
        if (payload.gameState) {
          // Track key metrics
          runResults.metrics.currentDay = payload.gameState.day
          runResults.metrics.currentPhase = payload.gameState.currentPhase
          runResults.metrics.resources = payload.gameState.resources
          runResults.metrics.helpers = payload.gameState.helpers?.length || 0
        }
      })

      // Start simulation
      worker.initializeSimulation(variantGameValues, null)
        .then(() => {
          worker.updatePlayerProfile(variantPlayerProfile)
          worker.startSimulation('max') // Run at maximum speed
          
          // Wait for completion or stop at max days
          const checkCompletion = () => {
            if (!this.isRunning) {
              this.completeRun(runResults, worker, unsubscribe, unsubscribeState, timeout, resolve)
              return
            }
            
            if (runResults.metrics.currentDay >= this.config.simulation.maxDays) {
              this.completeRun(runResults, worker, unsubscribe, unsubscribeState, timeout, resolve)
              return
            }
            
            setTimeout(checkCompletion, 1000) // Check every second
          }
          
          checkCompletion()
        })
        .catch(reject)
    })
  }

  /**
   * Complete a simulation run
   */
  completeRun(runResults, worker, unsubscribe, unsubscribeState, timeout, resolve) {
    clearTimeout(timeout)
    unsubscribe()
    unsubscribeState()
    
    worker.pauseSimulation()
    
    runResults.endTime = Date.now()
    runResults.duration = runResults.endTime - runResults.startTime
    runResults.completed = true
    
    this.results.push(runResults)
    this.completedRuns++
    
    if (this.callbacks.onProgress) {
      this.callbacks.onProgress({
        completed: this.completedRuns,
        total: this.totalRuns,
        percentage: (this.completedRuns / this.totalRuns) * 100
      })
    }
    
    if (this.callbacks.onRunComplete) {
      this.callbacks.onRunComplete(runResults)
    }
    
    resolve(runResults)
  }

  /**
   * Generate variant game values for a run
   */
  generateVariantGameValues(runIndex) {
    const seed = runIndex // Simple seed for reproducible variance
    const rng = this.createSeededRNG(seed)
    const baseValues = JSON.parse(JSON.stringify(this.config.baseGameValues))
    
    // Apply RNG variance to game values
    if (baseValues.crops) {
      baseValues.crops.forEach(crop => {
        if (crop.growthTime) {
          const variance = this.config.variance.gameRNG.cropGrowthVariance
          crop.growthTime *= 1 + (rng() - 0.5) * variance * 2
        }
      })
    }
    
    if (baseValues.adventures) {
      baseValues.adventures.forEach(adventure => {
        if (adventure.goldReward) {
          const variance = this.config.variance.gameRNG.adventureRewardVariance
          adventure.goldReward *= 1 + (rng() - 0.5) * variance * 2
        }
      })
    }
    
    return baseValues
  }

  /**
   * Generate variant player profile for a run
   */
  generateVariantPlayerProfile(runIndex) {
    const seed = runIndex + 1000 // Different seed for player behavior
    const rng = this.createSeededRNG(seed)
    
    const baseProfile = {
      dailyCheckIns: { weekday: 3, weekend: 5 },
      sessionLength: { weekday: 15, weekend: 30 },
      efficiency: {
        tutorial: 0.65,
        early: 0.70,
        mid: 0.75,
        late: 0.80,
        endgame: 0.85
      }
    }
    
    // Apply variance to player behavior
    const behaviorVariance = this.config.variance.playerBehavior
    
    baseProfile.dailyCheckIns.weekday *= 1 + (rng() - 0.5) * behaviorVariance.checkInTimingVariance * 2
    baseProfile.dailyCheckIns.weekend *= 1 + (rng() - 0.5) * behaviorVariance.checkInTimingVariance * 2
    
    baseProfile.sessionLength.weekday *= 1 + (rng() - 0.5) * behaviorVariance.sessionLengthVariance * 2
    baseProfile.sessionLength.weekend *= 1 + (rng() - 0.5) * behaviorVariance.sessionLengthVariance * 2
    
    Object.keys(baseProfile.efficiency).forEach(phase => {
      baseProfile.efficiency[phase] *= 1 + (rng() - 0.5) * behaviorVariance.efficiencyVariance * 2
      baseProfile.efficiency[phase] = Math.max(0.1, Math.min(1.0, baseProfile.efficiency[phase]))
    })
    
    return baseProfile
  }

  /**
   * Create seeded random number generator
   */
  createSeededRNG(seed) {
    let s = seed
    return function() {
      s = Math.sin(s) * 10000
      return s - Math.floor(s)
    }
  }

  /**
   * Analyze Monte Carlo results
   */
  analyzeResults() {
    if (this.results.length === 0) {
      return null
    }

    const analysis = {
      metadata: {
        totalRuns: this.results.length,
        completedRuns: this.results.filter(r => r.completed).length,
        totalDuration: Date.now() - this.startTime,
        configuration: this.config
      },
      metrics: {},
      distributions: {},
      confidence: {},
      summary: {}
    }

    // Analyze phase transition times
    const phaseTransitions = this.extractPhaseTransitions()
    analysis.metrics.phaseTransitions = phaseTransitions
    analysis.distributions.phaseTransitions = this.calculateDistributions(phaseTransitions)
    analysis.confidence.phaseTransitions = this.calculateConfidenceIntervals(phaseTransitions)

    // Analyze final resources
    const finalResources = this.extractFinalResources()
    analysis.metrics.finalResources = finalResources
    analysis.distributions.finalResources = this.calculateDistributions(finalResources)

    // Analyze helper discovery times
    const helperDiscoveries = this.extractHelperDiscoveries()
    analysis.metrics.helperDiscoveries = helperDiscoveries
    analysis.distributions.helperDiscoveries = this.calculateDistributions(helperDiscoveries)

    // Generate summary statistics
    analysis.summary = this.generateSummaryStatistics(analysis)

    return analysis
  }

  /**
   * Extract phase transition times from results
   */
  extractPhaseTransitions() {
    const transitions = {}
    
    this.results.forEach(result => {
      result.events.forEach(event => {
        if (event.type === 'PHASE_CHANGE') {
          const phase = event.data.newPhase
          if (!transitions[phase]) transitions[phase] = []
          transitions[phase].push(event.data.day || result.metrics.currentDay)
        }
      })
    })
    
    return transitions
  }

  /**
   * Extract final resource states
   */
  extractFinalResources() {
    return this.results.map(result => result.metrics.resources).filter(Boolean)
  }

  /**
   * Extract helper discovery times
   */
  extractHelperDiscoveries() {
    const discoveries = {}
    
    this.results.forEach(result => {
      result.events.forEach(event => {
        if (event.type === 'MAJOR_EVENT' && event.data.type === 'helper_discovered') {
          const helperType = event.data.helper?.type
          if (helperType) {
            if (!discoveries[helperType]) discoveries[helperType] = []
            discoveries[helperType].push(event.data.day || result.metrics.currentDay)
          }
        }
      })
    })
    
    return discoveries
  }

  /**
   * Calculate statistical distributions
   */
  calculateDistributions(data) {
    const distributions = {}
    
    Object.keys(data).forEach(key => {
      const values = data[key]
      if (values.length === 0) return
      
      values.sort((a, b) => a - b)
      
      distributions[key] = {
        mean: values.reduce((sum, val) => sum + val, 0) / values.length,
        median: values[Math.floor(values.length / 2)],
        min: values[0],
        max: values[values.length - 1],
        std: this.calculateStandardDeviation(values),
        percentiles: {
          p10: values[Math.floor(values.length * 0.1)],
          p25: values[Math.floor(values.length * 0.25)],
          p75: values[Math.floor(values.length * 0.75)],
          p90: values[Math.floor(values.length * 0.9)]
        }
      }
    })
    
    return distributions
  }

  /**
   * Calculate confidence intervals
   */
  calculateConfidenceIntervals(data) {
    const intervals = {}
    const z = 1.96 // 95% confidence level
    
    Object.keys(data).forEach(key => {
      const values = data[key]
      if (values.length === 0) return
      
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length
      const std = this.calculateStandardDeviation(values)
      const margin = z * (std / Math.sqrt(values.length))
      
      intervals[key] = {
        mean,
        lower: mean - margin,
        upper: mean + margin,
        margin
      }
    })
    
    return intervals
  }

  /**
   * Calculate standard deviation
   */
  calculateStandardDeviation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  /**
   * Generate summary statistics
   */
  generateSummaryStatistics(analysis) {
    return {
      averageSimulationTime: analysis.metadata.totalDuration / analysis.metadata.totalRuns,
      successRate: analysis.metadata.completedRuns / analysis.metadata.totalRuns,
      keyInsights: this.generateKeyInsights(analysis),
      recommendations: this.generateRecommendations(analysis)
    }
  }

  /**
   * Generate key insights from analysis
   */
  generateKeyInsights(analysis) {
    const insights = []
    
    // Check phase transition consistency
    const phaseDistributions = analysis.distributions.phaseTransitions
    Object.keys(phaseDistributions).forEach(phase => {
      const dist = phaseDistributions[phase]
      const cv = dist.std / dist.mean // Coefficient of variation
      
      if (cv > 0.5) {
        insights.push({
          type: 'high_variance',
          phase,
          message: `${phase} phase transition time is highly variable (CV: ${cv.toFixed(2)})`,
          severity: 'warning'
        })
      }
    })
    
    return insights
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = []
    
    // Add basic recommendations based on analysis
    recommendations.push({
      type: 'general',
      message: `Completed ${analysis.metadata.completedRuns} simulations with ${analysis.summary.successRate * 100}% success rate`,
      priority: 'info'
    })
    
    return recommendations
  }

  /**
   * Get current progress
   */
  getProgress() {
    return {
      isRunning: this.isRunning,
      completed: this.completedRuns,
      total: this.totalRuns,
      percentage: this.totalRuns > 0 ? (this.completedRuns / this.totalRuns) * 100 : 0,
      results: this.results.length
    }
  }
}
