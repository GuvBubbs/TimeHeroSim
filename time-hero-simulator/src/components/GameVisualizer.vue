<script setup>
import { computed, ref } from 'vue'
import { useSimulationStore } from '../stores/simulation.js'
import { useGameValuesStore } from '../stores/gameValues.js'
import { useResultsStore } from '../stores/results.js'
import ResourceChart from './ResourceChart.vue'
import PhaseTimeline from './PhaseTimeline.vue'
import UpgradeChart from './UpgradeChart.vue'
import BottleneckChart from './BottleneckChart.vue'
import HelperChart from './HelperChart.vue'
import MilestoneNotifications from './MilestoneNotifications.vue'
import MonteCarloPanel from './MonteCarloPanel.vue'
import ABTestingPanel from './ABTestingPanel.vue'
import BottleneckAnalyzer from './BottleneckAnalyzer.vue'

const simulation = useSimulationStore()
const gameValues = useGameValuesStore()
const results = useResultsStore()

// Component references for milestone notifications
const milestoneNotifications = ref(null)

// Analysis controls state
const showAnalysisPanel = ref(false)
const analysisMode = ref('charts') // charts, monte-carlo, ab-testing, bottlenecks

// Testing controls state
const showTestingPanel = ref(false)
const testScenario = ref('casual')
const reportFormat = ref('json')
const testResults = ref('')

// Chart visibility controls
const showCharts = ref({
  resources: true,
  phases: true,
  upgrades: true,
  bottlenecks: true,
  helpers: true
})

// Test scenario options
const testScenarios = [
  { value: 'speedrunner', label: 'Speedrunner (Optimal Play)', icon: '🏃‍♂️' },
  { value: 'casual', label: 'Casual Player', icon: '😊' },
  { value: 'weekend-warrior', label: 'Weekend Warrior', icon: '📅' },
  { value: 'balance-test', label: 'Balance Test', icon: '⚖️' }
]

// Export format options
const exportFormats = [
  { value: 'json', label: 'JSON Data' },
  { value: 'csv', label: 'CSV Spreadsheet' },
  { value: 'markdown', label: 'Markdown Report' }
]

// Testing functions
function runTestScenario() {
  testResults.value = results.runQuickTestScenario(testScenario.value)
}

function generateReport() {
  const report = results.generateComprehensiveReport()
  testResults.value = `Comprehensive report generated with ID: ${report.id}`
}

function exportCurrentReport() {
  if (results.latestReport) {
    const result = results.exportReport(results.latestReport.id, reportFormat.value)
    testResults.value = result || 'Export completed'
  } else {
    testResults.value = 'No report available to export'
  }
}

const energyPercentage = computed(() => {
  const current = simulation.gameState.resources.energy.current
  const cap = simulation.gameState.resources.energy.cap
  return cap > 0 ? (current / cap) * 100 : 0
})

const waterPercentage = computed(() => {
  const current = simulation.gameState.farm.waterTank.current
  const max = simulation.gameState.farm.waterTank.max
  return max > 0 ? (current / max) * 100 : 0
})

const activePlots = computed(() => {
  return simulation.gameState.farm.plots.filter(plot => plot.crop !== null)
})

const emptyPlots = computed(() => {
  return simulation.gameState.farm.plots.filter(plot => plot.crop === null)
})

const currentLocation = computed(() => {
  const location = simulation.gameState.heroes.currentLocation
  const locations = {
    home: { icon: '🌱', name: 'Home/Farm', color: '#28a745' },
    adventure: { icon: '⚔️', name: 'Adventure', color: '#dc3545' },
    mine: { icon: '⛏️', name: 'Mine', color: '#6f42c1' },
    forge: { icon: '⚒️', name: 'Forge', color: '#fd7e14' },
    tower: { icon: '🗼', name: 'Tower', color: '#17a2b8' },
    town: { icon: '🏰', name: 'Town', color: '#ffc107' }
  }
  return locations[location] || locations.home
})

const phaseProgress = computed(() => {
  const phases = ['tutorial', 'early', 'mid', 'late', 'endgame']
  const current = simulation.gameState.currentPhase
  const currentIndex = phases.indexOf(current)
  
  return phases.map((phase, index) => ({
    name: phase,
    status: index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'upcoming'
  }))
})

// Farm control variables
const selectedCrop = ref('')
const selectedPlotId = ref(1)

// Adventure control variables
const selectedAdventure = ref('')
const selectedDuration = ref('medium')

// Mining control variables
const selectedDepth = ref(1)
const miningDuration = ref(30)

// Analysis variables
const bottleneckResults = ref(null)

// Computed properties for advanced systems
const availableUpgrades = computed(() => {
  return Object.entries(gameValues.upgrades)
    .filter(([id, upgrade]) => simulation.isUpgradeAvailable(id))
    .map(([id, upgrade]) => ({ id, ...upgrade }))
    .sort((a, b) => a.cost.gold - b.cost.gold)
})

