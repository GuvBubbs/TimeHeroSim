<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameValuesStore } from '../stores/gameValues.js'
import { MonteCarloManager } from '../utils/monteCarloManager.js'

const gameValues = useGameValuesStore()

// A/B Testing state
const isRunning = ref(false)
const results = ref({ a: null, b: null })
const comparison = ref(null)
const progress = ref({ a: { completed: 0, total: 0 }, b: { completed: 0, total: 0 } })

// Configuration
const config = ref({
  runs: 30, // Fewer runs per test for faster results
  maxWorkers: Math.min(navigator.hardwareConcurrency || 4, 4),
  testName: 'Balance Test',
  description: 'Compare baseline vs modified game values',
  
  // Test A (Baseline)
  testA: {
    name: 'Baseline',
    description: 'Current game values',
    gameValues: null, // Will be set to current game values
    modifications: []
  },
  
  // Test B (Variant)
  testB: {
    name: 'Variant',
    description: 'Modified game values',
    gameValues: null, // Will be modified
    modifications: [
      { type: 'crop_growth', change: 'reduce_time', amount: 0.1, description: '10% faster crop growth' }
    ]
  },
  
  // Variance settings (reduced for A/B testing)
  variance: {
    playerBehavior: {
      checkInTimingVariance: 0.15,
      sessionLengthVariance: 0.2,
      efficiencyVariance: 0.05,
      decisionDelayVariance: 0.3
    },
    gameRNG: {
      cropGrowthVariance: 0.05,
      helperDiscoveryVariance: 0.2,
      materialDropVariance: 0.1,
      adventureRewardVariance: 0.1
    }
  },
  
  simulation: {
    maxDays: 21, // Shorter for faster A/B testing
    timeoutPerRun: 180000 // 3 minutes per run
  }
})

// Predefined modification types
const modificationTypes = [
  { 
    type: 'crop_growth', 
    name: 'Crop Growth Time',
    options: [
      { change: 'reduce_time', name: 'Reduce Time', amounts: [0.1, 0.2, 0.3] },
      { change: 'increase_time', name: 'Increase Time', amounts: [0.1, 0.2, 0.3] }
    ]
  },
  {
    type: 'adventure_rewards',
    name: 'Adventure Gold Rewards',
    options: [
      { change: 'increase_gold', name: 'Increase Gold', amounts: [0.15, 0.25, 0.5] },
      { change: 'decrease_gold', name: 'Decrease Gold', amounts: [0.1, 0.2, 0.3] }
    ]
  },
  {
    type: 'helper_discovery',
    name: 'Helper Discovery Rate',
    options: [
      { change: 'increase_rate', name: 'Increase Rate', amounts: [0.2, 0.5, 1.0] },
      { change: 'decrease_rate', name: 'Decrease Rate', amounts: [0.2, 0.3, 0.5] }
    ]
  },
  {
    type: 'upgrade_costs',
    name: 'Upgrade Costs',
    options: [
      { change: 'reduce_cost', name: 'Reduce Cost', amounts: [0.1, 0.2, 0.3] },
      { change: 'increase_cost', name: 'Increase Cost', amounts: [0.1, 0.2, 0.3] }
    ]
  }
]

// Computed properties
const canRun = computed(() => {
  return !isRunning.value && gameValues.isLoaded && config.value.runs > 0
})

const totalProgress = computed(() => {
  const totalA = progress.value.a.total || 0
  const totalB = progress.value.b.total || 0
  const completedA = progress.value.a.completed || 0
  const completedB = progress.value.b.completed || 0
  
  const total = totalA + totalB
  const completed = completedA + completedB
  
  return {
    completed,
    total,
    percentage: total > 0 ? (completed / total) * 100 : 0
  }
})

// Methods
function addModification() {
  config.value.testB.modifications.push({
    type: 'crop_growth',
    change: 'reduce_time',
    amount: 0.1,
    description: 'New modification'
  })
}

function removeModification(index) {
  config.value.testB.modifications.splice(index, 1)
}

