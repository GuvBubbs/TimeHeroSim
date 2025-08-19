<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-2xl font-bold text-white mb-2">Upgrade Tree</h1>
      <p class="text-slate-400">Visualize upgrade sources, phases, and progression paths</p>
    </div>

    <!-- Debug Information -->
    <div class="card bg-slate-800">
      <div class="card-body">
        <h3 class="text-sm font-semibold text-slate-300 mb-2">🔍 Debug Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-slate-400">Game Values Loaded:</span>
            <span class="text-emerald-400 ml-2">{{ gameValues.isLoaded ? 'Yes' : 'No' }}</span>
          </div>
          <div>
            <span class="text-slate-400">Unified Nodes:</span>
            <span class="text-blue-400 ml-2">{{ gameValues.unifiedNodes?.length || 0 }}</span>
          </div>
          <div>
            <span class="text-slate-400">Layout Status:</span>
            <span class="text-yellow-400 ml-2">{{ layout ? 'Loaded' : 'Not Loaded' }}</span>
          </div>
        </div>
        <div class="mt-2 text-xs text-slate-500">
          Debug: {{ Object.keys(upgrades).length }} nodes, Layout: {{ layout ? 'loaded' : 'loading' }}
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-400">
            <span class="mr-4">💡 Tip: Use Shift+Scroll for horizontal scrolling, Ctrl+Scroll for zoom</span>
          </div>
          
          <div class="flex items-center space-x-3">
            <button
              @click="editMode = !editMode"
              class="btn-secondary"
              :class="{ 'bg-indigo-600': editMode }"
            >
              {{ editMode ? 'Exit Edit Mode' : 'Edit Mode' }}
            </button>
            <button
              @click="exportTree"
              class="btn-secondary"
            >
              Export Tree
            </button>
            <button
              @click="refreshTree"
              class="btn-secondary"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Source & Area-Based Filtering Controls -->
    <div class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">Configuration Filters</h2>
          <button
            @click="filtersCollapsed = !filtersCollapsed"
            class="text-slate-400 hover:text-white transition-colors"
            :title="filtersCollapsed ? 'Expand Filters' : 'Collapse Filters'"
          >
            <svg class="w-5 h-5 transition-transform" :class="{ 'rotate-180': filtersCollapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      <div v-show="!filtersCollapsed" class="card-body">
        <!-- Source Filters (Where to Buy) -->
        <div class="mb-4">
          <label class="form-label">Sources (Where to Buy)</label>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="(source, sourceId) in sourceConfigs"
              :key="sourceId"
              @click="toggleSourceFilter(sourceId)"
              class="btn-secondary text-sm"
              :class="{ 'bg-indigo-600': filters.sources.includes(sourceId) }"
            >
              {{ source.icon }} {{ source.name }}
            </button>
          </div>
        </div>

        <!-- Area Filters (What it Affects) -->
        <div class="mb-4">
          <label class="form-label">Areas (What it Affects)</label>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="(area, areaId) in areaConfigs"
              :key="areaId"
              @click="toggleAreaFilter(areaId)"
              class="btn-secondary text-sm"
              :class="{ 'bg-indigo-600': filters.areas.includes(areaId) }"
            >
              {{ area.icon }} {{ area.name }}
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="mb-4">
          <label class="form-label">Search Upgrades</label>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by name or description..."
            class="form-input w-full"
          />
        </div>

        <!-- View Options -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Dependencies</label>
            <select v-model="filters.dependencies" class="form-input w-full">
              <option value="all">All Connections</option>
              <option value="direct">Direct Only</option>
              <option value="critical">Critical Path</option>
              <option value="none">No Connections</option>
            </select>
          </div>

          <div>
            <label class="form-label">View Options</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="checkbox" v-model="showNodeDetails" class="mr-2">
                <span class="text-sm">Show Node Details</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" v-model="showTooltips" class="mr-2">
                <span class="text-sm">Enable Tooltips</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade Tree Visualization -->
    <div class="card">
      <div class="card-body p-0">
        <div class="h-[600px]">
          <UpgradeTreeVisualization
            :interactive="true"
            :edit-mode="editMode"
            @upgradeSelected="handleUpgradeSelected"
            @upgradeEdited="handleUpgradeEdited"
          />
        </div>
      </div>
    </div>

    <!-- Selected Upgrade Details Panel -->
    <div v-if="selectedUpgrade" class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">
            {{ editMode ? 'Edit' : 'Details' }}: {{ selectedUpgrade.name }}
          </h2>
          <button
            @click="selectedUpgrade = null"
            class="text-slate-400 hover:text-white"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Basic Information -->
          <div class="space-y-4">
            <div>
              <label class="form-label">Name</label>
              <input
                v-model="editedUpgrade.name"
                :disabled="!editMode"
                class="form-input w-full"
              />
            </div>
            
            <div>
              <label class="form-label">Category</label>
              <select
                v-model="editedUpgrade.category"
                :disabled="!editMode"
                class="form-input w-full"
              >
                <option value="storage">Storage</option>
                <option value="water">Water</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="farm">Farm</option>
                <option value="tools">Tools</option>
                <option value="tower">Tower</option>
                <option value="forge">Forge</option>
                <option value="helper">Helper</option>
                <option value="automation">Automation</option>
                <option value="combat">Combat</option>
                <option value="mining">Mining</option>
              </select>
            </div>

            <div>
              <label class="form-label">Unlock Day</label>
              <input
                v-model.number="editedUpgrade.unlockDay"
                :disabled="!editMode"
                type="number"
                class="form-input w-full"
              />
            </div>
          </div>

          <!-- Costs -->
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label">Gold Cost</label>
                <input
                  v-model.number="editedUpgrade.goldCost"
                  :disabled="!editMode"
                  type="number"
                  class="form-input w-full"
                />
              </div>
              <div>
                <label class="form-label">Energy Cost</label>
                <input
                  v-model.number="editedUpgrade.energyCost"
                  :disabled="!editMode"
                  type="number"
                  class="form-input w-full"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label">Stone Cost</label>
                <input
                  v-model.number="editedUpgrade.stoneCost"
                  :disabled="!editMode"
                  type="number"
                  class="form-input w-full"
                />
              </div>
              <div>
                <label class="form-label">Copper Cost</label>
                <input
                  v-model.number="editedUpgrade.copperCost"
                  :disabled="!editMode"
                  type="number"
                  class="form-input w-full"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label">Iron Cost</label>
                <input
                  v-model.number="editedUpgrade.ironCost"
                  :disabled="!editMode"
                  type="number"
                  class="form-input w-full"
                />
              </div>
              <div>
                <label class="form-label">Silver Cost</label>
                <input
                  v-model.number="editedUpgrade.silverCost"
                  :disabled="!editMode"
                  type="number"
                  class="form-input w-full"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label">Crystal Cost</label>
                <input
                  v-model.number="editedUpgrade.crystalCost"
                  :disabled="!editMode"
                  type="number"
                  class="form-input w-full"
                />
              </div>
              <div>
                <label class="form-label">Mythril Cost</label>
                <input
                  v-model.number="editedUpgrade.mythrilCost"
                  :disabled="!editMode"
                  type="number"
                  class="form-input w-full"
                />
              </div>
            </div>
          </div>

          <!-- Effect and Description -->
          <div class="space-y-4">
            <div>
              <label class="form-label">Effect Code</label>
              <input
                v-model="editedUpgrade.effect"
                :disabled="!editMode"
                class="form-input w-full"
                placeholder="e.g., energy_cap_150"
              />
            </div>
            
            <div>
              <label class="form-label">Description</label>
              <textarea
                v-model="editedUpgrade.description"
                :disabled="!editMode"
                rows="6"
                class="form-input w-full"
                placeholder="What does this upgrade do?"
              ></textarea>
            </div>

            <div v-if="editMode" class="pt-4">
              <div class="flex items-center justify-between">
                <button
                  @click="deleteUpgrade"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Delete
                </button>
                
                <div class="flex items-center space-x-2">
                  <button
                    @click="cancelEdit"
                    class="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    @click="saveUpgrade"
                    class="btn-primary text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGameValuesStore } from '../stores/gameValues.js'
