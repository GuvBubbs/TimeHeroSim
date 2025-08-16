<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSimulationStore } from '../stores/simulation.js'
import { useGameValuesStore } from '../stores/gameValues.js'

const simulation = useSimulationStore()
const gameValues = useGameValuesStore()

// Bottleneck analysis state
const analysis = ref(null)
const isAnalyzing = ref(false)
const selectedTimeRange = ref('full') // full, early, mid, late
const selectedBottleneckType = ref('all') // all, resource, time, progression

// Analysis configuration
const config = ref({
  thresholds: {
    waitTimeThreshold: 60, // minutes of waiting considered a bottleneck
    resourceCapRatio: 0.9, // 90% resource cap utilization
    phaseTransitionDelay: 1.5, // multiplier for expected phase transition time
    helperEfficiencyThreshold: 0.6 // below 60% efficiency is problematic
  },
  timeRanges: {
    early: { start: 1, end: 7 },
    mid: { start: 8, end: 21 },
    late: { start: 22, end: 35 }
  }
})

// Computed properties
const filteredBottlenecks = computed(() => {
  if (!analysis.value) return []
  
  let bottlenecks = analysis.value.bottlenecks
  
  // Filter by time range
  if (selectedTimeRange.value !== 'full') {
    const range = config.value.timeRanges[selectedTimeRange.value]
    bottlenecks = bottlenecks.filter(b => 
      b.timeRange.start >= range.start && b.timeRange.end <= range.end
    )
  }
  
  // Filter by type
  if (selectedBottleneckType.value !== 'all') {
    bottlenecks = bottlenecks.filter(b => b.type === selectedBottleneckType.value)
  }
  
  return bottlenecks.sort((a, b) => b.severity - a.severity)
})

const severityStats = computed(() => {
  if (!analysis.value) return { critical: 0, high: 0, medium: 0, low: 0 }
  
  const stats = { critical: 0, high: 0, medium: 0, low: 0 }
  analysis.value.bottlenecks.forEach(b => {
    stats[b.severityLevel]++
  })
  return stats
})

// Methods
async function analyzeBottlenecks() {
  if (!simulation.gameState || simulation.gameState.resourceHistory.length === 0) {
    console.warn('No simulation data available for bottleneck analysis')
    return
  }

  isAnalyzing.value = true
  
  try {
    // Simulate analysis delay for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const gameState = simulation.gameState
    const resourceHistory = gameState.resourceHistory || []
    const phaseHistory = gameState.phaseHistory || []
    const upgradeHistory = gameState.upgradeHistory || []
    
    analysis.value = {
      timestamp: Date.now(),
      gameDay: gameState.day,
      totalBottlenecks: 0,
      bottlenecks: [],
      recommendations: [],
      timeline: [],
      summary: {}
    }
    
    // Analyze different types of bottlenecks
    const resourceBottlenecks = analyzeResourceBottlenecks(resourceHistory)
    const progressionBottlenecks = analyzeProgressionBottlenecks(phaseHistory, upgradeHistory)
    const timeBottlenecks = analyzeTimeBottlenecks(gameState)
    const helperBottlenecks = analyzeHelperBottlenecks(gameState)
    
    // Combine all bottlenecks
    analysis.value.bottlenecks = [
      ...resourceBottlenecks,
      ...progressionBottlenecks,
      ...timeBottlenecks,
      ...helperBottlenecks
    ]
    
    // Calculate severity and create timeline
    analysis.value.bottlenecks.forEach(bottleneck => {
      bottleneck.severity = calculateSeverity(bottleneck)
      bottleneck.severityLevel = getSeverityLevel(bottleneck.severity)
    })
    
    analysis.value.totalBottlenecks = analysis.value.bottlenecks.length
    analysis.value.timeline = createBottleneckTimeline(analysis.value.bottlenecks)
    analysis.value.recommendations = generateRecommendations(analysis.value.bottlenecks)
    analysis.value.summary = generateSummary(analysis.value.bottlenecks)
    
    console.log('✅ Bottleneck analysis completed:', analysis.value)
  } catch (error) {
    console.error('❌ Bottleneck analysis error:', error)
  } finally {
    isAnalyzing.value = false
  }
}