function updateModificationDescription(mod) {
  const modType = modificationTypes.find(m => m.type === mod.type)
  if (modType) {
    const option = modType.options.find(o => o.change === mod.change)
    if (option) {
      const percentage = Math.round(mod.amount * 100)
      mod.description = `${percentage}% ${option.name.toLowerCase()} ${modType.name.toLowerCase()}`
    }
  }
}

async function startABTest() {
  if (!canRun.value) return

  try {
    isRunning.value = true
    results.value = { a: null, b: null }
    comparison.value = null
    progress.value = { 
      a: { completed: 0, total: config.value.runs }, 
      b: { completed: 0, total: config.value.runs } 
    }

    // Prepare game values for both tests
    const baseGameValues = JSON.parse(JSON.stringify(gameValues.allGameValues))
    config.value.testA.gameValues = baseGameValues
    config.value.testB.gameValues = applyModifications(baseGameValues, config.value.testB.modifications)

    // Run both tests in parallel
    const [resultA, resultB] = await Promise.all([
      runSingleTest('a', config.value.testA),
      runSingleTest('b', config.value.testB)
    ])

    results.value.a = resultA
    results.value.b = resultB

    // Generate comparison
    comparison.value = generateComparison(resultA, resultB)

    isRunning.value = false
    console.log('✅ A/B Test completed:', { resultA, resultB, comparison: comparison.value })
  } catch (error) {
    console.error('❌ A/B Test error:', error)
    isRunning.value = false
  }
}

async function runSingleTest(testId, testConfig) {
  const manager = new MonteCarloManager()
  
  const fullConfig = {
    runs: config.value.runs,
    maxWorkers: Math.ceil(config.value.maxWorkers / 2), // Split workers between tests
    baseGameValues: testConfig.gameValues,
    variance: config.value.variance,
    simulation: config.value.simulation,
    analysis: {
      confidenceLevel: 0.95,
      trackMetrics: ['phaseTransitionTimes', 'finalResources', 'helpersDiscovered']
    }
  }

  manager.configure(fullConfig)
  
  manager.setCallbacks({
    onProgress: (progressData) => {
      progress.value[testId] = progressData
    },
    onError: (error) => {
      console.error(`Test ${testId} error:`, error)
    }
  })

  return await manager.start()
}

function applyModifications(gameValues, modifications) {
  const modified = JSON.parse(JSON.stringify(gameValues))
  
  modifications.forEach(mod => {
    switch (mod.type) {
      case 'crop_growth':
        if (modified.crops) {
          modified.crops.forEach(crop => {
            if (crop.growthTime) {
              if (mod.change === 'reduce_time') {
                crop.growthTime *= (1 - mod.amount)
              } else if (mod.change === 'increase_time') {
                crop.growthTime *= (1 + mod.amount)
              }
            }
          })
        }
        break
        
      case 'adventure_rewards':
        if (modified.adventures) {
          modified.adventures.forEach(adventure => {
            if (adventure.goldReward) {
              if (mod.change === 'increase_gold') {
                adventure.goldReward *= (1 + mod.amount)
              } else if (mod.change === 'decrease_gold') {
                adventure.goldReward *= (1 - mod.amount)
              }
            }
          })
        }
        break
        
      case 'upgrade_costs':
        if (modified.upgrades) {
          modified.upgrades.forEach(upgrade => {
            if (upgrade.cost) {
              if (mod.change === 'reduce_cost') {
                upgrade.cost *= (1 - mod.amount)
              } else if (mod.change === 'increase_cost') {
                upgrade.cost *= (1 + mod.amount)
              }
            }
          })
        }
        break
    }
  })
  
  return modified
}

