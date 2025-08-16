<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameValuesStore } from '../stores/gameValues.js'
import { MonteCarloManager } from '../utils/monteCarloManager.js'

const gameValues = useGameValuesStore()

// Monte Carlo state
const monteCarloManager = new MonteCarloManager()
const isRunning = ref(false)
const progress = ref({ completed: 0, total: 0, percentage: 0 })
const results = ref(null)
const currentRun = ref(null)

// Configuration
const config = ref({
  runs: 50,
  maxWorkers: Math.min(navigator.hardwareConcurrency || 4, 6),
  variance: {
    playerBehavior: {
      checkInTimingVariance: 0.2,
      sessionLengthVariance: 0.3,
      efficiencyVariance: 0.1,
      decisionDelayVariance: 0.5
    },
    gameRNG: {
      cropGrowthVariance: 0.1,
      helperDiscoveryVariance: 0.3,
      materialDropVariance: 0.2,
      adventureRewardVariance: 0.15
    },
    timing: {
      upgradeDecisionVariance: 0.4,
      phaseTransitionVariance: 0.2
    }
  },
  simulation: {
    maxDays: 28,
    timeoutPerRun: 300000,
    logLevel: 'minimal'
  },
  analysis: {
    confidenceLevel: 0.95,
    trackMetrics: [
      'phaseTransitionTimes',
      'totalUpgrades',
      'helpersDiscovered',
      'finalResources',
      'bottleneckDurations'
    ]
  }
})

// Computed properties
const estimatedDuration = computed(() => {
  const runsPerWorker = Math.ceil(config.value.runs / config.value.maxWorkers)
  const secondsPerRun = config.value.simulation.maxDays * 0.5 // Rough estimate
  return runsPerWorker * secondsPerRun
})

const canRun = computed(() => {
  return !isRunning.value && gameValues.isLoaded && config.value.runs > 0
})

// Methods
async function startMonteCarlo() {
  if (!canRun.value) return

  try {
    isRunning.value = true
    results.value = null
    progress.value = { completed: 0, total: config.value.runs, percentage: 0 }

    // Configure Monte Carlo
    monteCarloManager.configure({
      ...config.value,
      baseGameValues: gameValues.allGameValues
    })

    // Set up callbacks
    monteCarloManager.setCallbacks({
      onProgress: (progressData) => {
        progress.value = progressData
      },
      onRunComplete: (runResult) => {
        currentRun.value = runResult
      },
      onComplete: (analysis) => {
        results.value = analysis
        isRunning.value = false
        console.log('✅ Monte Carlo simulation completed:', analysis)
      },
      onError: (error) => {
        console.error('❌ Monte Carlo simulation error:', error)
        isRunning.value = false
      }
    })

    // Start simulation
    await monteCarloManager.start()
  } catch (error) {
    console.error('Failed to start Monte Carlo simulation:', error)
    isRunning.value = false
  }
}

function stopMonteCarlo() {
  monteCarloManager.stop()
  isRunning.value = false
}