function analyzeResourceBottlenecks(resourceHistory) {
  const bottlenecks = []
  
  if (resourceHistory.length < 10) return bottlenecks
  
  // Analyze energy bottlenecks
  const energyHistory = resourceHistory.map(r => ({
    day: r.gameDay,
    hour: r.hour,
    current: r.resources.energy.current,
    cap: r.resources.energy.cap,
    utilization: r.resources.energy.current / r.resources.energy.cap
  }))
  
  // Find periods of low energy
  let lowEnergyPeriods = []
  let currentPeriod = null
  
  energyHistory.forEach(point => {
    if (point.utilization < 0.2) { // Below 20% energy
      if (!currentPeriod) {
        currentPeriod = { start: point.day, startHour: point.hour, duration: 0 }
      }
      currentPeriod.duration++
    } else {
      if (currentPeriod && currentPeriod.duration > config.value.thresholds.waitTimeThreshold) {
        lowEnergyPeriods.push({
          ...currentPeriod,
          end: point.day,
          endHour: point.hour
        })
      }
      currentPeriod = null
    }
  })
  
  lowEnergyPeriods.forEach(period => {
    bottlenecks.push({
      id: `energy_low_${period.start}`,
      type: 'resource',
      category: 'Energy Shortage',
      description: `Prolonged low energy period lasting ${Math.round(period.duration/60)} hours`,
      timeRange: { start: period.start, end: period.end },
      impact: 'Blocks all energy-consuming activities',
      duration: period.duration,
      affectedSystems: ['adventure', 'mining', 'actions'],
      data: { energyUtilization: 0.2, duration: period.duration }
    })
  })
  
  // Analyze resource cap bottlenecks
  const lastPoint = resourceHistory[resourceHistory.length - 1]
  if (lastPoint) {
    Object.entries(lastPoint.resources.materials).forEach(([material, amount]) => {
      // Assume cap is amount * 2 for materials (simplified)
      const estimatedCap = Math.max(amount * 2, 100)
      const utilization = amount / estimatedCap
      
      if (utilization > config.value.thresholds.resourceCapRatio) {
        bottlenecks.push({
          id: `material_cap_${material}`,
          type: 'resource',
          category: 'Storage Overflow',
          description: `${material} storage near capacity (${Math.round(utilization * 100)}%)`,
          timeRange: { start: lastPoint.gameDay, end: lastPoint.gameDay },
          impact: 'Wastes excess materials from activities',
          affectedSystems: ['adventure', 'mining', 'crafting'],
          data: { material, utilization, amount }
        })
      }
    })
  }
  
  return bottlenecks
}

function analyzeProgressionBottlenecks(phaseHistory, upgradeHistory) {
  const bottlenecks = []
  
  // Analyze phase transition delays
  const expectedPhaseDurations = {
    tutorial: 2,
    early: 5,
    mid: 10,
    late: 14
  }
  
  phaseHistory.forEach(phase => {
    if (phase.duration && expectedPhaseDurations[phase.phase]) {
      const expected = expectedPhaseDurations[phase.phase]
      const actual = phase.duration
      const ratio = actual / expected
      
      if (ratio > config.value.thresholds.phaseTransitionDelay) {
        bottlenecks.push({
          id: `phase_delay_${phase.phase}`,
          type: 'progression',
          category: 'Slow Phase Transition',
          description: `${phase.phase} phase took ${actual} days (expected ~${expected} days)`,
          timeRange: { start: phase.startDay, end: phase.startDay + actual },
          impact: 'Delayed access to new features and content',
          duration: actual - expected,
          affectedSystems: ['progression', 'unlocks'],
          data: { phase: phase.phase, expected, actual, ratio }
        })
      }
    }
  })
  
  // Analyze upgrade gaps
  if (upgradeHistory.length > 1) {
    for (let i = 1; i < upgradeHistory.length; i++) {
      const gap = upgradeHistory[i].day - upgradeHistory[i-1].day
      if (gap > 3) { // More than 3 days between upgrades
        bottlenecks.push({
          id: `upgrade_gap_${i}`,
          type: 'progression',
          category: 'Upgrade Delay',
          description: `${gap} day gap between upgrades`,
          timeRange: { start: upgradeHistory[i-1].day, end: upgradeHistory[i].day },
          impact: 'Slower capability growth and efficiency improvements',
          duration: gap,
          affectedSystems: ['upgrades', 'efficiency'],
          data: { gap, prevUpgrade: upgradeHistory[i-1], nextUpgrade: upgradeHistory[i] }
        })
      }
    }
  }
  
  return bottlenecks
}

