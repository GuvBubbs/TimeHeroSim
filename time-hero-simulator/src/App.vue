<script setup>
import { onMounted } from 'vue'
import { useGameValuesStore } from './stores/gameValues.js'
import { useSimulationStore } from './stores/simulation.js'
import { loadAllGameData } from './utils/importers.js'
import ControlPanel from './components/ControlPanel.vue'
import GameVisualizer from './components/GameVisualizer.vue'
import EventLog from './components/EventLog.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'

const gameValues = useGameValuesStore()
const simulation = useSimulationStore()

// Load game data on app startup
onMounted(async () => {
  try {
    const gameData = await loadAllGameData()
    gameValues.loadGameValues(gameData)
    gameValues.validateGameValues()
    
    // Initialize worker for better performance
    await simulation.initializeWorker()
    console.log('✅ Simulation worker initialized on app startup')
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
})
</script>

<template>
  <ErrorBoundary>
    <div id="app">
      <header class="app-header">
        <h1>🌱 Time Hero Game Balance Simulator</h1>
        <p class="subtitle">Validate and tune the game's economy through comprehensive simulation</p>
      </header>

      <main class="app-main">
        <div v-if="!gameValues.isLoaded" class="loading">
          <h2>Loading game data...</h2>
          <p>Importing crops, upgrades, and adventure data from CSV files</p>
        </div>

        <div v-else-if="gameValues.validationErrors.length > 0" class="error">
          <h2>❌ Game Data Validation Errors</h2>
          <ul>
            <li v-for="error in gameValues.validationErrors" :key="error">{{ error }}</li>
          </ul>
        </div>

        <div v-else class="simulator-container">
          <div class="main-content">
          <div class="left-panel">
            <ControlPanel />
          </div>
          
          <div class="center-panel">
            <GameVisualizer />
          </div>
          
          <div class="right-panel">
            <EventLog />
          </div>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>Time Hero Simulator v1.0.0 | Game data: {{ gameValues.lastUpdated }}</p>
    </footer>
  </div>
  </ErrorBoundary>
</template>

<style scoped>
.app-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 2rem;
}

.app-header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.subtitle {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.app-main {
  min-height: 70vh;
  padding: 0 1rem;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
}

.error {
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 0.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.error ul {
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
}

.simulator-container {
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 1.5rem;
  min-height: 600px;
}

.left-panel, .center-panel, .right-panel {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.app-footer {
  text-align: center;
  padding: 2rem;
  margin-top: 3rem;
  background: #f8f9fa;
  color: #6c757d;
  font-size: 0.9rem;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
