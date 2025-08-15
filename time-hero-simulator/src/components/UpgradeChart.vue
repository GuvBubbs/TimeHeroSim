<template>
  <div class="upgrade-chart">
    <div class="chart-header">
      <h4>⬆️ Upgrade Acquisition Timeline</h4>
      <div class="chart-controls">
        <button 
          v-for="category in categories" 
          :key="category"
          @click="selectedCategory = category"
          :class="['category-btn', { active: selectedCategory === category }]"
        >
          {{ category }}
        </button>
      </div>
    </div>
    
    <div class="chart-container">
      <Bar 
        v-if="chartData.datasets.length > 0"
        :data="chartData" 
        :options="chartOptions" 
        class="chart-canvas"
      />
      <div v-else class="no-data">
        <p>No upgrades purchased yet</p>
      </div>
    </div>

    <div class="upgrade-summary">
      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalUpgrades }}</div>
          <div class="stat-label">Total Upgrades</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ avgDaysBetweenUpgrades.toFixed(1) }}</div>
          <div class="stat-label">Avg Days Between</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalCost.toLocaleString() }}</div>
          <div class="stat-label">Total Gold Spent</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ upgradeVelocity.toFixed(1) }}</div>
          <div class="stat-label">Upgrades/Week</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { useSimulationStore } from '../stores/simulation.js'
import { useGameValuesStore } from '../stores/gameValues.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const simulation = useSimulationStore()
const gameValues = useGameValuesStore()
const selectedCategory = ref('All')

const categories = computed(() => {
  const allCategories = new Set(['All'])
  if (gameValues.upgrades) {
    Object.values(gameValues.upgrades).forEach(upgrade => {
      allCategories.add(upgrade.category)
    })
  }
  return Array.from(allCategories)
})

const upgradeHistory = computed(() => {
  return simulation.upgradeHistory || []
})

const filteredUpgrades = computed(() => {
  if (selectedCategory.value === 'All') {
    return upgradeHistory.value
  }
  return upgradeHistory.value.filter(upgrade => 
    gameValues.upgrades[upgrade.upgradeId]?.category === selectedCategory.value
  )
})

const chartData = computed(() => {
  if (filteredUpgrades.value.length === 0) {
    return { labels: [], datasets: [] }
  }

  // Group upgrades by day
  const upgradesByDay = {}
  filteredUpgrades.value.forEach(upgrade => {
    const day = upgrade.day
    if (!upgradesByDay[day]) {
      upgradesByDay[day] = []
    }
    upgradesByDay[day].push(upgrade)
  })

  const days = Object.keys(upgradesByDay).map(Number).sort((a, b) => a - b)
  const maxDay = Math.max(...days)
  
  // Create labels for all days up to max
  const labels = []
  const data = []
  
  for (let day = 1; day <= maxDay; day++) {
    labels.push(`Day ${day}`)
    data.push(upgradesByDay[day]?.length || 0)
  }

  return {
    labels,
    datasets: [
      {
        label: 'Upgrades Purchased',
        data,
        backgroundColor: getCategoryColor(selectedCategory.value, 0.7),
        borderColor: getCategoryColor(selectedCategory.value, 1),
        borderWidth: 1
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
        text: 'Game Day'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Number of Upgrades'
      },
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  },
  plugins: {
    title: {
      display: true,
      text: `${selectedCategory.value} Upgrade Acquisitions`
    },
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        afterLabel: function(context) {
          const day = context.dataIndex + 1
          const dayUpgrades = filteredUpgrades.value.filter(u => u.day === day)
          if (dayUpgrades.length > 0) {
            return dayUpgrades.map(upgrade => {
              const upgradeData = gameValues.upgrades[upgrade.upgradeId]
              return `• ${upgradeData?.name || upgrade.upgradeId}`
            })
          }
          return []
        }
      }
    }
  }
}))

const totalUpgrades = computed(() => filteredUpgrades.value.length)

const avgDaysBetweenUpgrades = computed(() => {
  if (filteredUpgrades.value.length < 2) return 0
  
  const days = filteredUpgrades.value.map(u => u.day).sort((a, b) => a - b)
  let totalGaps = 0
  
  for (let i = 1; i < days.length; i++) {
    totalGaps += days[i] - days[i - 1]
  }
  
  return totalGaps / (days.length - 1)
})

const totalCost = computed(() => {
  return filteredUpgrades.value.reduce((sum, upgrade) => {
    const upgradeData = gameValues.upgrades[upgrade.upgradeId]
    return sum + (upgradeData?.cost?.gold || 0)
  }, 0)
})

const upgradeVelocity = computed(() => {
  if (filteredUpgrades.value.length === 0) return 0
  
  const currentDay = simulation.gameState.day
  const weeksElapsed = currentDay / 7
  
  return weeksElapsed > 0 ? totalUpgrades.value / weeksElapsed : 0
})

function getCategoryColor(category, alpha = 1) {
  const colors = {
    'All': `rgba(0, 123, 255, ${alpha})`,
    'farming': `rgba(40, 167, 69, ${alpha})`,
    'storage': `rgba(255, 193, 7, ${alpha})`,
    'efficiency': `rgba(108, 117, 125, ${alpha})`,
    'automation': `rgba(220, 53, 69, ${alpha})`,
    'production': `rgba(111, 66, 193, ${alpha})`
  }
  return colors[category] || `rgba(111, 66, 193, ${alpha})`
}
</script>

<style scoped>
.upgrade-chart {
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
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-header h4 {
  margin: 0;
  color: #495057;
}

.chart-controls {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.category-btn:hover {
  background: #f8f9fa;
}

.category-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.chart-container {
  height: 300px;
  position: relative;
  margin-bottom: 1rem;
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

.upgrade-summary {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-card {
  text-align: center;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #495057;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