function analyzeTimeBottlenecks(gameState) {
  const bottlenecks = []
  
  // Analyze current action efficiency
  if (gameState.heroes.currentAction) {
    const action = gameState.heroes.currentAction
    const efficiency = simulation.currentEfficiency
    
    if (efficiency < config.value.thresholds.helperEfficiencyThreshold) {
      bottlenecks.push({
        id: `action_inefficiency_${gameState.day}`,
        type: 'time',
        category: 'Low Player Efficiency',
        description: `Current action efficiency at ${Math.round(efficiency * 100)}%`,
        timeRange: { start: gameState.day, end: gameState.day },
        impact: 'Slower completion of tasks and suboptimal resource generation',
        affectedSystems: ['all_actions'],
        data: { action: action.type, efficiency, currentAction: action }
      })
    }
  }
  
  // Check for idle time
  const currentHour = gameState.time.hour
  if (!gameState.heroes.currentAction && currentHour >= 8 && currentHour <= 22) {
    bottlenecks.push({
      id: `idle_time_${gameState.day}_${currentHour}`,
      type: 'time',
      category: 'Idle Time',
      description: 'Player character is idle during active hours',
      timeRange: { start: gameState.day, end: gameState.day },
      impact: 'Wasted time that could be used for progression activities',
      affectedSystems: ['time_management'],
      data: { hour: currentHour, location: gameState.heroes.currentLocation }
    })
  }
  
  return bottlenecks
}

function analyzeHelperBottlenecks(gameState) {
  const bottlenecks = []
  
  gameState.helpers.forEach((helper, index) => {
    if (helper.efficiency < config.value.thresholds.helperEfficiencyThreshold) {
      bottlenecks.push({
        id: `helper_inefficiency_${helper.id}`,
        type: 'progression',
        category: 'Helper Inefficiency',
        description: `${helper.type} helper operating at ${Math.round(helper.efficiency * 100)}% efficiency`,
        timeRange: { start: gameState.day, end: gameState.day },
        impact: 'Reduced automation benefits and slower resource generation',
        affectedSystems: ['automation', helper.type],
        data: { helper, efficiency: helper.efficiency }
      })
    }
  })
  
  // Check for missing helpers in appropriate phases
  if (gameState.currentPhase === 'mid' && gameState.helpers.length === 0) {
    bottlenecks.push({
      id: `missing_helpers_${gameState.day}`,
      type: 'progression',
      category: 'Missing Automation',
      description: 'No helpers discovered by mid-game phase',
      timeRange: { start: gameState.day, end: gameState.day },
      impact: 'Manual tasks that should be automated, limiting scalability',
      affectedSystems: ['automation', 'progression'],
      data: { phase: gameState.currentPhase, helperCount: gameState.helpers.length }
    })
  }
  
  return bottlenecks
}

function calculateSeverity(bottleneck) {
  let severity = 0
  
  // Base severity by type
  const baseSeverity = {
    resource: 0.6,
    progression: 0.8,
    time: 0.4
  }
  severity += baseSeverity[bottleneck.type] || 0.5
  
  // Duration impact
  if (bottleneck.duration) {
    severity += Math.min(bottleneck.duration / 10, 0.3) // Up to 0.3 for long durations
  }
  
  // System impact
  const systemCount = bottleneck.affectedSystems?.length || 1
  severity += Math.min(systemCount * 0.1, 0.3)
  
  // Specific adjustments
  if (bottleneck.category === 'Energy Shortage') severity += 0.2
  if (bottleneck.category === 'Slow Phase Transition') severity += 0.3
  if (bottleneck.category === 'Missing Automation') severity += 0.4
  
  return Math.min(severity, 1.0)
}

function getSeverityLevel(severity) {
  if (severity >= 0.8) return 'critical'
  if (severity >= 0.6) return 'high'
  if (severity >= 0.4) return 'medium'
  return 'low'
}

