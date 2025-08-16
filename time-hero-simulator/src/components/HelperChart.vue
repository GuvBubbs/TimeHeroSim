<template>
  <div class="helper-chart">
    <div class="chart-header">
      <h4>🧙‍♂️ Helper Efficiency & Utilization</h4>
      <div class="chart-controls">
        <select v-model="viewMode">
          <option value="efficiency">Efficiency Rates</option>
          <option value="utilization">Time Utilization</option>
          <option value="levels">Level Distribution</option>
          <option value="assignments">Task Assignments</option>
        </select>
        <button 
          @click="showHelperDetails = !showHelperDetails"
          class="details-toggle"
        >
          {{ showHelperDetails ? 'Hide' : 'Show' }} Details
        </button>
      </div>
    </div>
    
    <div class="chart-container">
      <Bar 
        v-if="chartData.datasets.length > 0 && viewMode !== 'assignments'"
        :data="chartData" 
        :options="chartOptions" 
        class="chart-canvas"
      />
      <Doughnut 
        v-else-if="chartData.datasets.length > 0 && viewMode === 'assignments'"
        :data="chartData" 
        :options="doughnutOptions" 
        class="chart-canvas"
      />
      <div v-else class="no-data">
        <p>No helpers discovered yet</p>
        <small>Helpers are discovered through mining expeditions</small>
      </div>
    </div>

    <div v-if="showHelperDetails" class="helper-details">
      <h5>Helper Details</h5>
      <div class="helper-grid">
        <div 
          v-for="helper in detailedHelpers" 
          :key="helper.id"
          class="helper-card"
          :class="['helper-' + helper.type]"
        >
          <div class="helper-header">
            <div class="helper-icon">{{ helper.icon }}</div>
            <div class="helper-info">
              <div class="helper-name">{{ helper.name }}</div>
              <div class="helper-type">{{ helper.type }} (Level {{ helper.level }})</div>
            </div>
            <div class="helper-efficiency">
              {{ (helper.efficiency * 100).toFixed(0) }}%
            </div>
          </div>
          
          <div class="helper-stats">
            <div class="stat">
              <span class="stat-label">Assignment:</span>
              <span class="stat-value">{{ helper.assignment || 'Idle' }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Work Time:</span>
              <span class="stat-value">{{ helper.workTime }}h</span>
            </div>
            <div class="stat">
              <span class="stat-label">Rest Time:</span>
              <span class="stat-value">{{ helper.restTime }}h</span>
            </div>
            <div class="stat">
              <span class="stat-label">Tasks Completed:</span>
              <span class="stat-value">{{ helper.tasksCompleted }}</span>
            </div>
          </div>

          <div class="helper-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: helper.progressToNextLevel + '%' }"
              ></div>
            </div>
            <div class="progress-text">
              {{ helper.progressToNextLevel.toFixed(0) }}% to Level {{ helper.level + 1 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="helper-summary">
      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalHelpers }}</div>
          <div class="stat-label">Total Helpers</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ averageLevel.toFixed(1) }}</div>
          <div class="stat-label">Average Level</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ averageEfficiency.toFixed(0) }}%</div>
          <div class="stat-label">Average Efficiency</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeHelpers }}</div>
          <div class="stat-label">Active Helpers</div>
        </div>
      </div>
      
      <div class="helper-recommendations">
        <h6>Optimization Recommendations</h6>
        <ul>
          <li v-for="rec in recommendations" :key="rec">{{ rec }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { useSimulationStore } from '../stores/simulation.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const simulation = useSimulationStore()
const viewMode = ref('efficiency')
const showHelperDetails = ref(false)

const helpers = computed(() => {
  return simulation.gameState.helpers || []
})

const detailedHelpers = computed(() => {
  return helpers.value.map((helper, index) => ({
    id: index,
    name: `${helper.type} #${index + 1}`,
    type: helper.type,
    level: helper.level || 1,
    efficiency: helper.efficiency || 0.5,
    assignment: helper.assignment || 'farming',
    workTime: helper.workTime || 8,
    restTime: helper.restTime || 2,
    tasksCompleted: helper.tasksCompleted || Math.floor(Math.random() * 100),
    progressToNextLevel: helper.progressToNextLevel || Math.random() * 100,
    icon: getHelperIcon(helper.type)
  }))
})

const totalHelpers = computed(() => helpers.value.length)
const averageLevel = computed(() => {
  if (helpers.value.length === 0) return 0
  return helpers.value.reduce((sum, h) => sum + (h.level || 1), 0) / helpers.value.length
})
const averageEfficiency = computed(() => {
  if (helpers.value.length === 0) return 0
  return helpers.value.reduce((sum, h) => sum + ((h.efficiency || 0.5) * 100), 0) / helpers.value.length
})
const activeHelpers = computed(() => {
  return helpers.value.filter(h => h.assignment && h.assignment !== 'idle').length
})

const chartData = computed(() => {
  if (helpers.value.length === 0) {
    return { labels: [], datasets: [] }
  }

  switch (viewMode.value) {
    case 'efficiency':
      return getEfficiencyData()
    case 'utilization':
      return getUtilizationData()
    case 'levels':
      return getLevelData()
    case 'assignments':
      return getAssignmentData()
    default:
      return { labels: [], datasets: [] }
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: getYAxisLabel()
      }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top'
    }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const recommendations = computed(() => {
  const recs = []
  
  if (helpers.value.length === 0) {
    recs.push('Discover helpers through mining expeditions')
  } else {
    const lowLevelHelpers = helpers.value.filter(h => (h.level || 1) < 3).length
    if (lowLevelHelpers > 0) {
      recs.push(`Train ${lowLevelHelpers} helpers to improve efficiency`)
    }
    
    const idleHelpers = helpers.value.filter(h => !h.assignment || h.assignment === 'idle').length
    if (idleHelpers > 0) {
      recs.push(`Assign ${idleHelpers} idle helpers to tasks`)
    }
    
    if (averageEfficiency.value < 70) {
      recs.push('Focus on helper training to improve overall efficiency')
    }
    
    if (helpers.value.length < 5 && simulation.gameState.currentPhase !== 'tutorial') {
      recs.push('Consider more mining to discover additional helpers')
    }
  }
  
  return recs
})

function getHelperIcon(type) {
  const icons = {
    gnome: '🧙‍♂️',
    golem: '🗿',
    fairy: '🧚‍♀️',
    sprite: '✨',
    elemental: '🔥',
    treant: '🌳'
  }
  return icons[type] || '🧙‍♂️'
}

function getEfficiencyData() {
  const labels = detailedHelpers.value.map(h => h.name)
  const data = detailedHelpers.value.map(h => h.efficiency * 100)
  
  return {
    labels,
    datasets: [{
      label: 'Efficiency %',
      data,
      backgroundColor: '#28a745',
      borderColor: '#1e7e34',
      borderWidth: 1
    }]
  }
}

function getUtilizationData() {
  const labels = detailedHelpers.value.map(h => h.name)
  const workData = detailedHelpers.value.map(h => h.workTime)
  const restData = detailedHelpers.value.map(h => h.restTime)
  
  return {
    labels,
    datasets: [
      {
        label: 'Work Time (hours)',
        data: workData,
        backgroundColor: '#007bff',
        borderColor: '#0056b3',
        borderWidth: 1
      },
      {
        label: 'Rest Time (hours)',
        data: restData,
        backgroundColor: '#ffc107',
        borderColor: '#d39e00',
        borderWidth: 1
      }
    ]
  }
}

function getLevelData() {
  const levelCounts = {}
  helpers.value.forEach(h => {
    const level = h.level || 1
    levelCounts[level] = (levelCounts[level] || 0) + 1
  })
  
  const labels = Object.keys(levelCounts).map(l => `Level ${l}`)
  const data = Object.values(levelCounts)
  
  return {
    labels,
    datasets: [{
      label: 'Number of Helpers',
      data,
      backgroundColor: '#6f42c1',
      borderColor: '#563d7c',
      borderWidth: 1
    }]
  }
}

function getAssignmentData() {
  const assignmentCounts = {}
  helpers.value.forEach(h => {
    const assignment = h.assignment || 'idle'
    assignmentCounts[assignment] = (assignmentCounts[assignment] || 0) + 1
  })
  
  const labels = Object.keys(assignmentCounts)
  const data = Object.values(assignmentCounts)
  const colors = ['#28a745', '#dc3545', '#ffc107', '#007bff', '#6f42c1', '#17a2b8']
  
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.slice(0, labels.length),
      borderWidth: 2
    }]
  }
}

