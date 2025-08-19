<script setup>
import { onMounted } from 'vue'
import { useGameValuesStore } from './stores/gameValues.js'
import { useSimulationStore } from './stores/simulation.js'
import { loadAllGameData } from './utils/importers.js'
import MainLayout from './layouts/MainLayout.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'

const gameValues = useGameValuesStore()
const simulation = useSimulationStore()

// Load game data on app startup
onMounted(async () => {
  try {
    const gameData = await loadAllGameData()
    console.log('🔍 DEBUG: Game data loaded in App.vue:', {
      hasUnifiedNodes: !!gameData.unifiedNodes,
      unifiedNodesLength: gameData.unifiedNodes?.length || 0,
      sampleNode: gameData.unifiedNodes?.[0]
    })
    
    gameValues.loadGameValues(gameData)
    gameValues.validateGameValues()
    
    console.log('🔍 DEBUG: After loading to store:', {
      storeHasUnifiedNodes: !!gameValues.unifiedNodes,
      storeNodesLength: gameValues.unifiedNodes?.length || 0
    })
    
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
    <div v-if="!gameValues.isLoaded" class="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold mb-2">Loading game data...</h2>
        <p class="text-slate-400">Importing crops, upgrades, and adventure data from CSV files</p>
      </div>
    </div>

    <div v-else-if="gameValues.validationErrors.length > 0" class="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div class="max-w-2xl mx-auto p-8">
        <div class="bg-red-900/50 border border-red-700 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-red-400 mb-4">❌ Game Data Validation Errors</h2>
          <ul class="space-y-2 text-red-300">
            <li v-for="error in gameValues.validationErrors" :key="error" class="flex items-start">
              <span class="text-red-500 mr-2">•</span>
              {{ error }}
            </li>
          </ul>
          <div class="mt-6">
            <button 
              @click="gameValues.validateGameValues()" 
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Retry Validation
            </button>
          </div>
        </div>
      </div>
    </div>

    <MainLayout v-else />
  </ErrorBoundary>
</template>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
