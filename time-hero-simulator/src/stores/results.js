import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    compareReports
  }
})
