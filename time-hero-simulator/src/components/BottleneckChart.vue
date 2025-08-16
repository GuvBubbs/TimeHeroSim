<template>
  <div class="bottleneck-chart">
    <div class="chart-header">
      <h4>🚨 Bottleneck Analysis</h4>
      <div class="chart-controls">
        <select v-model="timeRange">
          <option value="24">Last 24 Hours</option>
          <option value="72">Last 3 Days</option>
          <option value="168">Last Week</option>
          <option value="all">All Time</option>
        </select>
        <select v-model="bottleneckType">
          <option value="all">All Bottlenecks</option>
          <option value="storage">Storage Caps</option>
          <option value="energy">Energy Shortages</option>
          <option value="materials">Material Shortages</option>
          <option value="time">Time Inefficiencies</option>
        </select>
      </div>
    </div>
    
    <div class="chart-container">
      <Doughnut 
        v-if="chartData.datasets.length > 0"
        :data="chartData" 
        :options="chartOptions" 
        class="chart-canvas"
      />
      <div v-else class="no-data">
        <p>No bottlenecks detected yet</p>
      </div>
    </div>

    <div class="bottleneck-details">
      <h5>Top Bottlenecks</h5>
      <div class="bottleneck-list">
        <div 
          v-for="bottleneck in topBottlenecks" 
          :key="bottleneck.type"
          class="bottleneck-item"
          :class="['severity-' + bottleneck.severity]"
        >
          <div class="bottleneck-info">
            <div class="bottleneck-icon">{{ bottleneck.icon }}</div>
            <div class="bottleneck-content">
              <div class="bottleneck-name">{{ bottleneck.name }}</div>
              <div class="bottleneck-description">{{ bottleneck.description }}</div>
              <div class="bottleneck-impact">
                Impact: {{ bottleneck.impact }}% of time lost
              </div>
            </div>
          </div>
          <div class="bottleneck-recommendation">
            <strong>Recommendation:</strong> {{ bottleneck.recommendation }}
          </div>
        </div>
      </div>
    </div>

    <div class="bottleneck-trends">
      <Line 
        v-if="trendData.datasets.length > 0"
        :data="trendData" 
        :options="trendOptions" 
        class="trend-chart"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { useSimulationStore } from '../stores/simulation.js'
import { useResultsStore } from '../stores/results.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const simulation = useSimulationStore()
const results = useResultsStore()
const timeRange = ref('72')
const bottleneckType = ref('all')

const chartData = computed(() => {
  const bottlenecks = getBottleneckData()
  
  if (bottlenecks.length === 0) {
    return { labels: [], datasets: [] }
  }

  const labels = bottlenecks.map(b => b.name)
  const data = bottlenecks.map(b => b.impact)
  const backgroundColors = bottlenecks.map(b => {
    switch (b.severity) {
      case 'high': return '#dc3545'
      case 'medium': return '#ffc107'
      case 'low': return '#28a745'
      default: return '#6c757d'
    }
  })

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: backgroundColors,
      borderColor: backgroundColors.map(color => color + '80'),
      borderWidth: 2
    }]
  }
})

const trendData = computed(() => {
  const history = simulation.bottleneckHistory || []
  
  if (history.length === 0) {
    return { labels: [], datasets: [] }
  }

  const labels = history.map(entry => `Day ${entry.day}`)
  const data = history.map(entry => entry.severity)

  return {
    labels,
    datasets: [{
      label: 'Bottleneck Severity',
      data,
      borderColor: '#dc3545',
      backgroundColor: '#dc354520',
      tension: 0.4
    }]
  }
})

const topBottlenecks = computed(() => {
  return getBottleneckData().slice(0, 5)
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || ''
          const value = context.parsed || 0
          return `${label}: ${value.toFixed(1)}% impact`
        }
      }
    }
  }
}

const trendOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Severity Score'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Time'
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
}

