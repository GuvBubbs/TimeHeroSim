<template>
  <div class="flex items-center space-x-3">
    <!-- Status Indicator -->
    <div class="flex items-center space-x-2">
      <div
        class="w-2 h-2 rounded-full"
        :class="statusIndicatorClass"
      ></div>
      <span class="text-sm font-medium">
        {{ statusText }}
      </span>
    </div>

    <!-- Progress Info (when running) -->
    <div v-if="simulation.isRunning" class="flex items-center space-x-2">
      <span class="text-sm text-slate-400">
        Day {{ simulation.gameState.time.day }}, {{ phaseDisplayName }}
      </span>
      
      <!-- Progress Bar -->
      <div class="w-20 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-indigo-500 transition-all duration-300"
          :style="{ width: `${simulationProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Quick Controls -->
    <div class="flex items-center space-x-1">
      <button
        v-if="simulation.isRunning"
        @click="togglePause"
        class="p-1 text-slate-400 hover:text-white rounded transition-colors"
        :title="simulation.isPaused ? 'Resume' : 'Pause'"
      >
        <component :is="simulation.isPaused ? PlayIcon : PauseIcon" class="w-4 h-4" />
      </button>
      
      <button
        v-if="simulation.isRunning"
        @click="stopSimulation"
        class="p-1 text-slate-400 hover:text-white rounded transition-colors"
        title="Stop"
      >
        <StopIcon class="w-4 h-4" />
      </button>

      <!-- Expand/Collapse Mini Monitor -->
      <button
        @click="toggleMiniMonitor"
        class="p-1 text-slate-400 hover:text-white rounded transition-colors"
        :title="showMiniMonitor ? 'Collapse' : 'Expand'"
      >
        <component :is="showMiniMonitor ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4" />
      </button>
    </div>

    <!-- Mini Monitor Dropdown -->
    <div
      v-if="showMiniMonitor"
      class="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50"
    >
      <div class="p-4">
        <h3 class="text-sm font-medium text-slate-200 mb-3">Live Simulation Status</h3>
        
        <!-- Key Resources -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-slate-700 rounded p-2">
            <div class="text-xs text-slate-400">Energy</div>
            <div class="text-sm font-medium">
              {{ simulation.gameState.resources.energy.current }}/{{ simulation.gameState.resources.energy.cap }}
            </div>
          </div>
          <div class="bg-slate-700 rounded p-2">
            <div class="text-xs text-slate-400">Gold</div>
            <div class="text-sm font-medium">{{ simulation.gameState.resources.gold.toLocaleString() }}</div>
          </div>
        </div>

        <!-- Phase Progress -->
        <div class="mb-4">
          <div class="flex justify-between text-xs text-slate-400 mb-1">
            <span>Phase Progress</span>
            <span>{{ phaseDisplayName }}</span>
          </div>
          <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
              :style="{ width: `${phaseProgress}%` }"
            ></div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex space-x-2">
          <button
            @click="navigateToMonitor"
            class="flex-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
          >
            View Full Monitor
          </button>
          <button
            v-if="simulation.isRunning"
            @click="stopSimulation"
            class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSimulationStore } from '../stores/simulation.js'
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/solid'

const router = useRouter()
const simulation = useSimulationStore()

const showMiniMonitor = ref(false)

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

const phaseDisplayName = computed(() => {
  const phase = simulation.gameState.currentPhase
  return phase.charAt(0).toUpperCase() + phase.slice(1) + ' Phase'
})

const simulationProgress = computed(() => {
  // Calculate progress based on day out of 28 max days
  const currentDay = simulation.gameState.time.day
  const maxDays = 28
  return Math.min((currentDay / maxDays) * 100, 100)
})

const phaseProgress = computed(() => {
  // Mock phase progress calculation
  const phases = ['tutorial', 'early', 'mid', 'late', 'endgame']
  const currentPhaseIndex = phases.indexOf(simulation.gameState.currentPhase)
  const progress = ((currentPhaseIndex + 1) / phases.length) * 100
  return Math.min(progress, 100)
})

// Methods
function togglePause() {
  if (simulation.isPaused) {
    simulation.resumeSimulation()
  } else {
    simulation.pauseSimulation()
  }
}

function stopSimulation() {
  simulation.stopSimulation()
  showMiniMonitor.value = false
}

function toggleMiniMonitor() {
  showMiniMonitor.value = !showMiniMonitor.value
}

function navigateToMonitor() {
  router.push('/monitor')
  showMiniMonitor.value = false
}
</script>
