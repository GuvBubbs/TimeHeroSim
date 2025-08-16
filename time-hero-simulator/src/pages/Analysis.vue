<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-2xl font-bold text-white mb-2">Simulation Analysis</h1>
      <p class="text-slate-400">Compare simulations, detect bottlenecks, and export comprehensive reports</p>
    </div>

    <!-- Analysis Mode Selector -->
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <label class="text-sm text-slate-300">Analysis Mode:</label>
            <div class="flex items-center space-x-2">
              <button
                v-for="mode in analysisModes"
                :key="mode.id"
                @click="activeMode = mode.id"
                class="px-3 py-1 text-sm rounded transition-colors"
                :class="activeMode === mode.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
              >
                {{ mode.name }}
              </button>
            </div>
          </div>
          
          <button
            @click="exportAnalysisPackage"
            class="btn-primary"
          >
            <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
            Export for AI Analysis
          </button>
        </div>
      </div>
    </div>

    <!-- Simulation Selector -->
    <div class="card" v-if="activeMode === 'comparison'">
      <div class="card-header">
        <h2 class="text-lg font-semibold text-white">Select Simulations to Compare</h2>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="sim in availableSimulations"
            :key="sim.id"
            @click="toggleSimulationSelection(sim.id)"
            class="p-4 border-2 rounded-lg cursor-pointer transition-colors"
            :class="selectedSimulations.includes(sim.id)
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-700 hover:border-slate-600'"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-white">{{ sim.name }}</span>
              <span class="text-xs px-2 py-1 rounded-full" :class="sim.statusClass">
                {{ sim.status }}
              </span>
            </div>
            <div class="text-sm text-slate-400">
              <div>{{ sim.playerType }} • {{ sim.duration }}</div>
              <div>{{ sim.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analysis Results -->
    <div class="space-y-6">
      <!-- Single Simulation Analysis -->
      <div v-if="activeMode === 'single'" class="space-y-6">
        <SingleSimulationAnalysis :simulation="currentSimulation" />
      </div>

      <!-- Comparison Analysis -->
      <div v-if="activeMode === 'comparison' && selectedSimulations.length >= 2" class="space-y-6">
        <ComparisonAnalysis :simulations="getSelectedSimulations()" />
      </div>

      <!-- Bottleneck Analysis -->
      <div v-if="activeMode === 'bottlenecks'" class="space-y-6">
        <BottleneckAnalysis :simulation="currentSimulation" />
      </div>

      <!-- Monte Carlo Analysis -->
      <div v-if="activeMode === 'monte-carlo'" class="space-y-6">
        <MonteCarloAnalysis />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useResultsStore } from '../stores/results.js'
import { useSimulationStore } from '../stores/simulation.js'
import SingleSimulationAnalysis from '../components/analysis/SingleSimulationAnalysis.vue'
import ComparisonAnalysis from '../components/analysis/ComparisonAnalysis.vue'
import BottleneckAnalysis from '../components/analysis/BottleneckAnalysis.vue'
import MonteCarloAnalysis from '../components/analysis/MonteCarloAnalysis.vue'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

const results = useResultsStore()
const simulation = useSimulationStore()

// Reactive state
const activeMode = ref('single')
const selectedSimulations = ref([])

// Analysis modes
const analysisModes = [
  { id: 'single', name: 'Single Simulation' },
  { id: 'comparison', name: 'Comparison' },
  { id: 'bottlenecks', name: 'Bottleneck Detection' },
  { id: 'monte-carlo', name: 'Monte Carlo' }
]

// Mock simulation data
const availableSimulations = computed(() => [
  {
    id: 1,
    name: 'Casual Player Test',
    playerType: 'Casual Player',
    duration: '28 days',
    date: '2 hours ago',
    status: 'Completed',
    statusClass: 'bg-emerald-900 text-emerald-300'
  },
  {
    id: 2,
    name: 'Speedrunner Analysis',
    playerType: 'Speedrunner',
    duration: '28 days',
    date: '1 day ago',
    status: 'Completed',
    statusClass: 'bg-emerald-900 text-emerald-300'
  },
  {
    id: 3,
    name: 'Weekend Warrior',
    playerType: 'Weekend Warrior',
    duration: '28 days',
    date: '3 days ago',
    status: 'Completed',
    statusClass: 'bg-emerald-900 text-emerald-300'
  },
  {
    id: 4,
    name: 'Balance Test v2',
    playerType: 'Mixed',
    duration: '14 days',
    date: '1 week ago',
    status: 'Archived',
    statusClass: 'bg-slate-700 text-slate-300'
  }
])

const currentSimulation = computed(() => {
  return availableSimulations.value[0] // Default to first simulation
})

// Methods
function toggleSimulationSelection(simId) {
  const index = selectedSimulations.value.indexOf(simId)
  if (index >= 0) {
    selectedSimulations.value.splice(index, 1)
  } else if (selectedSimulations.value.length < 4) {
    selectedSimulations.value.push(simId)
  }
}

function getSelectedSimulations() {
  return selectedSimulations.value.map(id => 
    availableSimulations.value.find(sim => sim.id === id)
  ).filter(Boolean)
}

function exportAnalysisPackage() {
  // Create comprehensive export package for LLM analysis
  const analysisPackage = {
    timestamp: new Date().toISOString(),
    mode: activeMode.value,
    simulations: activeMode.value === 'comparison' 
      ? getSelectedSimulations() 
      : [currentSimulation.value],
    gameConfiguration: {
      crops: simulation.gameValues?.crops,
      adventures: simulation.gameValues?.adventures,
      upgrades: simulation.gameValues?.upgrades
    },
    analysisResults: {
      // Include all analysis data
      bottlenecks: results.latestBottleneckAnalysis,
      phaseTimings: results.latestPhaseTimings,
      resourceEfficiency: results.latestResourceAnalysis
    },
    recommendations: results.latestRecommendations
  }
  
  // Download as JSON
  const blob = new Blob([JSON.stringify(analysisPackage, null, 2)], 
    { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `time-hero-analysis-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