function getBottleneckData() {
  // Simulate bottleneck analysis based on current game state and history
  const bottlenecks = []
  const state = simulation.gameState

  // Energy storage bottleneck
  if (state.resources.energy.current >= state.resources.energy.cap * 0.9) {
    bottlenecks.push({
      type: 'energy_cap',
      name: 'Energy Storage Cap',
      description: 'Energy frequently hitting storage limit',
      icon: '⚡',
      severity: 'high',
      impact: 25.5,
      recommendation: 'Build Storage Shed II to increase energy capacity'
    })
  }

  // Material shortage bottleneck
  const materials = state.resources.materials
  if (materials.stone < 5 && state.currentPhase !== 'tutorial') {
    bottlenecks.push({
      type: 'stone_shortage',
      name: 'Stone Shortage',
      description: 'Insufficient stone for upgrades',
      icon: '🪨',
      severity: 'medium',
      impact: 15.2,
      recommendation: 'Focus more time on mining or shorter adventure routes'
    })
  }

  // Helper efficiency bottleneck
  if (state.helpers && state.helpers.length > 0) {
    const lowLevelHelpers = state.helpers.filter(h => h.level < 3).length
    if (lowLevelHelpers > 0) {
      bottlenecks.push({
        type: 'helper_training',
        name: 'Helper Training Backlog',
        description: `${lowLevelHelpers} helpers at low levels`,
        icon: '🧙‍♂️',
        severity: 'low',
        impact: 8.7,
        recommendation: 'Invest more energy in helper training'
      })
    }
  }

  // Farm expansion bottleneck
  const totalPlots = state.farm.plots.length
  const activePlots = state.farm.plots.filter(p => p.crop !== null).length
  if (activePlots / totalPlots > 0.9 && totalPlots < 40) {
    bottlenecks.push({
      type: 'farm_expansion',
      name: 'Farm Capacity',
      description: 'All plots in use, need expansion',
      icon: '🌱',
      severity: 'medium',
      impact: 18.3,
      recommendation: 'Purchase and build Farm Expansion blueprints'
    })
  }

  // Adventure time bottleneck
  if (state.heroes && state.heroes.currentLocation === 'adventure') {
    const adventureTime = simulation.screenTime?.adventure || 0
    const totalTime = Object.values(simulation.screenTime || {}).reduce((a, b) => a + b, 0)
    if (adventureTime / totalTime > 0.4) {
      bottlenecks.push({
        type: 'adventure_time',
        name: 'Adventure Overuse',
        description: 'Spending too much time on adventures',
        icon: '⚔️',
        severity: 'medium',
        impact: 12.8,
        recommendation: 'Balance adventure time with farming and other activities'
      })
    }
  }

  // Filter by type if selected
  if (bottleneckType.value !== 'all') {
    return bottlenecks.filter(b => {
      switch (bottleneckType.value) {
        case 'storage': return b.type.includes('cap') || b.type.includes('storage')
        case 'energy': return b.type.includes('energy')
        case 'materials': return b.type.includes('stone') || b.type.includes('copper') || b.type.includes('iron')
        case 'time': return b.type.includes('time') || b.type.includes('adventure')
        default: return true
      }
    })
  }

  return bottlenecks.sort((a, b) => b.impact - a.impact)
}
</script>

<style scoped>
.bottleneck-chart {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.chart-header h4 {
  margin: 0;
  color: #495057;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.chart-controls select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
}

.chart-container {
  height: 300px;
  padding: 1rem;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-style: italic;
}

.bottleneck-details {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.bottleneck-details h5 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.bottleneck-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bottleneck-item {
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #6c757d;
}

.bottleneck-item.severity-high {
  background: #f8d7da;
  border-left-color: #dc3545;
}

.bottleneck-item.severity-medium {
  background: #fff3cd;
  border-left-color: #ffc107;
}

.bottleneck-item.severity-low {
  background: #d1edff;
  border-left-color: #0dcaf0;
}

.bottleneck-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.bottleneck-icon {
  font-size: 1.5rem;
  min-width: 2rem;
}

.bottleneck-content {
  flex: 1;
}

.bottleneck-name {
  font-weight: bold;
  color: #495057;
  margin-bottom: 0.25rem;
}

.bottleneck-description {
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.bottleneck-impact {
  font-size: 0.875rem;
  color: #dc3545;
  font-weight: 500;
}

.bottleneck-recommendation {
  font-size: 0.875rem;
  color: #495057;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
}

.bottleneck-trends {
  height: 200px;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.trend-chart {
  height: 100% !important;
}
</style>