function generateComparison(resultA, resultB) {
  const comp = {
    summary: {
      winner: null,
      confidence: 0,
      significantDifferences: []
    },
    metrics: {},
    recommendations: []
  }

  // Compare phase transition times
  if (resultA.distributions.phaseTransitions && resultB.distributions.phaseTransitions) {
    comp.metrics.phaseTransitions = {}
    
    Object.keys(resultA.distributions.phaseTransitions).forEach(phase => {
      const a = resultA.distributions.phaseTransitions[phase]
      const b = resultB.distributions.phaseTransitions[phase]
      
      if (a && b) {
        const difference = b.mean - a.mean
        const relativeDifference = (difference / a.mean) * 100
        const combinedStd = Math.sqrt((a.std * a.std + b.std * b.std) / 2)
        const effectSize = Math.abs(difference) / combinedStd
        
        comp.metrics.phaseTransitions[phase] = {
          testA: { mean: a.mean, std: a.std },
          testB: { mean: b.mean, std: b.std },
          difference,
          relativeDifference,
          effectSize,
          isSignificant: effectSize > 0.5 // Cohen's d threshold
        }
        
        if (effectSize > 0.5) {
          comp.summary.significantDifferences.push({
            metric: `${phase} phase transition`,
            difference: relativeDifference,
            favoredTest: difference < 0 ? 'A' : 'B'
          })
        }
      }
    })
  }

  // Determine overall winner
  if (comp.summary.significantDifferences.length > 0) {
    const aWins = comp.summary.significantDifferences.filter(d => d.favoredTest === 'A').length
    const bWins = comp.summary.significantDifferences.filter(d => d.favoredTest === 'B').length
    
    if (aWins > bWins) {
      comp.summary.winner = 'A'
    } else if (bWins > aWins) {
      comp.summary.winner = 'B'
    } else {
      comp.summary.winner = 'tie'
    }
    
    comp.summary.confidence = Math.max(aWins, bWins) / comp.summary.significantDifferences.length
  } else {
    comp.summary.winner = 'inconclusive'
  }

  // Generate recommendations
  comp.recommendations = generateRecommendations(comp)

  return comp
}

function generateRecommendations(comparison) {
  const recommendations = []
  
  if (comparison.summary.winner === 'A') {
    recommendations.push({
      type: 'keep_baseline',
      message: 'Current game values perform better. Consider keeping baseline configuration.',
      priority: 'high'
    })
  } else if (comparison.summary.winner === 'B') {
    recommendations.push({
      type: 'adopt_variant',
      message: 'Modified values show improvement. Consider adopting variant configuration.',
      priority: 'high'
    })
  } else if (comparison.summary.winner === 'inconclusive') {
    recommendations.push({
      type: 'increase_sample',
      message: 'No significant differences found. Consider increasing sample size or modification magnitude.',
      priority: 'medium'
    })
  }
  
  return recommendations
}

function stopABTest() {
  isRunning.value = false
  // Note: Stopping individual managers would require more complex state management
}