function getYAxisLabel() {
  switch (viewMode.value) {
    case 'efficiency': return 'Efficiency (%)'
    case 'utilization': return 'Hours'
    case 'levels': return 'Number of Helpers'
    default: return ''
  }
}
</script>

<style scoped>
.helper-chart {
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
  align-items: center;
}

.chart-controls select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
}

.details-toggle {
  padding: 0.25rem 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.details-toggle:hover {
  background: #0056b3;
}

.chart-container {
  height: 300px;
  padding: 1rem;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  text-align: center;
}

.helper-details {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.helper-details h5 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.helper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.helper-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
}

.helper-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.helper-icon {
  font-size: 1.5rem;
  width: 2rem;
  text-align: center;
}

.helper-info {
  flex: 1;
}

.helper-name {
  font-weight: bold;
  color: #495057;
}

.helper-type {
  font-size: 0.875rem;
  color: #6c757d;
}

.helper-efficiency {
  font-weight: bold;
  color: #28a745;
  font-size: 1.1rem;
}

.helper-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.stat-label {
  color: #6c757d;
}

.stat-value {
  font-weight: 500;
  color: #495057;
}

.helper-progress {
  margin-top: 0.75rem;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #6c757d;
  text-align: center;
}

.helper-summary {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  text-align: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-card .stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #495057;
  display: block;
}

.stat-card .stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.helper-recommendations h6 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.helper-recommendations ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #6c757d;
}

.helper-recommendations li {
  margin-bottom: 0.25rem;
}
</style>
