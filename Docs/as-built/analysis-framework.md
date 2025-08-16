# Analysis Framework - As Built Documentation

## System Overview

The Analysis Framework provides sophisticated statistical and analytical capabilities for the Time Hero Simulator. It encompasses Monte Carlo simulation, A/B testing, bottleneck detection, and scenario analysis. This framework transforms raw simulation data into actionable insights for game balance validation, enabling data-driven decision making through rigorous statistical analysis.

In simple terms: This is the "data scientist" of the simulator. It takes hundreds or thousands of simulation runs and finds patterns, problems, and insights that would be impossible to see from just one playthrough. It's like having a team of analysts who can run statistical tests to prove whether changes actually improve the game or not.

## System Connections

### Inputs
- **Simulation Results**: Raw data from completed simulation runs
- **Game Configuration**: Different versions of game parameters for comparison
- **Player Behavior Profiles**: Various player archetypes and behavior patterns
- **Analysis Parameters**: Statistical confidence levels, variance settings, test configurations
- **Historical Data**: Previous analysis results for trend analysis

### Outputs
- **Statistical Reports**: Confidence intervals, significance tests, effect sizes
- **Bottleneck Identification**: Specific progression obstacles and their severity
- **Comparative Analysis**: A/B test results with statistical validation
- **Performance Metrics**: Key performance indicators and trend analysis
- **Actionable Recommendations**: Specific suggestions for game balance improvements

## Technical Implementation

### Core Architecture

The Analysis Framework is built around four primary analytical engines that work together:

1. **Monte Carlo Engine** - Statistical confidence through repeated sampling
2. **A/B Testing Engine** - Rigorous comparison of game configurations
3. **Bottleneck Detection Engine** - Automated identification of progression obstacles
4. **Scenario Analysis Engine** - Comprehensive testing of player archetypes

### Monte Carlo Analysis System

#### Statistical Foundation
The Monte Carlo system runs hundreds of simulations with controlled variance to establish statistical confidence in game balance decisions:

```javascript
class MonteCarloManager {
  constructor() {
    this.workerPool = []
    this.analysisConfig = {
      defaultRuns: 100,
      maxWorkers: 6,
      confidenceLevel: 0.95,
      varianceModel: 'realistic'
    }
  }
  
  async runMonteCarloAnalysis(config) {
    // Initialize variance parameters
    const varianceConfig = this.generateVarianceConfig(config)
    
    // Distribute simulations across workers
    const simulationBatches = this.createSimulationBatches(config.runs, config.maxWorkers)
    
    // Execute simulations in parallel
    const results = await this.executeParallelSimulations(simulationBatches, varianceConfig)
    
    // Perform statistical analysis
    const analysis = this.performStatisticalAnalysis(results)
    
    return analysis
  }
}
```

#### Variance Modeling
```javascript
function generateVarianceConfig(baseConfig) {
  return {
    playerBehavior: {
      checkInTimingVariance: baseConfig.variance.checkInTiming || 0.2,
      sessionLengthVariance: baseConfig.variance.sessionLength || 0.3,
      efficiencyVariance: baseConfig.variance.efficiency || 0.15,
      decisionDelayVariance: baseConfig.variance.decisionDelay || 0.4
    },
    gameRNG: {
      cropGrowthVariance: 0.1,
      adventureRewardVariance: 0.2,
      helperDiscoveryVariance: 0.3,
      criticalEventVariance: 0.15
    },
    systemVariance: {
      networkLatencySimulation: 0.05,
      devicePerformanceVariance: 0.1
    }
  }
}
```

