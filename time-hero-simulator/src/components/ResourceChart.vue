<template>
  <div class="resource-chart">
    <div class="chart-header">
      <h4>📊 Resource Flow Over Time</h4>
      <div class="chart-controls">
        <select v-model="selectedResource">
          <option value="energy">Energy</option>
          <option value="gold">Gold</option>
          <option value="stone">Stone</option>
          <option value="copper">Copper</option>
          <option value="iron">Iron</option>
        </select>
        <select v-model="timeRange">
          <option value="24">Last 24 Hours</option>
          <option value="72">Last 3 Days</option>
          <option value="168">Last Week</option>
          <option value="all">All Time</option>
        </select>
      </div>
    </div>
    <div class="chart-container">
      <Line 
        v-if="chartData.datasets.length > 0"
        :data="chartData" 
        :options="chartOptions" 
        class="chart-canvas"
      />
      <div v-else class="no-data">
        <p>Start simulation to see resource flow data</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import { useSimulationStore } from '../stores/simulation.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

const simulation = useSimulationStore()
const selectedResource = ref('energy')
const timeRange = ref('72')

const chartData = computed(() => {
  const history = simulation.resourceHistory || []
  
  if (history.length === 0) {
    return { labels: [], datasets: [] }
  }

  // Filter data based on time range
  let filteredHistory = history
  if (timeRange.value !== 'all') {
    const hoursBack = parseInt(timeRange.value)
    const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000)
    filteredHistory = history.filter(entry => entry.timestamp > cutoffTime)
  }

  const labels = filteredHistory.map(entry => {
    const date = new Date(entry.timestamp)
    return `Day ${entry.gameDay}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  })

  const resourceData = filteredHistory.map(entry => {
    if (selectedResource.value === 'energy') {
      return entry.resources.energy.current
    } else if (selectedResource.value === 'gold') {
      return entry.resources.gold
    } else {
      return entry.resources.materials[selectedResource.value] || 0
    }
  })

  return {
    labels,
    datasets: [
      {
        label: getResourceLabel(selectedResource.value),
        data: resourceData,
        borderColor: getResourceColor(selectedResource.value),
        backgroundColor: getResourceColor(selectedResource.value, 0.1),
        tension: 0.3,
        fill: true
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: 'Time'
      },
      ticks: {
        maxTicksLimit: 10
      }
    },
    y: {
      title: {
        display: true,
        text: getResourceLabel(selectedResource.value)
      },
      beginAtZero: true
    }
  },
  plugins: {
    title: {
      display: true,
      text: `${getResourceLabel(selectedResource.value)} Over Time`
    },
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${getResourceLabel(selectedResource.value)}: ${context.parsed.y.toLocaleString()}`
        }
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  }
}))

function getResourceLabel(resource) {
  const labels = {
    energy: 'Energy',
    gold: 'Gold',
    stone: 'Stone',
    copper: 'Copper',
    iron: 'Iron'
  }
  return labels[resource] || resource
}

function getResourceColor(resource, alpha = 1) {
  const colors = {
    energy: `rgba(255, 193, 7, ${alpha})`,    // Yellow
    gold: `rgba(255, 215, 0, ${alpha})`,      // Gold
    stone: `rgba(108, 117, 125, ${alpha})`,   // Gray
    copper: `rgba(255, 138, 101, ${alpha})`,  // Orange
    iron: `rgba(73, 80, 87, ${alpha})`        // Dark gray
  }
  return colors[resource] || `rgba(0, 123, 255, ${alpha})`
}

// Watch for simulation changes to update chart
watch(() => simulation.gameState.currentTick, () => {
  // Chart will reactively update when simulation state changes
})
</script>

<style scoped>
.resource-chart {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #dee2e6;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.chart-container {
  height: 300px;
  position: relative;
}

.chart-canvas {
  height: 100% !important;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-style: italic;
}
</style>