function exportComparison() {
  if (!comparison.value) return

  const exportData = {
    config: config.value,
    results: results.value,
    comparison: comparison.value,
    timestamp: new Date().toISOString()
  }

  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `ab-test-${config.value.testName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(url)
}

// Format helpers
function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return 'N/A'
  return typeof num === 'number' ? num.toFixed(decimals) : num
}

function formatPercentage(num, decimals = 1) {
  if (num === null || num === undefined) return 'N/A'
  return `${formatNumber(num, decimals)}%`
}

// Initialize modifications descriptions
onMounted(() => {
  config.value.testB.modifications.forEach(updateModificationDescription)
})
</script>

<template>
  <div class="ab-testing-panel">
    <h2>⚖️ A/B Testing</h2>
    <p class="description">
      Compare two different game configurations statistically to validate balance changes
      and measure their impact on player progression.
    </p>

    <!-- Test Configuration -->
    <div class="section" v-if="!isRunning">
      <h3>⚙️ Test Configuration</h3>
      
      <div class="test-meta">
        <div class="parameter">
          <label>Test Name:</label>
          <input type="text" v-model="config.testName" placeholder="Balance Test" />
        </div>
        <div class="parameter">
          <label>Description:</label>
          <input type="text" v-model="config.description" placeholder="Test description" />
        </div>
        <div class="parameter">
          <label>Runs per Test:</label>
          <input type="number" v-model.number="config.runs" min="10" max="100" />
        </div>
      </div>

      <div class="test-comparison">
        <div class="test-config">
          <h4>🅰️ Test A (Baseline)</h4>
          <div class="test-info">
            <input type="text" v-model="config.testA.name" placeholder="Baseline" />
            <textarea v-model="config.testA.description" placeholder="Current game values" rows="2"></textarea>
            <div class="test-note">Uses current loaded game values</div>
          </div>
        </div>

        <div class="test-config">
          <h4>🅱️ Test B (Variant)</h4>
          <div class="test-info">
            <input type="text" v-model="config.testB.name" placeholder="Variant" />
            <textarea v-model="config.testB.description" placeholder="Modified game values" rows="2"></textarea>
            
            <div class="modifications">
              <h5>Modifications:</h5>
              
              <div 
                v-for="(mod, index) in config.testB.modifications" 
                :key="index"
                class="modification"
              >
                <select v-model="mod.type" @change="updateModificationDescription(mod)">
                  <option v-for="type in modificationTypes" :key="type.type" :value="type.type">
                    {{ type.name }}
                  </option>
                </select>
                
                <select v-model="mod.change" @change="updateModificationDescription(mod)">
                  <option 
                    v-for="option in modificationTypes.find(t => t.type === mod.type)?.options || []" 
                    :key="option.change" 
                    :value="option.change"
                  >
                    {{ option.name }}
                  </option>
                </select>
                
                <input 
                  type="number" 
                  v-model.number="mod.amount" 
                  min="0.05" 
                  max="1" 
                  step="0.05"
                  @input="updateModificationDescription(mod)"
                />
                
                <button @click="removeModification(index)" class="btn-remove">❌</button>
                
                <div class="mod-description">{{ mod.description }}</div>
              </div>
              
              <button @click="addModification" class="btn-add">➕ Add Modification</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <button 
        @click="startABTest" 
        :disabled="!canRun"
        class="btn-primary"
        v-if="!isRunning"
      >
        🚀 Start A/B Test
      </button>
      
      <button 
        @click="stopABTest" 
        class="btn-danger"
        v-if="isRunning"
      >
        ⏹️ Stop Test
      </button>
    </div>

    <!-- Progress -->
    <div class="section" v-if="isRunning">
      <h3>📊 Progress</h3>
      
      <div class="overall-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: totalProgress.percentage + '%' }"
          ></div>
        </div>
        <div class="progress-text">
          {{ totalProgress.completed }} / {{ totalProgress.total }} total simulations 
          ({{ Math.round(totalProgress.percentage) }}%)
        </div>
      </div>

      <div class="test-progress">
        <div class="test-progress-item">
          <h4>🅰️ Test A Progress</h4>
          <div class="progress-bar small">
            <div 
              class="progress-fill" 
              :style="{ width: (progress.a.completed / progress.a.total * 100) + '%' }"
            ></div>
          </div>
          <span>{{ progress.a.completed }} / {{ progress.a.total }}</span>
        </div>
        
        <div class="test-progress-item">
          <h4>🅱️ Test B Progress</h4>
          <div class="progress-bar small">
            <div 
              class="progress-fill" 
              :style="{ width: (progress.b.completed / progress.b.total * 100) + '%' }"
            ></div>
          </div>
          <span>{{ progress.b.completed }} / {{ progress.b.total }}</span>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="section" v-if="comparison">
      <h3>📈 A/B Test Results</h3>
      
      <div class="results-header">
        <div class="winner-announcement" :class="'winner-' + comparison.summary.winner">
          <h4>
            {{ comparison.summary.winner === 'A' ? '🏆 Test A Wins!' : 
               comparison.summary.winner === 'B' ? '🏆 Test B Wins!' :
               comparison.summary.winner === 'tie' ? '🤝 Tie Result' :
               '❓ Inconclusive' }}
          </h4>
          <p v-if="comparison.summary.winner !== 'inconclusive'">
            Confidence: {{ Math.round(comparison.summary.confidence * 100) }}%
          </p>
        </div>
      </div>

      <div class="comparison-metrics" v-if="comparison.metrics.phaseTransitions">
        <h4>Phase Transition Comparison</h4>
        <div class="metrics-table">
          <div class="metrics-header">
            <span>Phase</span>
            <span>Test A (days)</span>
            <span>Test B (days)</span>
            <span>Difference</span>
            <span>Significant?</span>
          </div>
          
          <div 
            v-for="(metric, phase) in comparison.metrics.phaseTransitions" 
            :key="phase"
            class="metrics-row"
          >
            <span class="phase-name">{{ phase.charAt(0).toUpperCase() + phase.slice(1) }}</span>
            <span>{{ formatNumber(metric.testA.mean, 1) }} ± {{ formatNumber(metric.testA.std, 1) }}</span>
            <span>{{ formatNumber(metric.testB.mean, 1) }} ± {{ formatNumber(metric.testB.std, 1) }}</span>
            <span :class="{ 
              'positive': metric.difference > 0, 
              'negative': metric.difference < 0 
            }">
              {{ formatPercentage(metric.relativeDifference, 1) }}
            </span>
            <span :class="{ 'significant': metric.isSignificant }">
              {{ metric.isSignificant ? '✅ Yes' : '❌ No' }}
            </span>
          </div>
        </div>
      </div>

      <div class="recommendations" v-if="comparison.recommendations.length > 0">
        <h4>💡 Recommendations</h4>
        <div 
          v-for="rec in comparison.recommendations" 
          :key="rec.message"
          :class="['recommendation', `priority-${rec.priority}`]"
        >
          <strong>{{ rec.type.replace('_', ' ').toUpperCase() }}:</strong>
          {{ rec.message }}
        </div>
      </div>

      <div class="actions">
        <button @click="exportComparison" class="btn-secondary">
          💾 Export Results
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ab-testing-panel {
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

.test-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.parameter {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.parameter label {
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.parameter input,
.parameter textarea {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.test-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.test-config {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background: #f8f9fa;
}

.test-config h4 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.test-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.test-note {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

.modifications h5 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 0.9rem;
}

.modification {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 0.25rem;
  border: 1px solid #dee2e6;
}

.modification select,
.modification input {
  padding: 0.25rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.modification input[type="number"] {
  width: 70px;
}

.btn-remove {
  padding: 0.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.8rem;
}

.mod-description {
  grid-column: 1 / -1;
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.btn-add {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 1px dashed #6c757d;
  background: transparent;
  border-radius: 0.25rem;
  color: #6c757d;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-add:hover {
  border-color: #007bff;
  color: #007bff;
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

.overall-progress {
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar.small {
  height: 12px;
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

.test-progress {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.test-progress-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
}

.test-progress-item h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #495057;
}

.test-progress-item span {
  display: block;
  text-align: center;
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.results-header {
  margin-bottom: 1.5rem;
}

.winner-announcement {
  text-align: center;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.winner-A {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.winner-B {
  background: #cce7ff;
  border: 1px solid #99d6ff;
  color: #004085;
}

.winner-tie {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.winner-inconclusive {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.winner-announcement h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.winner-announcement p {
  margin: 0;
  font-size: 0.9rem;
}

.comparison-metrics {
  margin-bottom: 1.5rem;
}

.comparison-metrics h4 {
  margin-bottom: 1rem;
  color: #495057;
}

.metrics-table {
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  overflow: hidden;
}

.metrics-header,
.metrics-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 0.75rem;
  align-items: center;
}

.metrics-header {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  border-bottom: 1px solid #dee2e6;
}

.metrics-row {
  border-bottom: 1px solid #f8f9fa;
  font-size: 0.9rem;
}

.metrics-row:last-child {
  border-bottom: none;
}

.phase-name {
  font-weight: 500;
  color: #495057;
}

.positive {
  color: #dc3545;
}

.negative {
  color: #28a745;
}

.significant {
  color: #28a745;
  font-weight: 500;
}

.recommendations {
  margin: 1.5rem 0;
}

.recommendations h4 {
  margin-bottom: 1rem;
  color: #495057;
}

.recommendation {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
  border-left: 4px solid;
}

.priority-high {
  background: #fff3cd;
  border-left-color: #ffc107;
  color: #856404;
}

.priority-medium {
  background: #cce7ff;
  border-left-color: #007bff;
  color: #004085;
}

.priority-low {
  background: #f8f9fa;
  border-left-color: #6c757d;
  color: #495057;
}

.actions {
  text-align: center;
  margin-top: 1.5rem;
}
</style>