// Computed properties for adventure system
const heroIsBusy = computed(() => {
  return simulation.gameState.heroes.currentAction && simulation.gameState.heroes.currentAction.type !== 'idle'
})

// Farm control methods
function onPlotClick(plot) {
  selectedPlotId.value = plot.id
  
  if (plot.crop && plot.growthStage >= 4) {
    // Harvest if ready
    simulation.harvestCrop(plot.id)
  } else if (!plot.crop && selectedCrop.value) {
    // Plant if empty and crop selected
    simulation.plantCrop(plot.id, selectedCrop.value)
  }
}

function plantCropOnPlot() {
  if (selectedCrop.value && selectedPlotId.value) {
    simulation.plantCrop(selectedPlotId.value, selectedCrop.value)
  }
}

function harvestAllReadyCrops() {
  simulation.gameState.farm.plots.forEach(plot => {
    if (plot.crop && plot.growthStage >= 4) {
      simulation.harvestCrop(plot.id)
    }
  })
}

function addTestEnergy() {
  simulation.addResource('energy', 100)
}

function plantTestFarm() {
  // Plant carrots on first 3 plots for testing
  const testCrop = 'carrot'
  for (let i = 1; i <= 3; i++) {
    const plot = simulation.gameState.farm.plots.find(p => p.id === i)
    if (plot && !plot.crop) {
      simulation.plantCrop(i, testCrop)
    }
  }
}

// Adventure control methods
function startSelectedAdventure() {
  if (selectedAdventure.value && selectedDuration.value) {
    simulation.startAdventure(selectedAdventure.value, selectedDuration.value)
  }
}

// Mining control methods
function startSelectedMining() {
  simulation.startMining(selectedDepth.value, miningDuration.value)
}

function calculateMiningCost(depth) {
  return Math.floor(10 * Math.pow(depth, 1.5))
}

function calculateMiningReward(depth) {
  return Math.floor(50 * Math.pow(depth, 1.2))
}

// Helper system methods
function getHelperIcon(type) {
  const icons = {
    gnome: '🧙‍♂️',
    golem: '🗿',
    sprite: '🧚‍♀️',
    dragon: '🐉',
    phoenix: '🔥',
    ancient: '👑'
  }
  return icons[type] || '✨'
}

function formatAbility(ability) {
  return ability.replace('auto_', '').replace('_', ' ')
}

// Upgrade system methods
function canAfford(upgrade) {
  return simulation.canAffordUpgrade(upgrade.id)
}

function buyUpgrade(upgradeId) {
  simulation.purchaseUpgrade(upgradeId)
}

// Analysis methods
function runBottleneckAnalysis() {
  bottleneckResults.value = simulation.detectBottlenecks()
}

function getSeverityIcon(severity) {
  const icons = {
    high: '🚨',
    medium: '⚠️',
    low: '💡'
  }
  return icons[severity] || '📊'
}