#### Statistical Analysis Processing
```javascript
function performStatisticalAnalysis(simulationResults) {
  const metrics = extractKeyMetrics(simulationResults)
  
  const analysis = {
    summary: {
      totalRuns: simulationResults.length,
      successfulRuns: simulationResults.filter(r => r.success).length,
      averageCompletionTime: calculateMean(metrics.completionTimes),
      standardDeviation: calculateStandardDeviation(metrics.completionTimes)
    },
    
    confidenceIntervals: {
      completionTime: calculateConfidenceInterval(metrics.completionTimes, 0.95),
      finalGold: calculateConfidenceInterval(metrics.finalGold, 0.95),
      phaseProgression: calculateConfidenceInterval(metrics.phaseProgress, 0.95)
    },
    
    distributions: {
      completionTime: createHistogram(metrics.completionTimes, 20),
      resourceEfficiency: createHistogram(metrics.efficiency, 15),
      bottleneckFrequency: analyzeBottleneckPatterns(simulationResults)
    },
    
    outlierAnalysis: {
      extremelyFast: identifyOutliers(metrics.completionTimes, 'fast'),
      extremelySlow: identifyOutliers(metrics.completionTimes, 'slow'),
      resourceStarvation: identifyResourceStarvationCases(simulationResults)
    }
  }
  
  return analysis
}
```

### A/B Testing Engine

#### Experimental Design
The A/B testing system provides rigorous experimental methodology for comparing different game configurations:

```javascript
class ABTestingEngine {
  async runABTest(configA, configB, testConfig) {
    // Validate experimental design
    this.validateExperimentalDesign(configA, configB, testConfig)
    
    // Run parallel experiments
    const [resultsA, resultsB] = await Promise.all([
      this.runExperimentBatch('A', configA, testConfig),
      this.runExperimentBatch('B', configB, testConfig)
    ])
    
    // Perform statistical comparison
    const comparison = this.performStatisticalComparison(resultsA, resultsB)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(comparison)
    
    return {
      testA: resultsA,
      testB: resultsB,
      comparison,
      recommendations
    }
  }
  
  performStatisticalComparison(resultsA, resultsB) {
    const metrics = ['completionTime', 'finalGold', 'phaseProgression', 'playerSatisfaction']
    const comparisons = {}
    
    for (const metric of metrics) {
      const dataA = resultsA.map(r => r[metric]).filter(v => v != null)
      const dataB = resultsB.map(r => r[metric]).filter(v => v != null)
      
      comparisons[metric] = {
        meanA: calculateMean(dataA),
        meanB: calculateMean(dataB),
        difference: calculateMean(dataB) - calculateMean(dataA),
        percentChange: ((calculateMean(dataB) - calculateMean(dataA)) / calculateMean(dataA)) * 100,
        tTest: performTTest(dataA, dataB),
        effectSize: calculateCohenD(dataA, dataB),
        confidenceInterval: calculateDifferenceConfidenceInterval(dataA, dataB, 0.95)
      }
    }
    
    return {
      metrics: comparisons,
      overallSignificance: calculateOverallSignificance(comparisons),
      recommendation: determineRecommendation(comparisons)
    }
  }
}
```

#### Statistical Test Implementation
```javascript
function performTTest(dataA, dataB) {
  const meanA = calculateMean(dataA)
  const meanB = calculateMean(dataB)
  const varA = calculateVariance(dataA)
  const varB = calculateVariance(dataB)
  const nA = dataA.length
  const nB = dataB.length
  
  // Welch's t-test for unequal variances
  const pooledSE = Math.sqrt((varA / nA) + (varB / nB))
  const tStatistic = (meanB - meanA) / pooledSE
  
  // Degrees of freedom (Welch-Satterthwaite equation)
  const df = Math.pow((varA / nA) + (varB / nB), 2) / 
    (Math.pow(varA / nA, 2) / (nA - 1) + Math.pow(varB / nB, 2) / (nB - 1))
  
  const pValue = calculatePValue(tStatistic, df)
  
  return {
    tStatistic,
    degreesOfFreedom: df,
    pValue,
    significant: pValue < 0.05,
    significanceLevel: pValue < 0.01 ? 'highly significant' : 
                      pValue < 0.05 ? 'significant' : 'not significant'
  }
}
```

### Bottleneck Detection Engine

#### Automated Detection System
The bottleneck detection system automatically identifies progression obstacles through pattern analysis:

```javascript
class BottleneckDetector {
  analyzeSimulationForBottlenecks(simulationResult) {
    const bottlenecks = []
    
    // Energy management bottlenecks
    const energyBottlenecks = this.detectEnergyBottlenecks(simulationResult)
    bottlenecks.push(...energyBottlenecks)
    
    // Resource shortage bottlenecks
    const resourceBottlenecks = this.detectResourceBottlenecks(simulationResult)
    bottlenecks.push(...resourceBottlenecks)
    
    // Time gate bottlenecks
    const timeBottlenecks = this.detectTimeGateBottlenecks(simulationResult)
    bottlenecks.push(...timeBottlenecks)
    
    // Progression gate bottlenecks
    const progressionBottlenecks = this.detectProgressionBottlenecks(simulationResult)
    bottlenecks.push(...progressionBottlenecks)
    
    // Score and prioritize bottlenecks
    return this.scoreAndPrioritizeBottlenecks(bottlenecks)
  }
  
  detectEnergyBottlenecks(simulation) {
    const energyEvents = simulation.events.filter(e => e.category === 'energy')
    const energyWaitTimes = []
    
    let lastWaitStart = null
    for (const event of energyEvents) {
      if (event.type === 'energy_depleted') {
        lastWaitStart = event.timestamp
      } else if (event.type === 'action_available' && lastWaitStart) {
        energyWaitTimes.push(event.timestamp - lastWaitStart)
        lastWaitStart = null
      }
    }
    
    const bottlenecks = []
    if (energyWaitTimes.length > 0) {
      const averageWaitTime = calculateMean(energyWaitTimes)
      const totalWaitTime = energyWaitTimes.reduce((sum, time) => sum + time, 0)
      
      if (averageWaitTime > 30) { // 30 minutes average wait time
        bottlenecks.push({
          type: 'energy_management',
          severity: this.calculateSeverity(averageWaitTime, [30, 60, 120]),
          description: `Players frequently wait ${Math.round(averageWaitTime)} minutes for energy regeneration`,
          suggestion: 'Consider increasing energy regeneration rate or energy capacity',
          metrics: {
            averageWaitTime,
            totalWaitTime,
            waitFrequency: energyWaitTimes.length
          }
        })
      }
    }
    
    return bottlenecks
  }
}
```

#### Bottleneck Severity Scoring
```javascript
function calculateBottleneckSeverity(bottleneck) {
  let severity = 0
  
  // Frequency impact (how often does this affect players?)
  const frequencyScore = Math.min(bottleneck.frequency / 0.5, 1.0) * 0.3
  
  // Duration impact (how long are players stuck?)
  const durationScore = Math.min(bottleneck.averageDuration / 60, 1.0) * 0.4
  
  // Player retention impact (does this cause players to quit?)
  const retentionScore = bottleneck.correlationWithDropoff * 0.3
  
  severity = frequencyScore + durationScore + retentionScore
  
  return {
    overallSeverity: severity,
    frequencyImpact: frequencyScore,
    durationImpact: durationScore,
    retentionImpact: retentionScore,
    severityLevel: severity > 0.8 ? 'critical' : 
                   severity > 0.6 ? 'high' :
                   severity > 0.4 ? 'medium' : 'low'
  }
}
```

### Scenario Analysis Engine

#### Player Archetype Testing
```javascript
class ScenarioAnalyzer {
  async runArchetypeValidation() {
    const archetypes = [
      {
        name: 'Speedrunner',
        profile: {
          checkIns: { weekday: 8, weekend: 12 },
          sessionLength: { weekday: 45, weekend: 180 },
          efficiency: 0.95,
          variance: { efficiency: 0.05, timing: 0.1 }
        }
      },
      {
        name: 'Casual Player',
        profile: {
          checkIns: { weekday: 3, weekend: 5 },
          sessionLength: { weekday: 15, weekend: 45 },
          efficiency: 0.7,
          variance: { efficiency: 0.2, timing: 0.3 }
        }
      },
      {
        name: 'Weekend Warrior',
        profile: {
          checkIns: { weekday: 1, weekend: 8 },
          sessionLength: { weekday: 10, weekend: 120 },
          efficiency: 0.8,
          variance: { efficiency: 0.15, timing: 0.25 }
        }
      }
    ]
    
    const results = {}
    for (const archetype of archetypes) {
      results[archetype.name] = await this.runArchetypeAnalysis(archetype)
    }
    
    return this.compareArchetypeResults(results)
  }
  
  async runArchetypeAnalysis(archetype) {
    const config = {
      runs: 50,
      maxDays: 14,
      playerProfile: archetype.profile
    }
    
    const simulations = await this.monteCarloManager.runMonteCarlo(config)
    
    return {
      archetype: archetype.name,
      completionRate: this.calculateCompletionRate(simulations),
      averageProgression: this.calculateAverageProgression(simulations),
      bottlenecks: this.identifyArchetypeBottlenecks(simulations),
      satisfaction: this.estimatePlayerSatisfaction(simulations)
    }
  }
}
```

