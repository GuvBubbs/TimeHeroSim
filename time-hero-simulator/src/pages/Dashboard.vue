<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="text-center py-8">
      <h1 class="text-3xl font-bold text-white mb-2">Time Hero Game Balance Simulator</h1>
      <p class="text-slate-400 text-lg">Your central hub for game balance analysis and validation</p>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-400">Total Simulations</p>
              <p class="text-2xl font-bold text-white">{{ stats.totalSimulations }}</p>
            </div>
            <ChartBarIcon class="w-8 h-8 text-indigo-400" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-400">Configurations</p>
              <p class="text-2xl font-bold text-white">{{ stats.configurations }}</p>
            </div>
            <CogIcon class="w-8 h-8 text-emerald-400" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-400">Player Personas</p>
              <p class="text-2xl font-bold text-white">{{ stats.personas }}</p>
            </div>
            <UserGroupIcon class="w-8 h-8 text-amber-400" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-400">Current Status</p>
              <p class="text-lg font-semibold" :class="statusClass">{{ currentStatus }}</p>
            </div>
            <component :is="statusIcon" class="w-8 h-8" :class="statusIconClass" />
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Simulations & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Simulations -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-lg font-semibold text-white">Recent Simulations</h2>
        </div>
        <div class="card-body">
          <div v-if="recentSimulations.length === 0" class="text-center py-8">
            <ChartBarIcon class="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p class="text-slate-400">No simulations run yet</p>
            <router-link to="/setup" class="btn-primary mt-4 inline-block">
              Run Your First Simulation
            </router-link>
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="sim in recentSimulations"
              :key="sim.id"
              class="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
            >
              <div>
                <p class="font-medium text-white">{{ sim.name }}</p>
                <p class="text-sm text-slate-400">{{ sim.date }} • {{ sim.duration }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 text-xs rounded-full" :class="sim.statusClass">
                  {{ sim.status }}
                </span>
                <button
                  @click="viewSimulation(sim.id)"
                  class="text-indigo-400 hover:text-indigo-300"
                >
                  <EyeIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-lg font-semibold text-white">Quick Actions</h2>
        </div>
        <div class="card-body space-y-4">
          <router-link
            to="/setup"
            class="flex items-center p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group"
          >
            <PlayIcon class="w-6 h-6 text-emerald-400 mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <p class="font-medium text-white">Start New Simulation</p>
              <p class="text-sm text-slate-400">Configure and run a new balance test</p>
            </div>
          </router-link>

          <router-link
            to="/configuration"
            class="flex items-center p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group"
          >
            <CogIcon class="w-6 h-6 text-indigo-400 mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <p class="font-medium text-white">Edit Game Configuration</p>
              <p class="text-sm text-slate-400">Modify crops, upgrades, and adventures</p>
            </div>
          </router-link>

          <router-link
            to="/upgrade-tree"
            class="flex items-center p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group"
          >
            <ShareIcon class="w-6 h-6 text-amber-400 mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <p class="font-medium text-white">View Upgrade Tree</p>
              <p class="text-sm text-slate-400">Visualize and edit upgrade dependencies</p>
            </div>
          </router-link>

          <router-link
            to="/analysis"
            class="flex items-center p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group"
          >
            <ChartPieIcon class="w-6 h-6 text-purple-400 mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <p class="font-medium text-white">Analyze Results</p>
              <p class="text-sm text-slate-400">Compare simulations and detect bottlenecks</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Tips and Best Practices -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-lg font-semibold text-white">Tips & Best Practices</h2>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 class="font-medium text-white">Start with Player Personas</h3>
                <p class="text-sm text-slate-400">Define realistic player behavior patterns before running simulations to get accurate results.</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 class="font-medium text-white">Use Monte Carlo for Validation</h3>
                <p class="text-sm text-slate-400">Run 50+ simulations with variance to get statistical confidence in your balance changes.</p>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 class="font-medium text-white">Monitor Phase Timing</h3>
                <p class="text-sm text-slate-400">Ensure each game phase takes the intended amount of time for optimal player experience.</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 class="font-medium text-white">Export for Documentation</h3>
                <p class="text-sm text-slate-400">Use the comprehensive export feature to create reports for stakeholders and historical tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSimulationStore } from '../stores/simulation.js'
import { useResultsStore } from '../stores/results.js'
import {
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  PlayIcon,
  EyeIcon,
  ShareIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const simulation = useSimulationStore()
const results = useResultsStore()

// Computed stats
const stats = computed(() => ({
  totalSimulations: results.allResults?.length || 0,
  configurations: 3, // Mock data
  personas: 4 // Mock data
}))

const currentStatus = computed(() => {
  if (simulation.isRunning) {
    return simulation.isPaused ? 'Paused' : 'Running'
  }
  return 'Ready'
})

const statusClass = computed(() => {
  if (simulation.isRunning) {
    return simulation.isPaused ? 'text-amber-400' : 'text-emerald-400'
  }
  return 'text-slate-400'
})

const statusIcon = computed(() => {
  if (simulation.isRunning) {
    return simulation.isPaused ? ClockIcon : CheckCircleIcon
  }
  return CheckCircleIcon
})

const statusIconClass = computed(() => {
  if (simulation.isRunning) {
    return simulation.isPaused ? 'text-amber-400' : 'text-emerald-400'
  }
  return 'text-slate-400'
})

// Mock recent simulations data
const recentSimulations = computed(() => [
  // This would be populated from the results store
  {
    id: 1,
    name: 'Casual Player Test',
    date: '2 hours ago',
    duration: '28 days',
    status: 'Completed',
    statusClass: 'bg-emerald-900 text-emerald-300'
  },
  {
    id: 2,
    name: 'Speedrunner Analysis',
    date: '1 day ago',
    duration: '28 days',
    status: 'Completed',
    statusClass: 'bg-emerald-900 text-emerald-300'
  }
])

// Methods
function viewSimulation(id) {
  router.push(`/analysis?simulation=${id}`)
}
</script>
