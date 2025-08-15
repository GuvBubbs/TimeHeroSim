import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSimulationStore } from './simulation.js'

/**
 * Results Store - Analysis and metrics
 * 
 * This store handles simulation results, reports, and analysis.
 * It processes simulation data to generate insights and recommendations.
 */
export const useResultsStore = defineStore('results', () => {
  // Stored simulation reports
  const simulationReports = ref([])
  const currentReport = ref(null)
  
  // Analysis results
  const bottlenecks = ref([])
  const recommendations = ref([])
  const phaseAnalysis = ref({})
  const screenTimeAnalysis = ref({})
  
  // Comparison data for A/B testing
  const comparisonResults = ref(null)
  
  // Computed analysis
  const latestReport = computed(() => {
    return simulationReports.value[simulationReports.value.length - 1] || null
  })
  
  const avgPhaseTime = computed(() => {
    if (simulationReports.value.length === 0) return {}
    
    const phaseTotals = {}
    const phaseCounts = {}
    
    simulationReports.value.forEach(report => {
      Object.entries(report.results.phaseDurations || {}).forEach(([phase, duration]) => {
        phaseTotals[phase] = (phaseTotals[phase] || 0) + duration
        phaseCounts[phase] = (phaseCounts[phase] || 0) + 1
      })
    })
    
    const averages = {}
    Object.keys(phaseTotals).forEach(phase => {
      averages[phase] = phaseTotals[phase] / phaseCounts[phase]
    })
    
    return averages
  })

  // === ENHANCED REPORTING FUNCTIONS ===

  // Generate comprehensive simulation report
  function generateComprehensiveReport() {
    const simulation = useSimulationStore()
    const report = simulation.generateSimulationReport()
    
    // Add performance metrics
    report.performance = {
      ticksPerSecond: calculateTicksPerSecond(),
      memoryUsage: getMemoryUsage(),
      renderTime: measureRenderTime()
    }
    
    // Add balance analysis
    report.balance = analyzeGameBalance(report)
    
    // Add validation results
    report.validation = validateDesignGoals(report)
    
    saveSimulationReport(report)
    return report
  }

  // Quick test scenarios
  function runQuickTestScenario(scenario) {
    const simulation = useSimulationStore()
    
    simulation.resetSimulation()
    
    switch (scenario) {
      case 'speedrunner':
        setupSpeedrunnerProfile(simulation)
        break
      case 'casual':
        setupCasualProfile(simulation)
        break
      case 'weekend-warrior':
        setupWeekendWarriorProfile(simulation)
        break
      case 'balance-test':
        setupBalanceTestProfile(simulation)
        break
    }
    
    simulation.startSimulation()
    return `Started ${scenario} test scenario`
  }

  // Setup player profiles for testing
  function setupSpeedrunnerProfile(simulation) {
    const profile = {
      dailyCheckIns: { weekday: 10, weekend: 12 },
      sessionLength: { weekday: 45, weekend: 60 },
      efficiency: {
        tutorial: 0.95,
        early: 0.95,
        mid: 0.95,
        late: 0.95,
        endgame: 0.95
      },
      upgradeStrategy: 'production-focused',
      adventurePreference: 'long',
      riskTolerance: 0.9,
      optimizationLevel: 0.95
    }
    simulation.updatePlayerProfile(profile)
  }

  function setupCasualProfile(simulation) {
    const profile = {
      dailyCheckIns: { weekday: 2, weekend: 4 },
      sessionLength: { weekday: 15, weekend: 25 },
      efficiency: {
        tutorial: 0.65,
        early: 0.70,
        mid: 0.75,
        late: 0.80,
        endgame: 0.85
      },
      upgradeStrategy: 'balanced',
      adventurePreference: 'medium',
      riskTolerance: 0.6,
      optimizationLevel: 0.70
    }
    simulation.updatePlayerProfile(profile)
  }

  function setupWeekendWarriorProfile(simulation) {
    const profile = {
      dailyCheckIns: { weekday: 1, weekend: 6 },
      sessionLength: { weekday: 10, weekend: 45 },
      efficiency: {
        tutorial: 0.70,
        early: 0.75,
        mid: 0.80,
        late: 0.85,
        endgame: 0.90
      },
      upgradeStrategy: 'storage-focused',
      adventurePreference: 'short',
      riskTolerance: 0.5,
      optimizationLevel: 0.80
    }
    simulation.updatePlayerProfile(profile)
  }

  function setupBalanceTestProfile(simulation) {
    const profile = {
      dailyCheckIns: { weekday: 4, weekend: 6 },
      sessionLength: { weekday: 20, weekend: 35 },
      efficiency: {
        tutorial: 0.75,
        early: 0.80,
        mid: 0.85,
        late: 0.85,
        endgame: 0.90
      },
      upgradeStrategy: 'balanced',
      adventurePreference: 'medium',
      riskTolerance: 0.75,
      optimizationLevel: 0.85
    }
    simulation.updatePlayerProfile(profile)
  }

  // Performance monitoring
  function calculateTicksPerSecond() {
    // This would be implemented with actual performance monitoring
    return 60 // Placeholder
  }

  function getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      }
    }
    return null
  }

  function measureRenderTime() {
    // Placeholder for render time measurement
    return performance.now() % 100 // Simulated render time
  }

  // Game balance analysis
  function analyzeGameBalance(report) {
    const balance = {
      energyBalance: analyzeEnergyBalance(report),
      progressionPacing: analyzeProgressionPacing(report),
      resourceEconomy: analyzeResourceEconomy(report),
      playerEngagement: analyzePlayerEngagement(report)
    }
    
    return balance
  }

  function analyzeEnergyBalance(report) {
    const energy = report.resources.energy
    const wasteRatio = energy.wasted / (energy.generated + 1)
    const utilizationRatio = energy.spent / (energy.generated + 1)
    
    return {
      wasteRatio: wasteRatio,
      utilizationRatio: utilizationRatio,
      efficiency: utilizationRatio / (utilizationRatio + wasteRatio),
      verdict: wasteRatio > 0.3 ? 'POOR - Too much waste' : 
               wasteRatio > 0.15 ? 'FAIR - Some waste' : 'GOOD - Low waste'
    }
  }

  function analyzeProgressionPacing(report) {
    const currentDay = report.gameState.day
    const phase = report.gameState.phase
    const helpers = report.gameState.helpers
    
    const expectedHelper = currentDay >= 5 && report.gameState.activePlots >= 15
    const hasHelper = helpers > 0
    
    return {
      phaseProgression: getPhaseScore(phase, currentDay),
      helperDiscovery: hasHelper || !expectedHelper ? 'ON_TRACK' : 'DELAYED',
      plotExpansion: getPlotExpansionScore(report.gameState.activePlots, currentDay),
      verdict: 'ANALYZING...' // Would be calculated based on scores
    }
  }

  function analyzeResourceEconomy(report) {
    const gold = report.resources.gold
    const materials = report.resources.materials
    const upgrades = report.gameState.upgrades
    
    const materialDiversity = Object.values(materials).filter(amount => amount > 0).length
    const upgradeProgress = upgrades / Math.max(1, Math.floor(report.gameState.day / 2))
    
    return {
      goldAccumulation: gold > report.gameState.day * 100 ? 'HIGH' : 'LOW',
      materialDiversity: materialDiversity,
      upgradeProgress: upgradeProgress,
      verdict: 'BALANCED' // Placeholder
    }
  }

  function analyzePlayerEngagement(report) {
    const screenTime = report.progression.screenTime || {}
    const totalTime = Object.values(screenTime).reduce((sum, time) => sum + time, 0)
    
    const distribution = {}
    Object.entries(screenTime).forEach(([location, time]) => {
      distribution[location] = totalTime > 0 ? (time / totalTime) * 100 : 0
    })
    
    return {
      totalEngagementTime: totalTime,
      screenTimeDistribution: distribution,
      balanceScore: calculateEngagementBalance(distribution),
      verdict: 'ENGAGING' // Placeholder
    }
  }

  function getPhaseScore(phase, day) {
    const expected = {
      tutorial: 1, early: 5, mid: 12, late: 20, endgame: 28
    }
    
    const phases = ['tutorial', 'early', 'mid', 'late', 'endgame']
    const currentIndex = phases.indexOf(phase)
    const expectedPhase = phases.find((p, i) => day <= expected[p]) || 'endgame'
    const expectedIndex = phases.indexOf(expectedPhase)
    
    return currentIndex >= expectedIndex ? 'ON_TRACK' : 'BEHIND'
  }

  function getPlotExpansionScore(plots, day) {
    const expectedPlots = Math.min(90, 3 + (day - 1) * 3)
    const ratio = plots / expectedPlots
    
    if (ratio >= 0.8) return 'GOOD'
    if (ratio >= 0.6) return 'FAIR'
    return 'POOR'
  }

  function calculateEngagementBalance(distribution) {
    // Ideal distribution: home 40%, adventure 25%, mine 15%, tower 10%, forge 5%, town 5%
    const ideal = { home: 40, adventure: 25, mine: 15, tower: 10, forge: 5, town: 5 }
    let score = 100
    
    Object.entries(ideal).forEach(([location, target]) => {
      const actual = distribution[location] || 0
      const deviation = Math.abs(actual - target)
      score -= deviation * 0.5 // Penalty for deviation
    })
    
    return Math.max(0, score)
  }

  // Validate design goals
  function validateDesignGoals(report) {
    const validation = {
      threeToFourWeekJourney: validateJourneyLength(report),
      paradigmShifts: validateParadigmShifts(report),
      respectfulOfTime: validateTimeRespect(report),
      progressionSatisfaction: validateProgressionSatisfaction(report)
    }
    
    return validation
  }

  function validateJourneyLength(report) {
    const day = report.gameState.day
    const phase = report.gameState.phase
    
    if (day <= 28 && phase === 'endgame') {
      return { status: 'PASS', message: 'Journey completed within 4 weeks' }
    } else if (day <= 21 && ['late', 'endgame'].includes(phase)) {
      return { status: 'PASS', message: 'On track for 3-4 week journey' }
    } else {
      return { status: 'REVIEW', message: 'Journey pacing may need adjustment' }
    }
  }

  function validateParadigmShifts(report) {
    const helpers = report.gameState.helpers
    const upgrades = report.gameState.upgrades
    const day = report.gameState.day
    
    if (helpers > 0 && day <= 7) {
      return { status: 'PASS', message: 'Helper discovery creates paradigm shift' }
    } else if (upgrades >= 5 && day <= 14) {
      return { status: 'PASS', message: 'Upgrade progression creates meaningful choices' }
    } else {
      return { status: 'REVIEW', message: 'Paradigm shifts may be delayed' }
    }
  }

  function validateTimeRespect(report) {
    const energy = report.resources.energy
    const wasteRatio = energy.wasted / (energy.generated + 1)
    
    if (wasteRatio < 0.2) {
      return { status: 'PASS', message: 'Low energy waste shows respectful design' }
    } else {
      return { status: 'FAIL', message: 'High energy waste indicates poor time respect' }
    }
  }

  function validateProgressionSatisfaction(report) {
    const balance = analyzeGameBalance(report)
    
    if (balance.progressionPacing.phaseProgression === 'ON_TRACK') {
      return { status: 'PASS', message: 'Progression feels satisfying and well-paced' }
    } else {
      return { status: 'REVIEW', message: 'Progression pacing needs review' }
    }
  }

  // Export functionality
  function exportReport(reportId, format = 'json') {
    const report = simulationReports.value.find(r => r.id === reportId) || currentReport.value
    if (!report) return null
    
    if (format === 'json') {
      return exportAsJSON(report)
    } else if (format === 'csv') {
      return exportAsCSV(report)
    } else if (format === 'markdown') {
      return exportAsMarkdown(report)
    }
    
    return null
  }

  function exportAsJSON(report) {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `time-hero-simulation-${report.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    return 'JSON export completed'
  }

  function exportAsCSV(report) {
    const csv = generateCSVReport(report)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `time-hero-simulation-${report.id}.csv`
    a.click()
    URL.revokeObjectURL(url)
    return 'CSV export completed'
  }

  function exportAsMarkdown(report) {
    const markdown = generateMarkdownReport(report)
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `time-hero-simulation-${report.id}.md`
    a.click()
    URL.revokeObjectURL(url)
    return 'Markdown export completed'
  }

  function generateCSVReport(report) {
    let csv = 'Metric,Value\n'
    csv += `Game Day,${report.gameState.day}\n`
    csv += `Current Phase,${report.gameState.phase}\n`
    csv += `Active Plots,${report.gameState.activePlots}\n`
    csv += `Helpers Found,${report.gameState.helpers}\n`
    csv += `Upgrades Owned,${report.gameState.upgrades}\n`
    csv += `Energy Current,${report.resources.energy.current}\n`
    csv += `Energy Cap,${report.resources.energy.cap}\n`
    csv += `Energy Generated,${report.resources.energy.generated}\n`
    csv += `Energy Wasted,${report.resources.energy.wasted}\n`
    csv += `Gold,${report.resources.gold}\n`
    return csv
  }

  function generateMarkdownReport(report) {
    return `# Time Hero Simulation Report
## Game State
- **Day:** ${report.gameState.day}
- **Phase:** ${report.gameState.phase}
- **Active Plots:** ${report.gameState.activePlots}
- **Helpers:** ${report.gameState.helpers}
- **Upgrades:** ${report.gameState.upgrades}

## Resource Analysis
- **Energy:** ${report.resources.energy.current}/${report.resources.energy.cap}
- **Generation:** ${report.resources.energy.generated}
- **Wasted:** ${report.resources.energy.wasted}
- **Gold:** ${report.resources.gold}

## Recommendations
${report.recommendations?.map(rec => `- ${rec}`).join('\n') || 'No recommendations available'}
`
  }

  const screenTimeDistribution = computed(() => {
    if (!currentReport.value?.results?.screenTime) return {}
    
    const screenTime = currentReport.value.results.screenTime
    const totalTime = Object.values(screenTime).reduce((sum, time) => sum + time, 0)
    
    const distribution = {}
    Object.entries(screenTime).forEach(([screen, time]) => {
      distribution[screen] = {
        absolute: time,
        percentage: totalTime > 0 ? (time / totalTime) * 100 : 0
      }
    })
    
    return distribution
  })
  
  // Actions
  function saveSimulationReport(simulationData, gameValues, playerProfile) {
    const report = {
      id: `sim-${Date.now()}`,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      
      // Input state
      inputs: {
        gameValues: { ...gameValues },
        playerProfile: { ...playerProfile },
        simulationSettings: { ...simulationData.settings }
      },
      
      // Results
      results: {
        phaseDurations: { ...simulationData.phaseDurations },
        upgradeTimings: { ...simulationData.upgradeTimings },
        screenTime: { ...simulationData.screenTime },
        resourceFlows: { ...simulationData.resourceFlows },
        finalState: { ...simulationData.finalState }
      },
      
      // Analysis
      analysis: {
        deviationsFromTarget: analyzeDeviations(simulationData),
        recommendations: generateRecommendations(simulationData),
        warnings: detectWarnings(simulationData)
      },
      
      // Metadata
      metadata: {
        simulationDuration: simulationData.realTime || 0,
        gameTimeCovered: simulationData.gameTime || 0,
        eventsLogged: simulationData.eventsLogged || 0,
        platform: navigator.userAgent
      }
    }
    
    simulationReports.value.push(report)
    currentReport.value = report
    
    // Analyze the report
    analyzeReport(report)
    
    return report.id
  }
  
  function analyzeReport(report) {
    // Reset analysis
    bottlenecks.value = []
    recommendations.value = []
    phaseAnalysis.value = {}
    screenTimeAnalysis.value = {}
    
    // Analyze phase durations
    analyzePhases(report)
    
    // Analyze screen time
    analyzeScreenTime(report)
    
    // Detect bottlenecks
    detectBottlenecks(report)
    
    // Generate recommendations
    generateAnalysisRecommendations(report)
  }
  
  function analyzePhases(report) {
    const phases = report.results.phaseDurations || {}
    const targets = {
      tutorial: { min: 1, max: 4, unit: 'hours' },
      early: { min: 1, max: 5, unit: 'days' },
      mid: { min: 3, max: 8, unit: 'days' },
      late: { min: 5, max: 12, unit: 'days' },
      endgame: { min: 10, max: 25, unit: 'days' }
    }
    
    Object.entries(phases).forEach(([phase, duration]) => {
      const target = targets[phase]
      if (!target) return
      
      let normalizedDuration = duration
      if (target.unit === 'hours') {
        normalizedDuration = duration / 60 // convert minutes to hours
      } else if (target.unit === 'days') {
        normalizedDuration = duration / (60 * 24) // convert minutes to days
      }
      
      const analysis = {
        phase,
        actual: normalizedDuration,
        target: target,
        status: 'normal'
      }
      
      if (normalizedDuration < target.min) {
        analysis.status = 'too_fast'
        analysis.deviation = ((target.min - normalizedDuration) / target.min) * 100
      } else if (normalizedDuration > target.max) {
        analysis.status = 'too_slow'
        analysis.deviation = ((normalizedDuration - target.max) / target.max) * 100
      }
      
      phaseAnalysis.value[phase] = analysis
    })
  }
  
  function analyzeScreenTime(report) {
    const screenTime = report.results.screenTime || {}
    const thresholds = {
      home: { min: 25, max: 45, name: 'Home/Farm' },
      adventure: { min: 20, max: 45, name: 'Adventures' },
      mine: { min: 5, max: 20, name: 'Mining' },
      forge: { min: 3, max: 15, name: 'Forge' },
      tower: { min: 3, max: 15, name: 'Tower' },
      town: { min: 5, max: 20, name: 'Town' }
    }
    
    const totalTime = Object.values(screenTime).reduce((sum, time) => sum + time, 0)
    
    Object.entries(screenTime).forEach(([screen, time]) => {
      const percentage = totalTime > 0 ? (time / totalTime) * 100 : 0
      const threshold = thresholds[screen]
      
      if (threshold) {
        const analysis = {
          screen,
          name: threshold.name,
          percentage,
          absolute: time,
          status: 'balanced'
        }
        
        if (percentage < threshold.min) {
          analysis.status = 'underutilized'
          analysis.concern = `Only ${percentage.toFixed(1)}% of time (minimum ${threshold.min}%)`
        } else if (percentage > threshold.max) {
          analysis.status = 'overutilized'
          analysis.concern = `${percentage.toFixed(1)}% of time (maximum ${threshold.max}%)`
        }
        
        screenTimeAnalysis.value[screen] = analysis
      }
    })
  }
  
  function detectBottlenecks(report) {
    bottlenecks.value = []
    
    // Energy waste bottleneck
    const resourceFlows = report.results.resourceFlows || {}
    if (resourceFlows.energyWasted > resourceFlows.energyGenerated * 0.1) {
      bottlenecks.value.push({
        type: 'energy_waste',
        severity: 'high',
        description: 'Energy storage hitting cap frequently',
        impact: `${((resourceFlows.energyWasted / resourceFlows.energyGenerated) * 100).toFixed(1)}% of energy wasted`,
        suggestion: 'Increase storage capacity or energy consumption'
      })
    }
    
    // Phase progression bottleneck
    Object.entries(phaseAnalysis.value).forEach(([phase, analysis]) => {
      if (analysis.status === 'too_slow' && analysis.deviation > 50) {
        bottlenecks.value.push({
          type: 'phase_progression',
          severity: analysis.deviation > 100 ? 'high' : 'medium',
          description: `${phase} phase taking too long`,
          impact: `${analysis.deviation.toFixed(1)}% longer than target`,
          suggestion: `Review ${phase} phase requirements and costs`
        })
      }
    })
    
    // Screen time bottleneck
    Object.entries(screenTimeAnalysis.value).forEach(([screen, analysis]) => {
      if (analysis.status === 'overutilized' && analysis.percentage > 50) {
        bottlenecks.value.push({
          type: 'screen_overuse',
          severity: 'medium',
          description: `${analysis.name} consuming excessive time`,
          impact: `${analysis.percentage.toFixed(1)}% of total playtime`,
          suggestion: `Consider reducing rewards or increasing costs for ${analysis.name.toLowerCase()}`
        })
      }
    })
  }
  
  function generateAnalysisRecommendations(report) {
    recommendations.value = []
    
    // Generate recommendations based on bottlenecks
    bottlenecks.value.forEach(bottleneck => {
      recommendations.value.push({
        category: bottleneck.type,
        priority: bottleneck.severity === 'high' ? 'critical' : 'important',
        title: bottleneck.description,
        description: bottleneck.suggestion,
        impact: bottleneck.impact
      })
    })
    
    // Phase-specific recommendations
    Object.entries(phaseAnalysis.value).forEach(([phase, analysis]) => {
      if (analysis.status !== 'normal') {
        recommendations.value.push({
          category: 'phase_timing',
          priority: analysis.deviation > 100 ? 'critical' : 'normal',
          title: `${phase} phase ${analysis.status.replace('_', ' ')}`,
          description: analysis.status === 'too_fast' 
            ? `Consider increasing requirements or adding content to ${phase} phase`
            : `Consider reducing costs or improving rewards in ${phase} phase`,
          impact: `${analysis.deviation?.toFixed(1) || 'N/A'}% deviation from target`
        })
      }
    })
  }
  
  function analyzeDeviations(simulationData) {
    // TODO: Implement deviation analysis
    return {}
  }
  
  function generateRecommendations(simulationData) {
    // TODO: Implement recommendation generation
    return []
  }
  
  function detectWarnings(simulationData) {
    // TODO: Implement warning detection
    return []
  }
  
  function loadReport(reportId) {
    const report = simulationReports.value.find(r => r.id === reportId)
    if (report) {
      currentReport.value = report
      analyzeReport(report)
    }
    return report
  }
  
  function deleteReport(reportId) {
    const index = simulationReports.value.findIndex(r => r.id === reportId)
    if (index !== -1) {
      simulationReports.value.splice(index, 1)
      if (currentReport.value?.id === reportId) {
        currentReport.value = null
      }
    }
  }
  
  function exportReports(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(simulationReports.value, null, 2)
    } else if (format === 'csv') {
      // TODO: Implement CSV export
      return ''
    }
  }
  
  function compareReports(reportId1, reportId2) {
    const report1 = simulationReports.value.find(r => r.id === reportId1)
    const report2 = simulationReports.value.find(r => r.id === reportId2)
    
    if (!report1 || !report2) return null
    
    // TODO: Implement detailed comparison
    comparisonResults.value = {
      report1,
      report2,
      differences: {},
      summary: 'Comparison analysis would go here'
    }
    
    return comparisonResults.value
  }
  
  return {
    // State
    simulationReports,
    currentReport,
    bottlenecks,
    recommendations,
    phaseAnalysis,
    screenTimeAnalysis,
    comparisonResults,
    
    // Computed
    latestReport,
    avgPhaseTime,
    screenTimeDistribution,
    
    // Actions
    saveSimulationReport,
    analyzeReport,
    loadReport,
    deleteReport,
    exportReports,
    compareReports,
    
    // Enhanced reporting functions
    generateComprehensiveReport,
    runQuickTestScenario,
    exportReport
  }
})