### Advanced Analytics

#### Trend Analysis
```javascript
function performTrendAnalysis(historicalResults) {
  const trends = {
    completionTime: analyzeTrend(historicalResults.map(r => r.completionTime)),
    playerSatisfaction: analyzeTrend(historicalResults.map(r => r.satisfaction)),
    resourceEfficiency: analyzeTrend(historicalResults.map(r => r.efficiency))
  }
  
  return {
    trends,
    projections: generateProjections(trends),
    anomalies: detectAnomalies(historicalResults),
    recommendations: generateTrendRecommendations(trends)
  }
}

function analyzeTrend(data) {
  const linearRegression = calculateLinearRegression(data)
  const seasonality = detectSeasonality(data)
  
  return {
    direction: linearRegression.slope > 0 ? 'improving' : 'declining',
    strength: Math.abs(linearRegression.correlation),
    slope: linearRegression.slope,
    rsquared: linearRegression.rSquared,
    seasonality: seasonality,
    forecast: generateForecast(data, 5) // 5-period forecast
  }
}
```

#### Predictive Modeling
```javascript
class PredictiveModel {
  trainPlayerBehaviorModel(historicalData) {
    // Simple linear model for player behavior prediction
    const features = this.extractFeatures(historicalData)
    const labels = historicalData.map(d => d.completionTime)
    
    const model = this.trainLinearRegression(features, labels)
    
    return {
      model,
      accuracy: this.validateModel(model, features, labels),
      featureImportance: this.calculateFeatureImportance(model, features)
    }
  }
  
  predictPlayerOutcome(playerProfile, gameConfig) {
    const features = this.extractFeaturesFromProfile(playerProfile, gameConfig)
    const prediction = this.model.predict(features)
    
    return {
      expectedCompletionTime: prediction.completionTime,
      confidence: prediction.confidence,
      riskFactors: this.identifyRiskFactors(features),
      recommendations: this.generatePersonalizedRecommendations(playerProfile, prediction)
    }
  }
}
```

### Performance Optimization

#### Efficient Data Processing
```javascript
function optimizeAnalysisPerformance() {
  // Use streaming analysis for large datasets
  const streamProcessor = new StreamingAnalyzer()
  
  // Implement result caching
  const resultCache = new LRUCache(100)
  
  // Parallel processing of independent analyses
  async function parallelAnalysis(data) {
    const tasks = [
      () => calculateBasicStatistics(data),
      () => performCorrelationAnalysis(data),
      () => detectOutliers(data),
      () => generateVisualizationData(data)
    ]
    
    return Promise.all(tasks.map(task => task()))
  }
}
```

#### Memory-Efficient Processing
```javascript
class StreamingStatistics {
  constructor() {
    this.count = 0
    this.sum = 0
    this.sumSquares = 0
    this.min = Infinity
    this.max = -Infinity
  }
  
  addValue(value) {
    this.count++
    this.sum += value
    this.sumSquares += value * value
    this.min = Math.min(this.min, value)
    this.max = Math.max(this.max, value)
  }
  
  getStatistics() {
    const mean = this.sum / this.count
    const variance = (this.sumSquares / this.count) - (mean * mean)
    
    return {
      count: this.count,
      mean,
      variance,
      standardDeviation: Math.sqrt(variance),
      min: this.min,
      max: this.max
    }
  }
}
```

