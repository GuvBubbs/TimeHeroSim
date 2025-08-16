<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-white">Live Simulation Monitor</h1>
        <p class="text-slate-400">Real-time visualization of simulation progress</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full" :class="statusIndicatorClass"></div>
          <span class="text-sm font-medium">{{ statusText }}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            v-if="!simulation.isRunning"
            @click="startQuickSimulation"
            class="btn-primary"
          >
            <PlayIcon class="w-4 h-4 mr-2" />
            Start Demo
          </button>
          
          <button
            v-if="simulation.isRunning"
            @click="togglePause"
            class="btn-secondary"
          >
            <component :is="simulation.isPaused ? PlayIcon : PauseIcon" class="w-4 h-4 mr-2" />
            {{ simulation.isPaused ? 'Resume' : 'Pause' }}
          </button>
          
          <button
            v-if="simulation.isRunning"
            @click="stopSimulation"
            class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            <StopIcon class="w-4 h-4 mr-2" />
            Stop
          </button>
        </div>
      </div>
    </div>

    <!-- Main Monitor Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Left Column - Game State -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Game Time & Phase -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-white">Game Time</h2>
          </div>
          <div class="card-body">
            <div class="text-center">
              <div class="text-3xl font-bold text-indigo-400 mb-2">
                Day {{ simulation.gameState.time.day }}
              </div>
              <div class="text-sm text-slate-400 mb-4">
                {{ formatGameTime(simulation.gameState.time) }}
              </div>
              <div class="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div
                  class="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${dayProgress}%` }"
                ></div>
              </div>
              <div class="text-xs text-slate-500">Day Progress</div>
            </div>
          </div>
        </div>

        <!-- Current Phase -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-white">Current Phase</h2>
          </div>
          <div class="card-body">
            <div class="text-center">
              <div class="text-xl font-semibold text-emerald-400 mb-2 capitalize">
                {{ simulation.gameState.currentPhase }} Phase
              </div>
              <div class="space-y-2">
                <div
                  v-for="phase in phaseProgress"
                  :key="phase.name"
                  class="flex items-center justify-between"
                >
                  <span class="text-sm capitalize" :class="phase.textClass">{{ phase.name }}</span>
                  <component :is="phase.icon" class="w-4 h-4" :class="phase.iconClass" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resources -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-white">Resources</h2>
          </div>
          <div class="card-body space-y-4">
            <!-- Energy -->
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-slate-300">Energy</span>
                <span class="text-sm text-slate-400">
                  {{ simulation.gameState.resources.energy.current }}/{{ simulation.gameState.resources.energy.cap }}
                </span>
              </div>
              <div class="w-full bg-slate-700 rounded-full h-2">
                <div
                  class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${energyPercentage}%` }"
                ></div>
              </div>
            </div>

            <!-- Gold -->
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-slate-300">Gold</span>
                <span class="text-sm text-slate-400">
                  {{ simulation.gameState.resources.gold.toLocaleString() }}
                </span>
              </div>
            </div>

            <!-- Water -->
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-slate-300">Water</span>
                <span class="text-sm text-slate-400">
                  {{ simulation.gameState.farm.waterTank.current }}/{{ simulation.gameState.farm.waterTank.max }}
                </span>
              </div>
              <div class="w-full bg-slate-700 rounded-full h-2">
                <div
                  class="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${waterPercentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Center Column - Upgrade Tree Visualization -->
      <div class="lg:col-span-2">
        <div class="card h-full">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-white">Upgrade Tree Progress</h2>
          </div>
          <div class="card-body">
            <UpgradeTreeVisualization :interactive="false" />
          </div>
        </div>
      </div>

      <!-- Right Column - Event Log & Stats -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Current Location -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-white">Current Location</h2>
          </div>
          <div class="card-body">
            <div class="text-center">
              <div class="text-2xl mb-2">{{ currentLocation.icon }}</div>
              <div class="font-medium text-white">{{ currentLocation.name }}</div>
              <div v-if="currentAction" class="text-sm text-slate-400 mt-2">
                {{ currentAction }}
              </div>
            </div>
          </div>
        </div>

        <!-- Screen Time Tracker -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-white">Screen Time</h2>
          </div>
          <div class="card-body">
            <div class="space-y-3">
              <div
                v-for="screen in screenTimeData"
                :key="screen.name"
                class="flex items-center justify-between"
              >
                <div class="flex items-center space-x-2">
                  <div class="text-sm">{{ screen.icon }}</div>
                  <div class="text-sm text-slate-300">{{ screen.name }}</div>
                </div>
                <div class="text-sm text-slate-400">{{ screen.percentage }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Events -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-white">Recent Events</h2>
          </div>
          <div class="card-body">
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="event in recentEvents"
                :key="event.id"
                class="text-xs p-2 bg-slate-700 rounded"
              >
                <div class="flex justify-between items-start">
                  <span class="text-slate-300">{{ event.message }}</span>
                  <span class="text-slate-500 ml-2">{{ event.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Simulation Controls Bar -->
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-slate-400">Speed:</span>
            <div class="flex items-center space-x-2">
              <button
                v-for="speed in speedOptions"
                :key="speed.value"
                @click="setSimulationSpeed(speed.value)"
                class="px-3 py-1 text-xs rounded transition-colors"
                :class="simulation.speed === speed.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
              >
                {{ speed.label }}
              </button>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-sm text-slate-400">
              Performance: {{ performanceMetrics.fps }}fps
            </div>
            <router-link to="/analysis" class="btn-secondary">
              View Full Analysis
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useSimulationStore } from '../stores/simulation.js'
import UpgradeTreeVisualization from '../components/UpgradeTreeVisualization.vue'
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/solid'

const simulation = useSimulationStore()

// Speed control options
const speedOptions = [
  { value: 1, label: '1x' },
  { value: 10, label: '10x' },
  { value: 100, label: '100x' },
  { value: 1000, label: 'Max' }
]

// Mock performance metrics
const performanceMetrics = ref({
  fps: 60
})

// Computed properties
const statusIndicatorClass = computed(() => {
  if (simulation.isRunning) {
    return simulation.isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
  }
  return 'bg-slate-500'
})

const statusText = computed(() => {
  if (simulation.isRunning) {
    return simulation.isPaused ? 'Paused' : 'Running'
  }
  return 'Idle'
})

const dayProgress = computed(() => {
  const hours = simulation.gameState.time.hour
  const minutes = simulation.gameState.time.minute
  return ((hours * 60 + minutes) / (24 * 60)) * 100
})

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

const phaseProgress = computed(() => {
  const phases = ['tutorial', 'early', 'mid', 'late', 'endgame']
  const current = simulation.gameState.currentPhase
  
  return phases.map(phase => {
    const isCurrent = phase === current
    const isCompleted = phases.indexOf(phase) < phases.indexOf(current)
    
    return {
      name: phase,
      icon: isCompleted ? CheckCircleIcon : isCurrent ? ClockIcon : ChevronRightIcon,
      iconClass: isCompleted ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-slate-500',
      textClass: isCompleted ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-slate-500'
    }
  })
})

const currentLocation = computed(() => {
  const location = simulation.gameState.heroes.currentLocation
  const locations = {
    home: { icon: '🌱', name: 'Home/Farm' },
    adventure: { icon: '⚔️', name: 'Adventure' },
    mine: { icon: '⛏️', name: 'Mine' },
    forge: { icon: '⚒️', name: 'Forge' },
    tower: { icon: '🗼', name: 'Tower' },
    town: { icon: '🏰', name: 'Town' }
  }
  return locations[location] || locations.home
})

const currentAction = computed(() => {
  const action = simulation.gameState.heroes.currentAction
  if (!action || action.type === 'idle') return null
  return `${action.type} (${action.duration}min remaining)`
})

// Mock screen time data
const screenTimeData = computed(() => [
  { name: 'Farm', icon: '🌱', percentage: 45 },
  { name: 'Adventure', icon: '⚔️', percentage: 25 },
  { name: 'Mining', icon: '⛏️', percentage: 15 },
  { name: 'Forge', icon: '⚒️', percentage: 10 },
  { name: 'Tower', icon: '🗼', percentage: 3 },
  { name: 'Town', icon: '🏰', percentage: 2 }
])

// Mock recent events
const recentEvents = computed(() => [
  { id: 1, message: 'Harvested Potato (5 energy)', time: '10:42' },
  { id: 2, message: 'Started adventure: Forest Path', time: '10:40' },
  { id: 3, message: 'Planted Wheat in plot 3', time: '10:38' },
  { id: 4, message: 'Purchased upgrade: Water Barrel', time: '10:35' }
])

// Methods
function formatGameTime(time) {
  const hour = time.hour.toString().padStart(2, '0')
  const minute = time.minute.toString().padStart(2, '0')
  return `${hour}:${minute}`
}

function togglePause() {
  if (simulation.isPaused) {
    simulation.resumeSimulation()
  } else {
    simulation.pauseSimulation()
  }
}

function stopSimulation() {
  simulation.stopSimulation()
}

function setSimulationSpeed(speed) {
  simulation.setSpeed(speed)
}

function startQuickSimulation() {
  // Start a quick demo simulation
  simulation.startSimulation()
}
</script>