function createBottleneckTimeline(bottlenecks) {
  const timeline = []
  
  bottlenecks.forEach(bottleneck => {
    timeline.push({
      day: bottleneck.timeRange.start,
      type: bottleneck.type,
      category: bottleneck.category,
      severity: bottleneck.severity,
      description: bottleneck.description
    })
  })
  
  return timeline.sort((a, b) => a.day - b.day)
}

function generateRecommendations(bottlenecks) {
  const recommendations = []
  
  // Group bottlenecks by category
  const categories = {}
  bottlenecks.forEach(b => {
    if (!categories[b.category]) categories[b.category] = []
    categories[b.category].push(b)
  })
  
  // Generate specific recommendations
  Object.entries(categories).forEach(([category, categoryBottlenecks]) => {
    switch (category) {
      case 'Energy Shortage':
        recommendations.push({
          type: 'balance_change',
          priority: 'high',
          target: 'energy_generation',
          change: 'increase',
          amount: 0.15,
          description: 'Increase energy generation from crops by 15% to reduce energy shortages',
          affectedBottlenecks: categoryBottlenecks.length
        })
        break
        
      case 'Slow Phase Transition':
        recommendations.push({
          type: 'balance_change',
          priority: 'high',
          target: 'phase_requirements',
          change: 'reduce',
          amount: 0.1,
          description: 'Reduce phase transition requirements by 10% to improve pacing',
          affectedBottlenecks: categoryBottlenecks.length
        })
        break
        
      case 'Missing Automation':
        recommendations.push({
          type: 'balance_change',
          priority: 'medium',
          target: 'helper_discovery',
          change: 'increase',
          amount: 0.25,
          description: 'Increase helper discovery rates by 25% to improve automation timeline',
          affectedBottlenecks: categoryBottlenecks.length
        })
        break
        
      case 'Storage Overflow':
        recommendations.push({
          type: 'balance_change',
          priority: 'medium',
          target: 'storage_capacity',
          change: 'increase',
          amount: 0.2,
          description: 'Increase material storage capacity by 20% to prevent waste',
          affectedBottlenecks: categoryBottlenecks.length
        })
        break
    }
  })
  
  return recommendations
}

function generateSummary(bottlenecks) {
  const summary = {
    totalIssues: bottlenecks.length,
    criticalIssues: bottlenecks.filter(b => b.severityLevel === 'critical').length,
    majorConcerns: [],
    overallHealth: 'good'
  }
  
  // Determine overall health
  if (summary.criticalIssues > 2) {
    summary.overallHealth = 'poor'
  } else if (summary.criticalIssues > 0 || bottlenecks.filter(b => b.severityLevel === 'high').length > 3) {
    summary.overallHealth = 'concerning'
  } else if (bottlenecks.length > 5) {
    summary.overallHealth = 'fair'
  }
  
  // Identify major concerns
  const categoryCount = {}
  bottlenecks.forEach(b => {
    categoryCount[b.category] = (categoryCount[b.category] || 0) + 1
  })
  
  Object.entries(categoryCount).forEach(([category, count]) => {
    if (count >= 2) {
      summary.majorConcerns.push(`Multiple ${category.toLowerCase()} issues (${count})`)
    }
  })
  
  return summary
}