### Integration with Visualization

#### Chart Data Generation
```javascript
function generateAnalysisCharts(analysisResults) {
  return {
    distributionChart: {
      type: 'histogram',
      data: createHistogramData(analysisResults.distributions.completionTime),
      options: {
        title: 'Completion Time Distribution',
        xAxis: 'Time (hours)',
        yAxis: 'Frequency'
      }
    },
    
    confidenceIntervalChart: {
      type: 'errorBar',
      data: createConfidenceIntervalData(analysisResults.confidenceIntervals),
      options: {
        title: 'Key Metrics with 95% Confidence Intervals',
        showConfidenceBands: true
      }
    },
    
    bottleneckChart: {
      type: 'radar',
      data: createBottleneckRadarData(analysisResults.bottlenecks),
      options: {
        title: 'Bottleneck Severity Analysis',
        scales: { r: { min: 0, max: 1 } }
      }
    }
  }
}
```

### Testing and Validation

#### Analysis Validation Framework
```javascript
async function validateAnalysisFramework() {
  const validationTests = [
    {
      name: 'Statistical Accuracy',
      test: () => validateStatisticalCalculations()
    },
    {
      name: 'Monte Carlo Convergence',
      test: () => validateMonteCarloConvergence()
    },
    {
      name: 'A/B Test Power',
      test: () => validateABTestPower()
    },
    {
      name: 'Bottleneck Detection Sensitivity',
      test: () => validateBottleneckDetection()
    }
  ]
  
  const results = []
  for (const test of validationTests) {
    try {
      const result = await test.test()
      results.push({ name: test.name, success: true, result })
    } catch (error) {
      results.push({ name: test.name, success: false, error: error.message })
    }
  }
  
  return results
}
```

## Code References

### Core Implementation Files
- `/src/utils/monteCarloManager.js` - Monte Carlo statistical analysis engine
- `/src/utils/abTestManager.js` - A/B testing and experimental design
- `/src/utils/bottleneckDetector.js` - Automated bottleneck identification
- `/src/utils/scenarioAnalyzer.js` - Player archetype and scenario testing

### Component Integration
- `/src/components/MonteCarloPanel.vue` - Monte Carlo analysis interface
- `/src/components/ABTestingPanel.vue` - A/B testing interface
- `/src/components/BottleneckAnalyzer.vue` - Bottleneck detection interface
- `/src/components/AnalysisResults.vue` - Results visualization and reporting

### Statistical Libraries and Utilities
- `/src/utils/statistics.js` - Core statistical functions and calculations
- `/src/utils/dataProcessing.js` - Data transformation and preprocessing
- `/src/utils/visualization.js` - Chart data generation and formatting
- `/src/utils/reportGeneration.js` - Automated report creation

### Data Management
- `/src/stores/results.js` - Analysis results storage and management
- `/src/utils/dataExport.js` - Results export in multiple formats
- `/src/utils/historicalAnalysis.js` - Trend analysis and historical comparison

## Future Considerations

### Advanced Statistical Methods
- **Machine Learning Integration**: Implement predictive models using TensorFlow.js
- **Bayesian Analysis**: Add Bayesian statistical methods for more nuanced insights
- **Time Series Analysis**: Advanced forecasting and trend detection
- **Multivariate Analysis**: Complex relationships between multiple game variables

### Enhanced Automation
- **Automated Recommendations**: AI-driven suggestions for game balance improvements
- **Continuous Analysis**: Real-time analysis of live game data
- **Adaptive Testing**: Dynamic A/B tests that adapt based on results
- **Anomaly Detection**: Automated detection of unusual patterns or behaviors

### Integration Enhancements
- **External Data Sources**: Integration with real player data from live games
- **Cloud Analytics**: Distributed analysis using cloud computing resources
- **Real-time Dashboards**: Live monitoring and analysis interfaces
- **API Integration**: REST APIs for external tools and services
