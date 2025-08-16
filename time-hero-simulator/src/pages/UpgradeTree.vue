<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-2xl font-bold text-white mb-2">Upgrade Tree</h1>
      <p class="text-slate-400">Visualize upgrade sources, phases, and progression paths</p>
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

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="card-body text-center">
          <div class="text-2xl font-bold text-indigo-400">{{ treeStats.totalUpgrades }}</div>
          <div class="text-sm text-slate-400">Total Upgrades</div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-body text-center">
          <div class="text-2xl font-bold text-emerald-400">{{ treeStats.byPhase.tutorial }}</div>
          <div class="text-sm text-slate-400">Tutorial Phase</div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-body text-center">
          <div class="text-2xl font-bold text-amber-400">{{ treeStats.byPhase.mid }}</div>
          <div class="text-sm text-slate-400">Mid Phase</div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-body text-center">
          <div class="text-2xl font-bold text-purple-400">{{ treeStats.byPhase.endgame }}</div>
          <div class="text-sm text-slate-400">Endgame Phase</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGameValuesStore } from '../stores/gameValues.js'
import UpgradeTreeVisualization from '../components/UpgradeTreeVisualization.vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const gameValues = useGameValuesStore()

// Reactive state
const editMode = ref(false)
const selectedUpgrade = ref(null)
const editedUpgrade = ref({})

// Computed properties
const treeStats = computed(() => {
  const upgrades = Object.values(gameValues.upgrades || {})
  
  // Count upgrades by phase
  const byPhase = {
    tutorial: 0,
    early: 0,
    mid: 0,
    late: 0,
    endgame: 0
  }
  
  upgrades.forEach(upgrade => {
    const unlockDay = upgrade.unlockDay || 0
    const goldCost = upgrade.goldCost || upgrade.cost?.gold || 0
    
    if (unlockDay <= 1 || goldCost <= 100) byPhase.tutorial++
    else if (unlockDay <= 3 || goldCost <= 1000) byPhase.early++
    else if (unlockDay <= 7 || goldCost <= 10000) byPhase.mid++
    else if (unlockDay <= 14 || goldCost <= 100000) byPhase.late++
    else byPhase.endgame++
  })
  
  return {
    totalUpgrades: upgrades.length,
    byPhase,
    averageCost: Math.round(
      upgrades.reduce((sum, up) => sum + (up.goldCost || up.cost?.gold || 0), 0) / upgrades.length || 0
    )
  }
})

// Watch for selection changes
watch(selectedUpgrade, (newVal) => {
  if (newVal) {
    // Create a deep copy for editing
    editedUpgrade.value = JSON.parse(JSON.stringify(newVal))
  }
})

// Methods
function handleUpgradeSelected(upgrade) {
  selectedUpgrade.value = upgrade
}

function handleUpgradeEdited(upgrade) {
  // Handle inline editing from the tree visualization
  updateUpgradeInStore(upgrade.id, upgrade)
}

function saveUpgrade() {
  if (editedUpgrade.value && editedUpgrade.value.id) {
    // Update the upgrade in the store
    updateUpgradeInStore(editedUpgrade.value.id, editedUpgrade.value)
    
    // Update the selected upgrade to reflect changes
    selectedUpgrade.value = { ...editedUpgrade.value }
    
    // Show success message (you could add a toast notification here)
    console.log('Upgrade saved:', editedUpgrade.value.id)
  }
}

function updateUpgradeInStore(upgradeId, upgadeData) {
  // Create a new upgrades object with the updated data
  const updatedUpgrades = { ...gameValues.upgrades }
  updatedUpgrades[upgradeId] = { ...upgadeData }
  
  // Update the store (this needs to be implemented in gameValues store)
  // For now, we'll update it directly since the store uses refs
  gameValues.upgrades = Object.freeze(updatedUpgrades)
  
  // Mark as having unsaved changes
  gameValues.hasUnsavedChanges = true
  
  console.log('Updated upgrade in store:', upgradeId)
}

function cancelEdit() {
  // Reset edited upgrade to original
  editedUpgrade.value = JSON.parse(JSON.stringify(selectedUpgrade.value))
}

function deleteUpgrade() {
  if (confirm(`Are you sure you want to delete "${editedUpgrade.value.name}"?`)) {
    const upgradeId = editedUpgrade.value.id
    
    // Create new upgrades object without the deleted upgrade
    const updatedUpgrades = { ...gameValues.upgrades }
    delete updatedUpgrades[upgradeId]
    
    // Update the store
    gameValues.upgrades = Object.freeze(updatedUpgrades)
    gameValues.hasUnsavedChanges = true
    
    // Clear selection
    selectedUpgrade.value = null
    editedUpgrade.value = {}
    
    console.log('Deleted upgrade:', upgradeId)
  }
}

function exportTree() {
  // Export the upgrade tree as JSON
  const treeData = {
    upgrades: gameValues.upgrades,
    exportDate: new Date().toISOString(),
    stats: treeStats.value
  }
  
  const blob = new Blob([JSON.stringify(treeData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `upgrade-tree-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function refreshTree() {
  // Force re-render of the tree
  selectedUpgrade.value = null
  editedUpgrade.value = {}
}
</script>