function exportResults() {
  if (!results.value) return

  const dataStr = JSON.stringify(results.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `monte-carlo-results-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(url)
}

// Format helpers
function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  return `${Math.round(seconds / 3600)}h`
}

function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return 'N/A'
  return typeof num === 'number' ? num.toFixed(decimals) : num
}

// Lifecycle
onMounted(() => {
  // Auto-configure based on system capabilities
  config.value.maxWorkers = Math.min(navigator.hardwareConcurrency || 4, 6)
})

onUnmounted(() => {
  if (isRunning.value) {
    stopMonteCarlo()
  }
})
</script>

<template>
  <div class="monte-carlo-panel">
    <h2>🎲 Monte Carlo Analysis</h2>
    <p class="description">
      Run multiple simulations with variance to generate statistical distributions 
      and confidence intervals for game balance validation.
    </p>

    <!-- Configuration Section -->
    <div class="section" v-if="!isRunning">
      <h3>⚙️ Configuration</h3>
      
      <div class="config-grid">
        <div class="config-group">
          <h4>Basic Settings</h4>
          <div class="parameter">
            <label>Number of Runs:</label>
            <input 
              type="number" 
              v-model.number="config.runs" 
              min="10" 
              max="1000" 
              step="10"
            />
            <span class="info">{{ config.runs }} simulations</span>
          </div>
          
          <div class="parameter">
            <label>Max Workers:</label>
            <input 
              type="number" 
              v-model.number="config.maxWorkers" 
              min="1" 
              max="8" 
            />
            <span class="info">Parallel simulations</span>
          </div>
          
          <div class="parameter">
            <label>Max Days:</label>
            <input 
              type="number" 
              v-model.number="config.simulation.maxDays" 
              min="7" 
              max="50" 
            />
            <span class="info">Days per simulation</span>
          </div>
        </div>

        <div class="config-group">
          <h4>Player Behavior Variance</h4>
          <div class="parameter">
            <label>Check-in Timing:</label>
            <input 
              type="range" 
              v-model.number="config.variance.playerBehavior.checkInTimingVariance"
              min="0" 
              max="0.5" 
              step="0.05"
            />
            <span class="value">±{{ Math.round(config.variance.playerBehavior.checkInTimingVariance * 100) }}%</span>
          </div>
          
          <div class="parameter">
            <label>Session Length:</label>
            <input 
              type="range" 
              v-model.number="config.variance.playerBehavior.sessionLengthVariance"
              min="0" 
              max="0.8" 
              step="0.05"
            />
            <span class="value">±{{ Math.round(config.variance.playerBehavior.sessionLengthVariance * 100) }}%</span>
          </div>
          
          <div class="parameter">
            <label>Player Efficiency:</label>
            <input 
              type="range" 
              v-model.number="config.variance.playerBehavior.efficiencyVariance"
              min="0" 
              max="0.3" 
              step="0.05"
            />
            <span class="value">±{{ Math.round(config.variance.playerBehavior.efficiencyVariance * 100) }}%</span>
          </div>
        </div>

        <div class="config-group">
          <h4>Game RNG Variance</h4>
          <div class="parameter">
            <label>Crop Growth:</label>
            <input 
              type="range" 
              v-model.number="config.variance.gameRNG.cropGrowthVariance"
              min="0" 
              max="0.3" 
              step="0.05"
            />
            <span class="value">±{{ Math.round(config.variance.gameRNG.cropGrowthVariance * 100) }}%</span>
          </div>
          
          <div class="parameter">
            <label>Helper Discovery:</label>
            <input 
              type="range" 
              v-model.number="config.variance.gameRNG.helperDiscoveryVariance"
              min="0" 
              max="0.5" 
              step="0.05"
            />
            <span class="value">±{{ Math.round(config.variance.gameRNG.helperDiscoveryVariance * 100) }}%</span>
          </div>
          
          <div class="parameter">
            <label>Adventure Rewards:</label>
            <input 
              type="range" 
              v-model.number="config.variance.gameRNG.adventureRewardVariance"
              min="0" 
              max="0.3" 
              step="0.05"
            />
            <span class="value">±{{ Math.round(config.variance.gameRNG.adventureRewardVariance * 100) }}%</span>
          </div>
        </div>
      </div>

      <div class="estimate">
        <strong>Estimated Duration:</strong> {{ formatDuration(estimatedDuration) }}
        <span class="workers-info">({{ config.maxWorkers }} parallel workers)</span>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <button 
        @click="startMonteCarlo" 
        :disabled="!canRun"
        class="btn-primary"
        v-if="!isRunning"
      >
        🚀 Start Monte Carlo Analysis
      </button>
      
      <button 
        @click="stopMonteCarlo" 
        class="btn-danger"
        v-if="isRunning"
      >
        ⏹️ Stop Analysis
      </button>
    </div>

    <!-- Progress Section -->
    <div class="section" v-if="isRunning">
      <h3>📊 Progress</h3>
      
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progress.percentage + '%' }"
          ></div>
        </div>
        <div class="progress-text">
          {{ progress.completed }} / {{ progress.total }} simulations 
          ({{ Math.round(progress.percentage) }}%)
        </div>
      </div>

      <div class="current-run" v-if="currentRun">
        <h4>Latest Completed Run</h4>
        <div class="run-info">
          <span>Run #{{ currentRun.runIndex + 1 }}</span>
          <span>Day {{ currentRun.metrics.currentDay || 'N/A' }}</span>
          <span>Phase: {{ currentRun.metrics.currentPhase || 'N/A' }}</span>
          <span>Duration: {{ formatDuration((currentRun.duration || 0) / 1000) }}</span>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div class="section" v-if="results">
      <h3>📈 Results</h3>
      
      <div class="results-summary">
        <div class="summary-card">
          <h4>Overview</h4>
          <div class="stat">
            <span class="label">Completed Runs:</span>
            <span class="value">{{ results.metadata.completedRuns }} / {{ results.metadata.totalRuns }}</span>
          </div>
          <div class="stat">
            <span class="label">Success Rate:</span>
            <span class="value">{{ Math.round(results.summary.successRate * 100) }}%</span>
          </div>
          <div class="stat">
            <span class="label">Total Duration:</span>
            <span class="value">{{ formatDuration(results.metadata.totalDuration / 1000) }}</span>
          </div>
        </div>

        <div class="summary-card" v-if="results.distributions.phaseTransitions">
          <h4>Phase Transitions (Days)</h4>
          <div v-for="(dist, phase) in results.distributions.phaseTransitions" :key="phase" class="stat">
            <span class="label">{{ phase.charAt(0).toUpperCase() + phase.slice(1) }}:</span>
            <span class="value">
              {{ formatNumber(dist.mean, 1) }} ± {{ formatNumber(dist.std, 1) }}
              ({{ formatNumber(dist.min, 1) }}-{{ formatNumber(dist.max, 1) }})
            </span>
          </div>
        </div>

        <div class="summary-card" v-if="results.confidence.phaseTransitions">
          <h4>95% Confidence Intervals</h4>
          <div v-for="(ci, phase) in results.confidence.phaseTransitions" :key="phase" class="stat">
            <span class="label">{{ phase.charAt(0).toUpperCase() + phase.slice(1) }}:</span>
            <span class="value">
              [{{ formatNumber(ci.lower, 1) }}, {{ formatNumber(ci.upper, 1) }}] days
            </span>
          </div>
        </div>
      </div>

      <div class="insights" v-if="results.summary.keyInsights && results.summary.keyInsights.length > 0">
        <h4>🔍 Key Insights</h4>
        <div 
          v-for="insight in results.summary.keyInsights" 
          :key="insight.message"
          :class="['insight', `insight-${insight.severity}`]"
        >
          <strong>{{ insight.type.replace('_', ' ').toUpperCase() }}:</strong>
          {{ insight.message }}
        </div>
      </div>

      <div class="actions">
        <button @click="exportResults" class="btn-secondary">
          💾 Export Results
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monte-carlo-panel {
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

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.config-group {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background: #f8f9fa;
}

.config-group h4 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
}

.parameter {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.parameter label {
  min-width: 120px;
  font-size: 0.9rem;
  color: #495057;
}

.parameter input[type="number"] {
  width: 80px;
  padding: 0.25rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.parameter input[type="range"] {
  flex: 1;
  max-width: 120px;
}

.parameter .value,
.parameter .info {
  font-size: 0.8rem;
  color: #6c757d;
  min-width: 60px;
}

.estimate {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #e3f2fd;
  border-radius: 0.25rem;
  color: #1565c0;
}

.workers-info {
  font-size: 0.9rem;
  color: #6c757d;
  margin-left: 0.5rem;
}

.controls {
  margin: 1.5rem 0;
  text-align: center;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 0.5rem;
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

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.progress-container {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-weight: 500;
  color: #495057;
}

.current-run {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
}

.current-run h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.run-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.run-info span {
  padding: 0.25rem 0.5rem;
  background: white;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  color: #495057;
}

.results-summary {
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

.stat {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.stat .label {
  color: #6c757d;
}

.stat .value {
  font-weight: 500;
  color: #495057;
}

.insights {
  margin: 1.5rem 0;
}

.insights h4 {
  margin-bottom: 1rem;
  color: #495057;
}

.insight {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
  border-left: 4px solid;
}

.insight-warning {
  background: #fff3cd;
  border-left-color: #ffc107;
  color: #856404;
}

.insight-error {
  background: #f8d7da;
  border-left-color: #dc3545;
  color: #721c24;
}

.insight-info {
  background: #d1ecf1;
  border-left-color: #17a2b8;
  color: #0c5460;
}

.actions {
  text-align: center;
  margin-top: 1.5rem;
}
</style>
