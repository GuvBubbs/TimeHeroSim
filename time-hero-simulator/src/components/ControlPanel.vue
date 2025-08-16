<script setup>
import { computed } from 'vue'
import { useSimulationStore } from '../stores/simulation.js'
import { useGameValuesStore } from '../stores/gameValues.js'

const simulation = useSimulationStore()
const gameValues = useGameValuesStore()

const gameDataSummary = computed(() => {
  return {
    crops: Object.keys(gameValues.crops).length,
    adventures: Object.keys(gameValues.adventures).length,
    upgrades: Object.keys(gameValues.upgrades).length
  }
})

function toggleSimulation() {
  if (simulation.isRunning) {
    if (simulation.isPaused) {
      simulation.resumeSimulation()
    } else {
      simulation.pauseSimulation()
    }
  } else {
    simulation.startSimulation()
  }
}

async function initializeWorker() {
  try {
    await simulation.initializeWorker()
    console.log('Worker initialized successfully')
  } catch (error) {
    console.error('Worker initialization failed:', error)
  }
}

function resetSimulation() {
  simulation.resetSimulation()
}

function updateCheckIns(type, value) {
  const newProfile = { ...simulation.playerProfile }
  newProfile.dailyCheckIns[type] = parseInt(value)
  simulation.updatePlayerProfile(newProfile)
}

function updateSessionLength(type, value) {
  const newProfile = { ...simulation.playerProfile }
  newProfile.sessionLength[type] = parseInt(value)
  simulation.updatePlayerProfile(newProfile)
}

function updateEfficiency(phase, value) {
  const newProfile = { ...simulation.playerProfile }
  newProfile.efficiency[phase] = parseFloat(value)
  simulation.updatePlayerProfile(newProfile)
}

function setSimulationSpeed(speed) {
  simulation.setSimulationSpeed(speed)
}
</script>