function formatBottleneckType(type) {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const materials = computed(() => {
  return Object.entries(simulation.gameState.resources.materials).map(([name, amount]) => ({
    name,
    amount,
    icon: getMaterialIcon(name)
  }))
})

function getMaterialIcon(material) {
  const icons = {
    stone: '🪨',
    copper: '🔶',
    iron: '⚙️',
    silver: '⚪',
    crystal: '💎',
    mythril: '🌟',
    obsidian: '⚫'
  }
  return icons[material] || '📦'
}

function getPlotStatusIcon(plot) {
  if (!plot.crop) return '⬜'
  if (plot.growthStage === 0) return '🌱'
  if (plot.growthStage <= 2) return '🌿'
  if (plot.growthStage <= 4) return '🌾'
  return '✨' // Ready to harvest
}

function getPlotStatusClass(plot) {
  if (!plot.crop) return 'plot-empty'
  if (plot.growthStage === 0) return 'plot-planted'
  if (plot.growthStage <= 2) return 'plot-growing'
  if (plot.growthStage <= 4) return 'plot-mature'
  return 'plot-ready'
}
</script>

<template>
  <div class="game-visualizer">
    <h2>🎮 Game State</h2>

    <!-- World Layout Display -->
    <div class="section">
      <h3>🗺️ World Layout</h3>
      <div class="world-layout">
        <div class="world-row">
          <div class="location-spacer"></div>
          <div 
            class="location" 
            :class="{ active: currentLocation.name === 'Tower' }"
          >
            <span class="location-icon">🗼</span>
            <span class="location-name">Tower</span>
          </div>
          <div class="location-spacer"></div>
        </div>
        
        <div class="world-row">
          <div 
            class="location" 
            :class="{ active: currentLocation.name === 'Town' }"
          >
            <span class="location-icon">🏰</span>
            <span class="location-name">Town</span>
          </div>
          
          <div 
            class="location main-location" 
            :class="{ active: currentLocation.name === 'Home/Farm' }"
          >
            <span class="location-icon">🌱</span>
            <span class="location-name">Home/Farm</span>
          </div>
          
          <div 
            class="location" 
            :class="{ active: currentLocation.name === 'Adventure' }"
          >
            <span class="location-icon">⚔️</span>
            <span class="location-name">Adventure</span>
          </div>
        </div>
        
        <div class="world-row">
          <div class="location-spacer"></div>
          <div 
            class="location" 
            :class="{ active: currentLocation.name === 'Forge' }"
          >
            <span class="location-icon">⚒️</span>
            <span class="location-name">Forge</span>
          </div>
          <div class="location-spacer"></div>
        </div>
        
        <div class="world-row">
          <div class="location-spacer"></div>
          <div 
            class="location" 
            :class="{ active: currentLocation.name === 'Mine' }"
          >
            <span class="location-icon">⛏️</span>
            <span class="location-name">Mine</span>
          </div>
          <div class="location-spacer"></div>
        </div>
      </div>
    </div>

    <!-- Current Status -->
    <div class="section">
      <h3>📊 Current Status</h3>
      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">Energy:</span>
          <div class="progress-bar">
            <div 
              class="progress-fill energy" 
              :style="{ width: energyPercentage + '%' }"
            ></div>
            <span class="progress-text">
              {{ simulation.gameState.resources.energy.current }}/{{ simulation.gameState.resources.energy.cap }}
            </span>
          </div>
        </div>

        <div class="status-item">
          <span class="status-label">Gold:</span>
          <span class="status-value">{{ simulation.gameState.resources.gold }}</span>
        </div>

        <div class="status-item">
          <span class="status-label">Water:</span>
          <div class="progress-bar">
            <div 
              class="progress-fill water" 
              :style="{ width: waterPercentage + '%' }"
            ></div>
            <span class="progress-text">
              {{ simulation.gameState.farm.waterTank.current }}/{{ simulation.gameState.farm.waterTank.max }}
            </span>
          </div>
        </div>

        <div class="status-item">
          <span class="status-label">Helpers:</span>
          <span class="status-value">{{ simulation.gameState.helpers.length }}</span>
        </div>
      </div>
    </div>

    <!-- Materials -->
    <div class="section" v-if="materials.some(m => m.amount > 0)">
      <h3>🛠️ Materials</h3>
      <div class="materials-grid">
        <div 
          v-for="material in materials.filter(m => m.amount > 0)" 
          :key="material.name"
          class="material-item"
        >
          <span class="material-icon">{{ material.icon }}</span>
          <span class="material-name">{{ material.name }}</span>
          <span class="material-amount">{{ material.amount }}</span>
        </div>
      </div>
    </div>

    <!-- Farm Overview -->
    <div class="section">
      <h3>🚜 Farm Overview</h3>
      <div class="farm-stats">
        <div class="farm-stat">
          <span class="farm-stat-label">Total Plots:</span>
          <span class="farm-stat-value">{{ simulation.gameState.farm.plots.length }}</span>
        </div>
        <div class="farm-stat">
          <span class="farm-stat-label">Active:</span>
          <span class="farm-stat-value">{{ activePlots.length }}</span>
        </div>
        <div class="farm-stat">
          <span class="farm-stat-label">Empty:</span>
          <span class="farm-stat-value">{{ emptyPlots.length }}</span>
        </div>
        <div class="farm-stat">
          <span class="farm-stat-label">Camera Width:</span>
          <span class="farm-stat-value">{{ simulation.gameState.farm.cameraWidth }} tiles</span>
        </div>
      </div>

      <!-- Plot Grid Visualization -->
      <div class="plots-grid">
        <div 
          v-for="plot in simulation.gameState.farm.plots" 
          :key="plot.id"
          class="plot"
          :class="getPlotStatusClass(plot)"
          :title="`Plot ${plot.id}: ${plot.crop || 'Empty'} ${plot.growthStage ? '(Stage ' + plot.growthStage + ')' : ''}`"
          @click="onPlotClick(plot)"
        >
          {{ getPlotStatusIcon(plot) }}
        </div>
      </div>
    </div>

    <!-- Farm Controls (Testing) -->
    <div class="section">
      <h3>🛠️ Farm Controls (Testing)</h3>
      <div class="farm-controls">
        <div class="control-row">
          <label>Plant Crop:</label>
          <select v-model="selectedCrop">
            <option value="">Select crop...</option>
            <option v-for="(crop, id) in gameValues.crops" :key="id" :value="id">
              {{ crop.name }} ({{ crop.energy }} energy, {{ crop.growthTime }}min)
            </option>
          </select>
          <input 
            v-model.number="selectedPlotId" 
            type="number" 
            min="1" 
            :max="simulation.gameState.farm.plots.length"
            placeholder="Plot ID"
          >
          <button @click="plantCropOnPlot" :disabled="!selectedCrop || !selectedPlotId">
            Plant
          </button>
        </div>
        
        <div class="control-row">
          <button @click="harvestAllReadyCrops">Harvest All Ready</button>
          <button @click="addTestEnergy">+100 Energy (Test)</button>
          <button @click="plantTestFarm">Plant Test Farm</button>
        </div>
        
        <div class="simulation-info">
          <span>Game Time Elapsed: {{ Math.floor(simulation.metrics.gameTimeElapsed / 60) }}h {{ simulation.metrics.gameTimeElapsed % 60 }}m</span>
          <span>Energy Generated: {{ simulation.metrics.resourceFlows.energyGenerated.toFixed(1) }}</span>
          <span>Energy Wasted: {{ simulation.metrics.resourceFlows.energyWasted.toFixed(1) }}</span>
        </div>
      </div>
    </div>

    <!-- Adventure Controls (Testing) -->
    <div class="section">
      <h3>⚔️ Adventure System (Testing)</h3>
      <div class="adventure-controls">
        <div class="control-row">
          <label>Adventure:</label>
          <select v-model="selectedAdventure">
            <option value="">Select adventure...</option>
            <option v-for="(adventure, id) in gameValues.adventures" :key="id" :value="id">
              {{ adventure.name }} (Day {{ adventure.unlockDay }}+)
            </option>
          </select>
          <select v-model="selectedDuration">
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
          <button @click="startSelectedAdventure" :disabled="!selectedAdventure || heroIsBusy">
            Start Adventure
          </button>
        </div>
        
        <div class="adventure-info" v-if="selectedAdventure && gameValues.adventures[selectedAdventure]">
          <div class="adventure-details">
            <strong>{{ gameValues.adventures[selectedAdventure].name }}</strong>
            <div class="duration-options">
              <div v-for="dur in ['short', 'medium', 'long']" :key="dur" 
                   :class="['duration-option', { selected: selectedDuration === dur }]">
                <span class="duration-name">{{ dur }}</span>
                <span class="energy-cost">{{ gameValues.adventures[selectedAdventure][dur + 'Energy'] }} energy</span>
                <span class="duration-time">{{ gameValues.adventures[selectedAdventure][dur + 'Duration'] }}min</span>
              </div>
            </div>
            <div class="rewards">
              <span>Reward: {{ gameValues.adventures[selectedAdventure].goldReward }} gold</span>
            </div>
          </div>
        </div>
        
        <div class="hero-status">
          <strong>Hero Status:</strong>
          <span v-if="!simulation.gameState.heroes.currentAction">🏠 At Home (Available)</span>
          <span v-else-if="simulation.gameState.heroes.currentAction.type === 'adventure'">
            ⚔️ On Adventure ({{ simulation.gameState.heroes.currentAction.timeRemaining }}min remaining)
          </span>
          <span v-else-if="simulation.gameState.heroes.currentAction.type === 'mining'">
            ⛏️ Mining ({{ simulation.gameState.heroes.currentAction.timeRemaining }}min remaining)
          </span>
          <span v-else>
            ⚡ {{ simulation.gameState.heroes.currentAction.type }} ({{ simulation.gameState.heroes.currentAction.timeRemaining }}min remaining)
          </span>
        </div>
      </div>
    </div>

    <!-- Mining Controls (Testing) -->
    <div class="section">
      <h3>⛏️ Mining System (Testing)</h3>
      <div class="mining-controls">
        <div class="control-row">
          <label>Depth:</label>
          <input 
            v-model.number="selectedDepth" 
            type="number" 
            min="1" 
            max="20"
            placeholder="Depth"
          >
          <input 
            v-model.number="miningDuration" 
            type="number" 
            min="10" 
            max="120"
            placeholder="Duration (min)"
          >
          <button @click="startSelectedMining" :disabled="heroIsBusy">
            Start Mining
          </button>
        </div>
        
        <div class="mining-info">
          <div class="mining-costs">
            <span>Energy Cost: {{ calculateMiningCost(selectedDepth) }}</span>
            <span>Expected Gold: ~{{ calculateMiningReward(selectedDepth) }}</span>
            <span>Materials: {{ selectedDepth * 2 }} stone + rare materials</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Helper System -->
    <div class="section">
      <h3>🧙 Helper System</h3>
      <div class="helper-display">
        <div v-if="simulation.gameState.helpers.length === 0" class="no-helpers">
          <p>No helpers discovered yet</p>
          <div class="discovery-info">
            <span>Discovery chance increases with active plots (currently: {{ activePlots.length }})</span>
            <span>First helper typically found around 20+ plots on day 4-5</span>
          </div>
        </div>
        <div v-else class="helpers-list">
          <div v-for="helper in simulation.gameState.helpers" :key="helper.id" class="helper-card">
            <div class="helper-header">
              <span class="helper-icon">{{ getHelperIcon(helper.type) }}</span>
              <div class="helper-info">
                <strong>{{ helper.name }}</strong>
                <span class="helper-discovered">Found on Day {{ helper.discoveredDay }}</span>
              </div>
              <span class="helper-status" :class="{ active: helper.active }">
                {{ helper.active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="helper-abilities">
              <span v-for="ability in helper.abilities" :key="ability" class="ability-tag">
                {{ formatAbility(ability) }}
              </span>
            </div>
            <div class="helper-efficiency">
              Efficiency: {{ (helper.efficiency * 100).toFixed(0) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade System -->
    <div class="section">
      <h3>🔧 Upgrade System</h3>
      <div class="upgrade-display">
        <div class="upgrade-stats">
          <span>Owned Upgrades: {{ simulation.gameState.upgrades.owned.length }}</span>
          <span>Available Blueprints: {{ simulation.gameState.upgrades.blueprints.length }}</span>
        </div>
        
        <div class="available-upgrades">
          <h4>Available Upgrades:</h4>
          <div v-if="availableUpgrades.length === 0" class="no-upgrades">
            No upgrades available (check unlock days or resources)
          </div>
          <div v-else class="upgrades-list">
            <div v-for="upgrade in availableUpgrades.slice(0, 5)" :key="upgrade.id" 
                 class="upgrade-card" :class="{ affordable: canAfford(upgrade) }">
              <div class="upgrade-header">
                <strong>{{ upgrade.name }}</strong>
                <span class="upgrade-category">{{ upgrade.category }}</span>
              </div>
              <div class="upgrade-cost">
                <span v-if="upgrade.cost.gold > 0">{{ upgrade.cost.gold }}g</span>
                <span v-if="upgrade.cost.energy > 0">{{ upgrade.cost.energy }}e</span>
                <span v-for="(amount, material) in upgrade.cost" :key="material"
                      v-if="material !== 'gold' && material !== 'energy' && amount > 0">
                  {{ amount }}{{ material.substring(0,2) }}
                </span>
              </div>
              <div class="upgrade-effect">{{ upgrade.description }}</div>
              <button @click="buyUpgrade(upgrade.id)" 
                      :disabled="!canAfford(upgrade)"
                      class="upgrade-btn">
                Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottleneck Analysis -->
    <div class="section">
      <h3>🔍 Bottleneck Analysis</h3>
      <div class="analysis-display">
        <button @click="runBottleneckAnalysis" class="analysis-btn">
          Run Analysis
        </button>
        
        <div v-if="bottleneckResults" class="analysis-results">
          <div v-if="bottleneckResults.length === 0" class="no-bottlenecks">
            ✅ No major bottlenecks detected! Progression looks healthy.
          </div>
          <div v-else class="bottlenecks-list">
            <div v-for="bottleneck in bottleneckResults" :key="bottleneck.type"
                 class="bottleneck-item" :class="bottleneck.severity">
              <div class="bottleneck-header">
                <span class="severity-icon">{{ getSeverityIcon(bottleneck.severity) }}</span>
                <strong>{{ formatBottleneckType(bottleneck.type) }}</strong>
              </div>
              <div class="bottleneck-description">{{ bottleneck.description }}</div>
              <div class="bottleneck-suggestion">💡 {{ bottleneck.suggestion }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phase Progression -->
    <div class="section">
      <h3>🎯 Phase Progression</h3>
      <div class="phase-timeline">
        <div 
          v-for="phase in phaseProgress" 
          :key="phase.name"
          class="phase-item"
          :class="phase.status"
        >
          <div class="phase-indicator">
            <span v-if="phase.status === 'completed'">✓</span>
            <span v-else-if="phase.status === 'current'">▶</span>
            <span v-else>○</span>
          </div>
          <span class="phase-name">{{ phase.name }}</span>
        </div>
      </div>
    </div>

    <!-- Current Action -->
    <div class="section" v-if="simulation.gameState.heroes.currentAction">
      <h3>⚡ Current Action</h3>
      <div class="current-action">
        <p><strong>Type:</strong> {{ simulation.gameState.heroes.currentAction.type }}</p>
        <p><strong>Target:</strong> {{ simulation.gameState.heroes.currentAction.target }}</p>
        <p v-if="simulation.gameState.heroes.currentAction.timeRemaining">
          <strong>Time Remaining:</strong> {{ simulation.gameState.heroes.currentAction.timeRemaining }} min
        </p>
      </div>
    </div>

    <!-- Testing & Reporting Panel -->
    <div class="section">
      <h3>🧪 Testing & Reporting</h3>
      <div class="testing-controls">
        <button @click="showTestingPanel = !showTestingPanel" class="toggle-btn">
          {{ showTestingPanel ? '▼' : '▶' }} {{ showTestingPanel ? 'Hide' : 'Show' }} Testing Panel
        </button>
        
        <div v-if="showTestingPanel" class="testing-panel">
          <div class="testing-section">
            <h4>🏃‍♂️ Quick Test Scenarios</h4>
            <div class="scenario-selector">
              <label>Test Scenario:</label>
              <select v-model="testScenario">
                <option v-for="scenario in testScenarios" :key="scenario.value" :value="scenario.value">
                  {{ scenario.icon }} {{ scenario.label }}
                </option>
              </select>
              <button @click="runTestScenario" class="test-btn">Run Test</button>
            </div>
            
            <div class="scenario-descriptions">
              <div class="scenario-desc">
                <strong>Speedrunner:</strong> Optimal play patterns, 10+ daily check-ins, max efficiency
              </div>
              <div class="scenario-desc">
                <strong>Casual:</strong> 2-4 daily check-ins, moderate efficiency, balanced approach
              </div>
              <div class="scenario-desc">
                <strong>Weekend Warrior:</strong> Heavy weekend play, light weekday engagement
              </div>
              <div class="scenario-desc">
                <strong>Balance Test:</strong> Standard test profile for game balance validation
              </div>
            </div>
          </div>

          <div class="testing-section">
            <h4>📊 Comprehensive Reporting</h4>
            <div class="report-controls">
              <button @click="generateReport" class="report-btn">
                📈 Generate Full Report
              </button>
              
              <div class="export-controls">
                <label>Export Format:</label>
                <select v-model="reportFormat">
                  <option v-for="format in exportFormats" :key="format.value" :value="format.value">
                    {{ format.label }}
                  </option>
                </select>
                <button @click="exportCurrentReport" class="export-btn">
                  💾 Export Report
                </button>
              </div>
            </div>
          </div>

          <div class="testing-section" v-if="results.latestReport">
            <h4>📋 Latest Report Summary</h4>
            <div class="report-summary">
              <div class="summary-stat">
                <span class="stat-label">Game Day:</span>
                <span class="stat-value">{{ results.latestReport.gameState?.day || 'N/A' }}</span>
              </div>
              <div class="summary-stat">
                <span class="stat-label">Phase:</span>
                <span class="stat-value">{{ results.latestReport.gameState?.phase || 'N/A' }}</span>
              </div>
              <div class="summary-stat">
                <span class="stat-label">Active Plots:</span>
                <span class="stat-value">{{ results.latestReport.gameState?.activePlots || 'N/A' }}</span>
              </div>
              <div class="summary-stat">
                <span class="stat-label">Helpers:</span>
                <span class="stat-value">{{ results.latestReport.gameState?.helpers || 'N/A' }}</span>
              </div>
              <div class="summary-stat">
                <span class="stat-label">Energy Efficiency:</span>
                <span class="stat-value">
                  {{ results.latestReport.balance?.energyBalance?.efficiency 
                     ? (results.latestReport.balance.energyBalance.efficiency * 100).toFixed(1) + '%' 
                     : 'N/A' }}
                </span>
              </div>
            </div>
          </div>

          <div class="testing-section" v-if="testResults">
            <h4>🎯 Test Results</h4>
            <div class="test-results">
              {{ testResults }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Visualization Section -->
    <div class="section">
      <div class="visualization-header">
        <h3>📊 Advanced Visualization</h3>
        <div class="header-controls">
          <div class="chart-toggles">
            <button 
              v-for="(shown, chartType) in showCharts" 
              :key="chartType"
              @click="showCharts[chartType] = !shown"
              class="chart-toggle"
              :class="{ active: shown }"
            >
              {{ chartType }}
            </button>
          </div>
          
          <button 
            @click="showAnalysisPanel = !showAnalysisPanel"
            class="analysis-toggle"
            :class="{ active: showAnalysisPanel }"
          >
            🔬 Advanced Analysis
          </button>
        </div>
      </div>
      
      <div class="charts-grid">
        <div v-if="showCharts.resources" class="chart-row">
          <ResourceChart />
        </div>
        
        <div v-if="showCharts.phases" class="chart-row">
          <PhaseTimeline />
        </div>
        
        <div v-if="showCharts.upgrades" class="chart-row">
          <UpgradeChart />
        </div>
        
        <div v-if="showCharts.bottlenecks" class="chart-row">
          <BottleneckChart />
        </div>
        
        <div v-if="showCharts.helpers" class="chart-row">
          <HelperChart />
        </div>
      </div>
    </div>

    <!-- Advanced Analysis Panel -->
    <div v-if="showAnalysisPanel" class="section analysis-panel">
      <div class="analysis-header">
        <h3>🔬 Advanced Analysis Tools</h3>
        <div class="analysis-mode-tabs">
          <button 
            v-for="mode in ['charts', 'monte-carlo', 'ab-testing', 'bottlenecks']"
            :key="mode"
            @click="analysisMode = mode"
            class="mode-tab"
            :class="{ active: analysisMode === mode }"
          >
            {{
              mode === 'charts' ? '📊 Charts' :
              mode === 'monte-carlo' ? '🎲 Monte Carlo' :
              mode === 'ab-testing' ? '⚖️ A/B Testing' :
              '🔍 Bottlenecks'
            }}
          </button>
        </div>
      </div>

      <div class="analysis-content">
        <div v-if="analysisMode === 'charts'" class="analysis-section">
          <p class="analysis-description">
            Use the chart toggles above to customize your visualization. 
            Charts show real-time game state and historical progression data.
          </p>
        </div>

        <div v-if="analysisMode === 'monte-carlo'" class="analysis-section">
          <MonteCarloPanel />
        </div>

        <div v-if="analysisMode === 'ab-testing'" class="analysis-section">
          <ABTestingPanel />
        </div>

        <div v-if="analysisMode === 'bottlenecks'" class="analysis-section">
          <BottleneckAnalyzer />
        </div>
      </div>
    </div>

    <!-- Milestone Notifications (Fixed Position Overlay) -->
    <MilestoneNotifications ref="milestoneNotifications" />
  </div>
</template>

<style scoped>
.game-visualizer {
  height: 100%;
  overflow-y: auto;
}

.game-visualizer h2 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.section:last-child {
  border-bottom: none;
}

.section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
}

/* World Layout */
.world-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.world-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.location {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border: 2px solid #dee2e6;
  border-radius: 0.5rem;
  background: white;
  min-width: 80px;
  transition: all 0.3s;
}

.location.active {
  border-color: #007bff;
  background: #e3f2fd;
  transform: scale(1.05);
}

.location.main-location {
  padding: 1rem;
  min-width: 100px;
}

.location-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.location-name {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: center;
}

.location-spacer {
  width: 80px;
}

/* Status */
.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.status-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.progress-bar {
  position: relative;
  height: 1.5rem;
  background: #e9ecef;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s;
}

.progress-fill.energy {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.progress-fill.water {
  background: linear-gradient(90deg, #007bff, #17a2b8);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: 600;
  color: #2c3e50;
}

/* Materials */
.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.75rem;
}

.material-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
  text-align: center;
}

.material-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.material-name {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: capitalize;
}

.material-amount {
  font-weight: 600;
  color: #2c3e50;
}

/* Farm */
.farm-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.farm-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
}

.farm-stat-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.farm-stat-value {
  font-weight: 600;
  color: #2c3e50;
}

.plots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
  gap: 0.25rem;
  max-width: 100%;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.plot {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  border-radius: 0.25rem;
  border: 1px solid #dee2e6;
  cursor: help;
}

.plot-empty {
  background: #ffffff;
}

.plot-planted {
  background: #e8f5e8;
}

.plot-growing {
  background: #d4edda;
}

.plot-mature {
  background: #c3e6cb;
}

.plot-ready {
  background: #b3d8c7;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Phase Timeline */
.phase-timeline {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.phase-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
}

.phase-indicator {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.phase-item.completed .phase-indicator {
  background: #28a745;
  color: white;
}

.phase-item.current .phase-indicator {
  background: #007bff;
  color: white;
}

.phase-item.upcoming .phase-indicator {
  background: #e9ecef;
  color: #6c757d;
}

.phase-name {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: capitalize;
}

.phase-item.current .phase-name {
  color: #007bff;
  font-weight: 600;
}

/* Current Action */
.current-action {
  padding: 1rem;
  background: #fff3cd;
  border-radius: 0.5rem;
  border: 1px solid #ffeaa7;
}

.current-action p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

/* Farm Controls */
.farm-controls {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.control-row:last-child {
  margin-bottom: 0;
}

.control-row label {
  font-weight: 500;
  min-width: 80px;
}

.control-row select,
.control-row input {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.control-row button {
  padding: 0.25rem 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.control-row button:hover:not(:disabled) {
  background: #0056b3;
}

.control-row button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.simulation-info {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #dee2e6;
  font-size: 0.85rem;
  color: #6c757d;
  flex-wrap: wrap;
}

.plot {
  cursor: pointer;
  transition: transform 0.2s;
}

.plot:hover {
  transform: scale(1.1);
}

.plot-ready {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Adventure Controls */
.adventure-controls {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.adventure-info {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.25rem;
  border: 1px solid #dee2e6;
}

.adventure-details strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
}

.duration-options {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.duration-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background: #f8f9fa;
  font-size: 0.8rem;
  min-width: 70px;
}

.duration-option.selected {
  border-color: #007bff;
  background: #e3f2fd;
}

.duration-name {
  font-weight: 600;
  text-transform: capitalize;
}

.energy-cost {
  color: #dc3545;
  font-weight: 500;
}

.duration-time {
  color: #6c757d;
}

.rewards {
  font-size: 0.9rem;
  color: #28a745;
  font-weight: 500;
}

.hero-status {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
  font-size: 0.9rem;
}

.hero-status strong {
  margin-right: 0.5rem;
}

/* Mining Controls */
.mining-controls {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.mining-info {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.25rem;
  border: 1px solid #dee2e6;
}

.mining-costs {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.mining-costs span {
  color: #6c757d;
}

/* Helper System */
.helper-display {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.no-helpers {
  text-align: center;
  color: #6c757d;
}

.discovery-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #6c757d;
}

.helpers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.helper-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
}

.helper-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.helper-icon {
  font-size: 1.5rem;
}

.helper-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.helper-discovered {
  font-size: 0.8rem;
  color: #6c757d;
}

.helper-status {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #dc3545;
  color: white;
}

.helper-status.active {
  background: #28a745;
}

.helper-abilities {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.ability-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.helper-efficiency {
  font-size: 0.9rem;
  color: #6c757d;
}

/* Upgrade System */
.upgrade-display {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.upgrade-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.available-upgrades h4 {
  margin: 0 0 0.75rem 0;
  color: #495057;
}

.no-upgrades {
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

.upgrades-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upgrade-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 0.75rem;
  opacity: 0.6;
}

.upgrade-card.affordable {
  opacity: 1;
  border-color: #28a745;
}

.upgrade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.upgrade-category {
  background: #e9ecef;
  color: #6c757d;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.upgrade-cost {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: #dc3545;
  font-weight: 500;
}

.upgrade-effect {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.75rem;
}

.upgrade-btn {
  padding: 0.25rem 0.75rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.upgrade-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Bottleneck Analysis */
.analysis-display {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.analysis-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

.analysis-btn:hover {
  background: #0056b3;
}

.no-bottlenecks {
  text-align: center;
  color: #28a745;
  font-weight: 500;
  padding: 1rem;
}

.bottlenecks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bottleneck-item {
  background: white;
  border-left: 4px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 0.75rem;
}

.bottleneck-item.high {
  border-left-color: #dc3545;
}

.bottleneck-item.medium {
  border-left-color: #ffc107;
}

.bottleneck-item.low {
  border-left-color: #17a2b8;
}

.bottleneck-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.severity-icon {
  font-size: 1.2rem;
}

.bottleneck-description {
  color: #6c757d;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.bottleneck-suggestion {
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Testing Panel Styles */
.testing-controls {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
}

.toggle-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 1rem;
  width: 100%;
}

.toggle-btn:hover {
  background: #545b62;
}

.testing-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.testing-section {
  background: white;
  border-radius: 0.375rem;
  padding: 1rem;
  border: 1px solid #dee2e6;
}

.testing-section h4 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
}

.scenario-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.scenario-selector label {
  font-weight: 500;
  color: #495057;
}

.scenario-selector select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.test-btn, .report-btn, .export-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
}

.test-btn {
  background: #28a745;
  color: white;
}

.test-btn:hover {
  background: #218838;
}

.report-btn {
  background: #007bff;
  color: white;
  margin-bottom: 1rem;
}

.report-btn:hover {
  background: #0056b3;
}

.export-btn {
  background: #6f42c1;
  color: white;
}

.export-btn:hover {
  background: #5a32a3;
}

.scenario-descriptions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.scenario-desc {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  border-left: 3px solid #dee2e6;
}

.report-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.export-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.export-controls label {
  font-weight: 500;
  color: #495057;
}

.export-controls select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.report-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border-left: 3px solid #007bff;
}

.stat-label {
  font-weight: 500;
  color: #495057;
}

.stat-value {
  font-weight: 600;
  color: #212529;
}

.test-results {
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #c3e6cb;
  font-family: monospace;
  font-size: 0.9rem;
}

/* Charts Grid */
.charts-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-row {
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

/* Chart Visualization Enhancements */
.visualization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chart-toggles {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chart-toggle {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  background: white;
  color: #6c757d;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  text-transform: capitalize;
  transition: all 0.2s ease;
}

.chart-toggle:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.analysis-toggle {
  padding: 0.5rem 1rem;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.analysis-toggle:hover {
  background: #e3f2fd;
}

.analysis-toggle.active {
  background: #007bff;
  color: white;
}

/* Advanced Analysis Panel */
.analysis-panel {
  background: #f8f9fa;
  border: 2px solid #007bff;
  border-radius: 8px;
  margin-top: 1rem;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.analysis-mode-tabs {
  display: flex;
  gap: 0.25rem;
  background: #e9ecef;
  border-radius: 6px;
  padding: 0.25rem;
}

.mode-tab {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #6c757d;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mode-tab:hover {
  color: #495057;
  background: rgba(255, 255, 255, 0.5);
}

.mode-tab.active {
  background: white;
  color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.analysis-content {
  min-height: 400px;
}

.analysis-section {
  height: 100%;
}

.analysis-description {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  padding: 2rem;
  margin: 0;
}

.chart-toggle.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* Animation for chart transitions */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 1200px) {
  .charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  
  .chart-row:first-child {
    grid-column: 1 / -1;
  }
}

/* Responsive Design for Charts */
@media (max-width: 768px) {
  .visualization-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .chart-toggles {
    justify-content: center;
  }
  
  .chart-toggle {
    flex: 1;
    text-align: center;
    min-width: 80px;
  }
}
</style>