function exportAnalysis() {
  if (!analysis.value) return

  const exportData = {
    analysis: analysis.value,
    config: config.value,
    gameState: {
      day: simulation.gameState.day,
      phase: simulation.gameState.currentPhase,
      resources: simulation.gameState.resources
    },
    timestamp: new Date().toISOString()
  }

  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `bottleneck-analysis-day-${simulation.gameState.day}-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(url)
}

// Format helpers
function formatSeverity(level) {
  const icons = {
    critical: '🔴',
    high: '🟠', 
    medium: '🟡',
    low: '🟢'
  }
  return `${icons[level]} ${level.charAt(0).toUpperCase() + level.slice(1)}`
}

function formatDay(day) {
  return `Day ${day}`
}
</script>

<template>
  <div class="bottleneck-analyzer">
    <h2>🔍 Bottleneck Analyzer</h2>
    <p class="description">
      Automatically detect and analyze progression bottlenecks, resource shortages, 
      and efficiency issues in the current simulation.
    </p>

    <!-- Controls -->
    <div class="controls">
      <button 
        @click="analyzeBottlenecks" 
        :disabled="isAnalyzing || !simulation.gameState"
        class="btn-primary"
      >
        {{ isAnalyzing ? '🔄 Analyzing...' : '🔍 Analyze Current Simulation' }}
      </button>
      
      <div class="filters" v-if="analysis">
        <select v-model="selectedTimeRange">
          <option value="full">Full Timeline</option>
          <option value="early">Early Game (Days 1-7)</option>
          <option value="mid">Mid Game (Days 8-21)</option>
          <option value="late">Late Game (Days 22+)</option>
        </select>
        
        <select v-model="selectedBottleneckType">
          <option value="all">All Types</option>
          <option value="resource">Resource Issues</option>
          <option value="progression">Progression Issues</option>
          <option value="time">Time/Efficiency Issues</option>
        </select>
      </div>
    </div>

    <!-- Summary -->
    <div class="section" v-if="analysis">
      <h3>📊 Analysis Summary</h3>
      
      <div class="summary-cards">
        <div class="summary-card overall-health" :class="'health-' + analysis.summary.overallHealth">
          <h4>Overall Health</h4>
          <div class="health-indicator">
            {{ analysis.summary.overallHealth.charAt(0).toUpperCase() + analysis.summary.overallHealth.slice(1) }}
          </div>
          <div class="health-details">
            {{ analysis.summary.totalIssues }} total issues found
          </div>
        </div>

        <div class="summary-card">
          <h4>Severity Breakdown</h4>
          <div class="severity-stats">
            <div class="stat">
              <span class="severity-icon">🔴</span>
              <span>Critical: {{ severityStats.critical }}</span>
            </div>
            <div class="stat">
              <span class="severity-icon">🟠</span>
              <span>High: {{ severityStats.high }}</span>
            </div>
            <div class="stat">
              <span class="severity-icon">🟡</span>
              <span>Medium: {{ severityStats.medium }}</span>
            </div>
            <div class="stat">
              <span class="severity-icon">🟢</span>
              <span>Low: {{ severityStats.low }}</span>
            </div>
          </div>
        </div>

        <div class="summary-card" v-if="analysis.summary.majorConcerns.length > 0">
          <h4>Major Concerns</h4>
          <ul class="concerns-list">
            <li v-for="concern in analysis.summary.majorConcerns" :key="concern">
              {{ concern }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottlenecks List -->
    <div class="section" v-if="filteredBottlenecks.length > 0">
      <h3>🚫 Identified Bottlenecks</h3>
      
      <div class="bottlenecks-list">
        <div 
          v-for="bottleneck in filteredBottlenecks" 
          :key="bottleneck.id"
          class="bottleneck-item"
          :class="'severity-' + bottleneck.severityLevel"
        >
          <div class="bottleneck-header">
            <div class="bottleneck-title">
              <span class="severity">{{ formatSeverity(bottleneck.severityLevel) }}</span>
              <span class="category">{{ bottleneck.category }}</span>
            </div>
            <div class="bottleneck-timing">
              {{ formatDay(bottleneck.timeRange.start) }}
              <span v-if="bottleneck.timeRange.end !== bottleneck.timeRange.start">
                - {{ formatDay(bottleneck.timeRange.end) }}
              </span>
            </div>
          </div>
          
          <div class="bottleneck-description">
            {{ bottleneck.description }}
          </div>
          
          <div class="bottleneck-impact">
            <strong>Impact:</strong> {{ bottleneck.impact }}
          </div>
          
          <div class="bottleneck-systems" v-if="bottleneck.affectedSystems">
            <strong>Affected Systems:</strong> 
            <span class="systems-list">
              {{ bottleneck.affectedSystems.join(', ') }}
            </span>
          </div>
          
          <div class="bottleneck-data" v-if="bottleneck.data">
            <details>
              <summary>Technical Details</summary>
              <pre>{{ JSON.stringify(bottleneck.data, null, 2) }}</pre>
            </details>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="section" v-if="analysis && analysis.recommendations.length > 0">
      <h3>💡 Recommendations</h3>
      
      <div class="recommendations-list">
        <div 
          v-for="rec in analysis.recommendations" 
          :key="rec.description"
          class="recommendation"
          :class="'priority-' + rec.priority"
        >
          <div class="rec-header">
            <span class="rec-type">{{ rec.type.replace('_', ' ').toUpperCase() }}</span>
            <span class="rec-priority">{{ rec.priority.toUpperCase() }} PRIORITY</span>
          </div>
          
          <div class="rec-description">
            {{ rec.description }}
          </div>
          
          <div class="rec-impact">
            Will address {{ rec.affectedBottlenecks }} bottleneck(s)
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline -->
    <div class="section" v-if="analysis && analysis.timeline.length > 0">
      <h3>📅 Bottleneck Timeline</h3>
      
      <div class="timeline">
        <div 
          v-for="event in analysis.timeline" 
          :key="event.day + event.category"
          class="timeline-event"
          :class="'severity-' + getSeverityLevel(event.severity)"
        >
          <div class="timeline-day">{{ formatDay(event.day) }}</div>
          <div class="timeline-content">
            <div class="timeline-category">{{ event.category }}</div>
            <div class="timeline-description">{{ event.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export -->
    <div class="actions" v-if="analysis">
      <button @click="exportAnalysis" class="btn-secondary">
        💾 Export Analysis
      </button>
    </div>

    <!-- No Data State -->
    <div class="no-data" v-if="!analysis && !isAnalyzing">
      <p>Run a simulation first to generate data for bottleneck analysis.</p>
    </div>
  </div>
</template>

<style scoped>
.bottleneck-analyzer {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.description {
  color: #6c757d;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.section:last-child {
  border-bottom: none;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 0.5rem;
}

.filters select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  background: white;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background: #f8f9fa;
}

.summary-card h4 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
}

.overall-health {
  text-align: center;
}

.health-indicator {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.health-good .health-indicator { color: #28a745; }
.health-fair .health-indicator { color: #ffc107; }
.health-concerning .health-indicator { color: #fd7e14; }
.health-poor .health-indicator { color: #dc3545; }

.health-details {
  font-size: 0.9rem;
  color: #6c757d;
}

.severity-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.severity-icon {
  font-size: 1rem;
}

.concerns-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #495057;
}

.concerns-list li {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.bottlenecks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bottleneck-item {
  padding: 1rem;
  border-radius: 0.25rem;
  border-left: 4px solid;
}

.severity-critical {
  background: #f8d7da;
  border-left-color: #dc3545;
}

.severity-high {
  background: #fff3cd;
  border-left-color: #ffc107;
}

.severity-medium {
  background: #cce7ff;
  border-left-color: #007bff;
}

.severity-low {
  background: #d4edda;
  border-left-color: #28a745;
}

.bottleneck-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.bottleneck-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.severity {
  font-size: 0.9rem;
}

.category {
  font-weight: 600;
  color: #495057;
}

.bottleneck-timing {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.bottleneck-description {
  margin-bottom: 0.75rem;
  color: #495057;
  line-height: 1.4;
}

.bottleneck-impact,
.bottleneck-systems {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #495057;
}

.systems-list {
  font-style: italic;
  color: #6c757d;
}

.bottleneck-data {
  margin-top: 0.75rem;
}

.bottleneck-data details {
  font-size: 0.8rem;
}

.bottleneck-data summary {
  cursor: pointer;
  color: #007bff;
  font-weight: 500;
}

.bottleneck-data pre {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  overflow-x: auto;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation {
  padding: 1rem;
  border-radius: 0.25rem;
  border-left: 4px solid;
}

.priority-high {
  background: #fff3cd;
  border-left-color: #ffc107;
}

.priority-medium {
  background: #cce7ff;
  border-left-color: #007bff;
}

.priority-low {
  background: #f8f9fa;
  border-left-color: #6c757d;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.rec-type {
  font-weight: 600;
  color: #495057;
}

.rec-priority {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6c757d;
}

.rec-description {
  margin-bottom: 0.5rem;
  color: #495057;
  line-height: 1.4;
}

.rec-impact {
  font-size: 0.9rem;
  color: #6c757d;
  font-style: italic;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.timeline-event {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border-left: 3px solid;
}

.timeline-day {
  min-width: 70px;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.timeline-content {
  flex: 1;
}

.timeline-category {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.25rem;
}

.timeline-description {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.3;
}

.actions {
  text-align: center;
  margin-top: 1.5rem;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.no-data p {
  margin: 0;
  font-size: 1.1rem;
}
</style>