import { useUpgradeTree } from '../composables/useUpgradeTree.js'
import UpgradeTreeVisualization from '../components/UpgradeTreeVisualization.vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { getSourceConfig, SOURCES, AREAS } from '../utils/treeLayoutEngine.js'

const gameValues = useGameValuesStore()

// Reactive state
const editMode = ref(false)
const selectedUpgrade = ref(null)
const editedUpgrade = ref({})
const filtersCollapsed = ref(false)
const searchTerm = ref('')
const showNodeDetails = ref(true)
const showTooltips = ref(true)

// Composables
const {
  filters,
  upgrades,
  layout,
  setSourceFilter,
  toggleSourceFilter: toggleSourceFilterAction,
  toggleAreaFilter: toggleAreaFilterAction,
  SOURCES: sourceConfigs,
  AREAS: areaConfigs
} = useUpgradeTree()

// Filter methods
const toggleSourceFilter = (sourceId) => {
  toggleSourceFilterAction(sourceId)
}

const toggleAreaFilter = (areaId) => {
  toggleAreaFilterAction(areaId)
}

// Watch search term and update filters
watch(searchTerm, (newTerm) => {
  filters.value.search = newTerm
})

// Utility functions
function exportTree() {
  const treeData = {
    upgrades: upgrades.value,
    unifiedNodes: gameValues.unifiedNodes,
    metadata: {
      exportDate: new Date().toISOString(),
      totalUpgrades: Object.keys(upgrades.value || {}).length,
      totalUnifiedNodes: gameValues.unifiedNodes?.length || 0
    }
  }
  
  const blob = new Blob([JSON.stringify(treeData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `upgrade-tree-config-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function refreshTree() {
  // Force re-render of the tree
  selectedUpgrade.value = null
  editedUpgrade.value = {}
}

// Event handlers
function handleUpgradeSelected(upgrade) {
  selectedUpgrade.value = upgrade
  editedUpgrade.value = { ...upgrade }
}

function handleUpgradeEdited(upgrade) {
  // Update the upgrade in gameValues store
  gameValues.updateUpgrade(upgrade.id, upgrade)
  selectedUpgrade.value = upgrade
}
</script>
