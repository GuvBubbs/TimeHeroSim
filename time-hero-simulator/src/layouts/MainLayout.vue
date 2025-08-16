<template>
  <div class="min-h-screen bg-slate-900 text-slate-100">
    <!-- Global Header -->
    <header class="bg-slate-800 border-b border-slate-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Title -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-bold text-indigo-400">🌱 Time Hero Simulator</h1>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <nav class="hidden md:flex space-x-8">
            <router-link
              v-for="route in navigationRoutes"
              :key="route.name"
              :to="route.path"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="[
                $route.name === route.name
                  ? 'bg-slate-700 text-indigo-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              ]"
            >
              <component :is="route.meta.icon" class="w-4 h-4 mr-2" />
              {{ route.meta.title }}
            </router-link>
          </nav>

          <!-- Simulation Status Widget -->
          <div class="flex items-center space-x-4">
            <SimulationStatusWidget />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>

    <!-- Global Footer -->
    <footer class="bg-slate-800 border-t border-slate-700 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center text-sm text-slate-400">
          <div>
            <span class="font-medium">Configuration:</span>
            <span :class="gameValues.hasUnsavedChanges ? 'text-amber-400' : 'text-emerald-400'">
              {{ gameValues.hasUnsavedChanges ? 'Modified' : 'Saved' }}
            </span>
            <button
              v-if="gameValues.hasUnsavedChanges"
              @click="saveConfiguration"
              class="ml-2 text-indigo-400 hover:text-indigo-300"
            >
              Save
            </button>
          </div>
          
          <div class="flex items-center space-x-4">
            <span>Performance: {{ performanceMetrics.simSpeed }}x</span>
            <span>Memory: {{ performanceMetrics.memoryUsage }}MB</span>
            <a href="/docs" class="text-indigo-400 hover:text-indigo-300">Help</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useGameValuesStore } from '../stores/gameValues.js'
import { useSimulationStore } from '../stores/simulation.js'
import SimulationStatusWidget from '../components/SimulationStatusWidget.vue'

// Import icons
import {
  ChartBarIcon,
  CogIcon,
  ShareIcon,
  UserGroupIcon,
  PlayIcon,
  EyeIcon,
  ChartPieIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const gameValues = useGameValuesStore()
const simulation = useSimulationStore()

// Navigation routes
const navigationRoutes = [
  { name: 'Dashboard', path: '/', meta: { title: 'Dashboard', icon: ChartBarIcon } },
  { name: 'GameConfiguration', path: '/configuration', meta: { title: 'Configuration', icon: CogIcon } },
  { name: 'UpgradeTree', path: '/upgrade-tree', meta: { title: 'Upgrade Tree', icon: ShareIcon } },
  { name: 'PlayerPersonas', path: '/personas', meta: { title: 'Personas', icon: UserGroupIcon } },
  { name: 'SimulationSetup', path: '/setup', meta: { title: 'Setup', icon: PlayIcon } },
  { name: 'LiveMonitor', path: '/monitor', meta: { title: 'Monitor', icon: EyeIcon } },
  { name: 'Analysis', path: '/analysis', meta: { title: 'Analysis', icon: ChartPieIcon } },
  { name: 'Reports', path: '/reports', meta: { title: 'Reports', icon: DocumentTextIcon } }
]

// Performance metrics (mock data for now)
const performanceMetrics = ref({
  simSpeed: simulation.isRunning ? '10' : '0',
  memoryUsage: '45'
})

// Configuration management
function saveConfiguration() {
  gameValues.saveConfiguration()
}
</script>