<template>
  <div class="control-panel">
    <h2>🎮 Control Panel</h2>
    
    <!-- Game Data Status -->
    <div class="section">
      <h3>📊 Game Data</h3>
      <div class="data-summary">
        <div class="data-item">
          <span class="label">Crops:</span>
          <span class="value">{{ gameDataSummary.crops }}</span>
        </div>
        <div class="data-item">
          <span class="label">Adventures:</span>
          <span class="value">{{ gameDataSummary.adventures }}</span>
        </div>
        <div class="data-item">
          <span class="label">Upgrades:</span>
          <span class="value">{{ gameDataSummary.upgrades }}</span>
        </div>
      </div>
    </div>

    <!-- Worker Status -->
    <div class="section">
      <h3>⚙️ Worker Status</h3>
      <div class="worker-status">
        <div class="data-item">
          <span class="label">Worker:</span>
          <span :class="['value', simulation.isWorkerInitialized ? 'status-ready' : 'status-not-ready']">
            {{ simulation.isWorkerInitialized ? '✅ Ready' : '❌ Not Ready' }}
          </span>
        </div>
        <div class="data-item" v-if="simulation.performanceMetrics.totalTicks > 0">
          <span class="label">Ticks/sec:</span>
          <span class="value">{{ Math.round(simulation.performanceMetrics.ticksPerSecond) }}</span>
        </div>
        <div class="data-item" v-if="simulation.performanceMetrics.totalTicks > 0">
          <span class="label">Total Ticks:</span>
          <span class="value">{{ simulation.performanceMetrics.totalTicks }}</span>
        </div>
      </div>
      <button 
        @click="initializeWorker" 
        :disabled="simulation.isWorkerInitialized"
        class="btn-secondary"
      >
        🔧 Initialize Worker
      </button>
    </div>

    <!-- Simulation Controls -->
    <div class="section">
      <h3>⚡ Simulation</h3>
      <div class="controls">
        <button 
          @click="toggleSimulation"
          :class="['btn-primary', { 'btn-success': !simulation.isRunning, 'btn-warning': simulation.isPaused }]"
        >
          {{ !simulation.isRunning ? '▶️ Start' : simulation.isPaused ? '▶️ Resume' : '⏸️ Pause' }}
        </button>
        
        <button @click="resetSimulation" class="btn-secondary">
          🔄 Reset
        </button>
      </div>

      <div class="speed-controls">
        <label><strong>Simulation Speed:</strong></label>
        <div class="speed-buttons">
          <button 
            v-for="speed in [1, 10, 100, 'max']" 
            :key="speed"
            @click="setSimulationSpeed(speed)"
            :class="['speed-btn', { active: simulation.simulationSpeed === speed }]"
          >
            {{ speed }}x
          </button>
        </div>
      </div>

      <div class="status">
        <p><strong>Status:</strong> 
          <span :class="['status-badge', {
            'status-running': simulation.isRunning && !simulation.isPaused,
            'status-paused': simulation.isPaused,
            'status-stopped': !simulation.isRunning
          }]">
            {{ !simulation.isRunning ? 'Stopped' : simulation.isPaused ? 'Paused' : 'Running' }}
          </span>
        </p>
        <p><strong>Game Time:</strong> {{ simulation.gameTime }}</p>
        <p><strong>Phase:</strong> {{ simulation.gameState.currentPhase }}</p>
      </div>
    </div>

    <!-- Player Profile Settings -->
    <div class="section">
      <h3>👤 Player Profile</h3>
      
      <div class="parameter-group">
        <h4>Daily Check-ins</h4>
        <div class="parameter">
          <label>Weekdays:</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            :value="simulation.playerProfile.dailyCheckIns.weekday"
            @input="updateCheckIns('weekday', $event.target.value)"
          />
          <span class="value">{{ simulation.playerProfile.dailyCheckIns.weekday }}</span>
        </div>
        <div class="parameter">
          <label>Weekends:</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            :value="simulation.playerProfile.dailyCheckIns.weekend"
            @input="updateCheckIns('weekend', $event.target.value)"
          />
          <span class="value">{{ simulation.playerProfile.dailyCheckIns.weekend }}</span>
        </div>
      </div>

      <div class="parameter-group">
        <h4>Session Length (minutes)</h4>
        <div class="parameter">
          <label>Weekdays:</label>
          <input 
            type="range" 
            min="5" 
            max="60" 
            :value="simulation.playerProfile.sessionLength.weekday"
            @input="updateSessionLength('weekday', $event.target.value)"
          />
          <span class="value">{{ simulation.playerProfile.sessionLength.weekday }}</span>
        </div>
        <div class="parameter">
          <label>Weekends:</label>
          <input 
            type="range" 
            min="5" 
            max="120" 
            :value="simulation.playerProfile.sessionLength.weekend"
            @input="updateSessionLength('weekend', $event.target.value)"
          />
          <span class="value">{{ simulation.playerProfile.sessionLength.weekend }}</span>
        </div>
      </div>

      <div class="parameter-group">
        <h4>Efficiency by Phase</h4>
        <div class="parameter" v-for="(efficiency, phase) in simulation.playerProfile.efficiency" :key="phase">
          <label>{{ phase }}:</label>
          <input 
            type="range" 
            min="0.3" 
            max="1.0" 
            step="0.05"
            :value="efficiency"
            @input="updateEfficiency(phase, $event.target.value)"
          />
          <span class="value">{{ Math.round(efficiency * 100) }}%</span>
        </div>
      </div>
    </div>

    <!-- Quick Presets -->
    <div class="section">
      <h3>⚡ Quick Presets</h3>
      <div class="presets">
        <button class="preset-btn" @click="simulation.updatePlayerProfile({
          dailyCheckIns: { weekday: 10, weekend: 12 },
          sessionLength: { weekday: 30, weekend: 60 },
          efficiency: { tutorial: 0.95, early: 0.95, mid: 0.95, late: 0.95, endgame: 0.95 }
        })">
          🏃 Speedrunner
        </button>
        
        <button class="preset-btn" @click="simulation.updatePlayerProfile({
          dailyCheckIns: { weekday: 2, weekend: 4 },
          sessionLength: { weekday: 10, weekend: 25 },
          efficiency: { tutorial: 0.65, early: 0.70, mid: 0.75, late: 0.80, endgame: 0.85 }
        })">
          😴 Casual
        </button>
        
        <button class="preset-btn" @click="simulation.updatePlayerProfile({
          dailyCheckIns: { weekday: 1, weekend: 6 },
          sessionLength: { weekday: 5, weekend: 45 },
          efficiency: { tutorial: 0.70, early: 0.75, mid: 0.80, late: 0.85, endgame: 0.90 }
        })">
          🎮 Weekend Warrior
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.control-panel {
  height: 100%;
  overflow-y: auto;
}

.control-panel h2 {
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

.section h4 {
  margin: 1rem 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 600;
}

.data-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #6c757d;
  font-size: 0.9rem;
}

.value {
  font-weight: 600;
  color: #2c3e50;
}

.controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.status {
  font-size: 0.9rem;
}

.status p {
  margin: 0.25rem 0;
}

.status-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-running {
  background: #d4edda;
  color: #155724;
}

.status-paused {
  background: #fff3cd;
  color: #856404;
}

.status-stopped {
  background: #f8d7da;
  color: #721c24;
}

.parameter-group {
  margin-bottom: 1rem;
}

.parameter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.parameter label {
  min-width: 80px;
  font-size: 0.9rem;
  color: #6c757d;
}

.parameter input[type="range"] {
  flex: 1;
}

.parameter .value {
  min-width: 40px;
  text-align: right;
  font-size: 0.8rem;
  font-weight: 600;
}

.presets {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preset-btn {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background: white;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 0.9rem;
}

.preset-btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

/* Speed Controls */
.speed-controls {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.speed-controls label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #495057;
}

.speed-buttons {
  display: flex;
  gap: 0.25rem;
}

.speed-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background: white;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
  font-weight: 500;
}

.speed-btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.speed-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* Worker Status Styles */
.worker-status {
  margin-bottom: 1rem;
}

.status-ready {
  color: #28a745;
  font-weight: 600;
}

.status-not-ready {
  color: #dc3545;
  font-weight: 600;
}

.worker-status .btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
