<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-white">Game Configuration</h1>
        <p class="text-slate-400">View and edit all game values and balance parameters</p>
      </div>
      
      <div class="flex items-center space-x-3">
        <span class="text-sm" :class="hasUnsavedChanges ? 'text-amber-400' : 'text-emerald-400'">
          {{ hasUnsavedChanges ? 'Modified' : 'Saved' }}
        </span>
        <button
          v-if="hasUnsavedChanges"
          @click="saveConfiguration"
          class="btn-primary"
        >
          Save Changes
        </button>
        <button
          @click="resetToDefaults"
          class="btn-secondary"
        >
          Reset to Defaults
        </button>
      </div>
    </div>

    <!-- Configuration Tabs -->
    <div class="card">
      <div class="border-b border-slate-700">
        <nav class="flex space-x-8 px-6">
          <button
            v-for="tab in configTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center space-x-2 py-4 border-b-2 transition-colors"
            :class="activeTab === tab.id
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span>{{ tab.name }}</span>
            <span class="text-xs bg-slate-700 px-2 py-1 rounded-full">{{ tab.count }}</span>
          </button>
        </nav>
      </div>

      <div class="card-body">
        <!-- Search and Filter Bar -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search items..."
                class="form-input pl-10 w-64"
              />
            </div>
            
            <div class="text-sm text-slate-400">
              Click column headers to sort
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              @click="toggleBulkEdit"
              class="btn-secondary"
            >
              {{ bulkEditMode ? 'Exit' : 'Bulk Edit' }}
            </button>
            <button
              @click="addNewItem"
              class="btn-primary"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              Add {{ activeTabConfig.singular }}
            </button>
          </div>
        </div>

        <!-- Data Table -->
        <div v-if="filteredItems.length === 0" class="text-center py-12">
          <p class="text-slate-400 text-lg mb-4">No {{ activeTab }} data available</p>
          <button
            @click="addNewItem"
            class="btn-primary"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Add First {{ activeTabConfig.singular }}
          </button>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-700">
                <th v-if="bulkEditMode" class="w-8 p-3">
                  <input
                    type="checkbox"
                    @change="toggleAllSelection"
                    class="rounded border-slate-600 bg-slate-700"
                  />
                </th>
                <th
                  v-for="column in activeTabConfig.columns"
                  :key="column.key"
                  class="text-left p-3 text-slate-300 font-medium cursor-pointer hover:text-white transition-colors group"
                  :class="column.class"
                  @click="handleSort(column.key)"
                >
                  <div class="flex items-center space-x-1">
                    <span>{{ column.label }}</span>
                    <span class="text-xs opacity-50 group-hover:opacity-100">
                      <span v-if="sortBy === column.key && sortDirection === 'asc'">↑</span>
                      <span v-else-if="sortBy === column.key && sortDirection === 'desc'">↓</span>
                      <span v-else class="opacity-0 group-hover:opacity-30">↕</span>
                    </span>
                  </div>
                </th>
                <th class="w-20 p-3 text-slate-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredItems"
                :key="item.id"
                class="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
              >
                <td v-if="bulkEditMode" class="p-3">
                  <input
                    type="checkbox"
                    v-model="selectedItems"
                    :value="item.id"
                    class="rounded border-slate-600 bg-slate-700"
                  />
                </td>
                
                <!-- Dynamic columns based on active tab -->
                <td
                  v-for="column in activeTabConfig.columns"
                  :key="column.key"
                  class="p-3"
                  :class="column.class"
                >
                  <!-- Simple display for now, will add inline editing later -->
                  <span class="text-slate-300">
                    {{ getItemValue(item, column.key) }}
                  </span>
                </td>
                
                <td class="p-3">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="editItem(item)"
                      class="text-indigo-400 hover:text-indigo-300"
                      title="Edit"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="duplicateItem(item)"
                      class="text-emerald-400 hover:text-emerald-300"
                      title="Duplicate"
                    >
                      <DocumentDuplicateIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteItem(item.id)"
                      class="text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Bulk Actions -->
        <div v-if="bulkEditMode && selectedItems.length > 0" class="mt-6 p-4 bg-slate-800 rounded-lg">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-300">{{ selectedItems.length }} items selected</span>
            <div class="flex items-center space-x-2">
              <button
                @click="bulkDelete"
                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Delete Selected
              </button>
              <button
                @click="bulkExport"
                class="btn-secondary text-sm px-3 py-1"
              >
                Export Selected
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Actions -->
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-white mb-2">Configuration Management</h3>
            <p class="text-sm text-slate-400">Import, export, and manage configuration sets</p>
          </div>
          
          <div class="flex items-center space-x-3">
            <button @click="exportAllCSV" class="btn-secondary">
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Export All CSV
            </button>
            <button @click="importCSV" class="btn-secondary">
              <ArrowUpTrayIcon class="w-4 h-4 mr-2" />
              Import CSV
            </button>
            <button @click="saveConfigurationSet" class="btn-primary">
              <BookmarkIcon class="w-4 h-4 mr-2" />
              Save Configuration Set
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Item Modal -->
  <EditItemModal
    v-if="editingItem"
    :item="editingItem"
    :config="activeTabConfig"
    @save="saveItemEdit"
    @cancel="cancelItemEdit"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameValuesStore } from '../stores/gameValues.js'
import EditItemModal from '../components/EditItemModal.vue'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BookmarkIcon
} from '@heroicons/vue/24/outline'

// Import tab icons
import {
  SparklesIcon,
  WrenchScrewdriverIcon,
  GiftIcon,
  ShieldExclamationIcon,
  CubeIcon,
  BeakerIcon
} from '@heroicons/vue/24/outline'

const gameValues = useGameValuesStore()

// Reactive state
const activeTab = ref('crops')
const searchQuery = ref('')
const sortBy = ref('name')
const sortDirection = ref('asc') // 'asc' or 'desc'
const bulkEditMode = ref(false)
const selectedItems = ref([])
const editingItem = ref(null)

// Configuration tabs
const configTabs = computed(() => [
  {
    id: 'crops',
    name: 'Crops',
    icon: SparklesIcon,
    count: Object.keys(gameValues.crops || {}).length
  },
  {
    id: 'adventures',
    name: 'Adventures',
    icon: ShieldExclamationIcon,
    count: Object.keys(gameValues.adventures || {}).length
  },
  {
    id: 'upgrades',
    name: 'Upgrades',
    icon: WrenchScrewdriverIcon,
    count: Object.keys(gameValues.upgrades || {}).length
  },
  {
    id: 'mining',
    name: 'Mining',
    icon: CubeIcon,
    count: Object.keys(gameValues.mining || {}).length
  },
  {
    id: 'helpers',
    name: 'Helpers',
    icon: GiftIcon,
    count: Object.keys(gameValues.helpers || {}).length
  },
  {
    id: 'combat',
    name: 'Combat',
    icon: BeakerIcon,
    count: Object.keys(gameValues.combat || {}).length
  }
])

// Tab configurations
const tabConfigs = {
  crops: {
    singular: 'Crop',
    columns: [
      { key: 'name', label: 'Name', type: 'text', class: 'w-48' },
      { key: 'tier', label: 'Tier', type: 'text', class: 'w-24' },
      { key: 'unlockDay', label: 'Unlock Day', type: 'number', class: 'w-24' },
      { key: 'growthTime', label: 'Growth Time', type: 'number', class: 'w-32' },
      { key: 'energy', label: 'Energy', type: 'number', class: 'w-24' },
      { key: 'seedCost', label: 'Seed Cost', type: 'number', class: 'w-24' }
    ]
  },
  adventures: {
    singular: 'Adventure',
    columns: [
      { key: 'name', label: 'Name', type: 'text', class: 'w-48' },
      { key: 'unlockDay', label: 'Unlock Day', type: 'number', class: 'w-24' },
      { key: 'shortEnergy', label: 'Short Energy', type: 'number', class: 'w-32' },
      { key: 'mediumEnergy', label: 'Medium Energy', type: 'number', class: 'w-32' },
      { key: 'longEnergy', label: 'Long Energy', type: 'number', class: 'w-32' },
      { key: 'goldReward', label: 'Gold Reward', type: 'number', class: 'w-32' }
    ]
  },
  upgrades: {
    singular: 'Upgrade',
    columns: [
      { key: 'name', label: 'Name', type: 'text', class: 'w-48' },
      { key: 'category', label: 'Category', type: 'text', class: 'w-32' },
      { key: 'unlockDay', label: 'Unlock Day', type: 'number', class: 'w-24' },
      { key: 'goldCost', label: 'Gold Cost', type: 'number', class: 'w-32' },
      { key: 'energyCost', label: 'Energy Cost', type: 'number', class: 'w-32' },
      { key: 'effect', label: 'Effect', type: 'text', class: 'w-48' }
    ]
  },
  mining: {
    singular: 'Mining Level',
    columns: [
      { key: 'name', label: 'Name', type: 'text', class: 'w-48' },
      { key: 'depth', label: 'Depth', type: 'number', class: 'w-20' },
      { key: 'unlockDay', label: 'Unlock Day', type: 'number', class: 'w-24' },
      { key: 'energyDrain', label: 'Energy/Min', type: 'number', class: 'w-28' },
      { key: 'commonMaterial', label: 'Common Drop', type: 'text', class: 'w-32' },
      { key: 'rareMaterial', label: 'Rare Drop', type: 'text', class: 'w-32' },
      { key: 'specialFind', label: 'Special Find', type: 'text', class: 'w-40' },
      { key: 'specialChance', label: 'Chance %', type: 'number', class: 'w-24' }
    ]
  },
  helpers: {
    singular: 'Helper',
    columns: [
      { key: 'name', label: 'Name', type: 'text', class: 'w-48' },
      { key: 'type', label: 'Type', type: 'text', class: 'w-24' },
      { key: 'unlockDay', label: 'Unlock Day', type: 'number', class: 'w-24' },
      { key: 'basePlotCapacity', label: 'Base Plots', type: 'number', class: 'w-24' },
      { key: 'maxPlotCapacity', label: 'Max Plots', type: 'number', class: 'w-24' },
      { key: 'awakeningEnergy', label: 'Awaken Cost', type: 'number', class: 'w-28' },
      { key: 'specialAbility', label: 'Special Ability', type: 'text', class: 'w-40' }
    ]
  },
  combat: {
    singular: 'Combat Item',
    columns: [
      { key: 'name', label: 'Name', type: 'text', class: 'w-48' },
      { key: 'type', label: 'Type', type: 'text', class: 'w-24' },
      { key: 'category', label: 'Category', type: 'text', class: 'w-24' },
      { key: 'unlockDay', label: 'Unlock Day', type: 'number', class: 'w-24' },
      { key: 'damage', label: 'Damage', type: 'number', class: 'w-20' },
      { key: 'goldCost', label: 'Gold Cost', type: 'number', class: 'w-24' },
      { key: 'craftTime', label: 'Craft Time', type: 'number', class: 'w-24' },
      { key: 'effect', label: 'Effect', type: 'text', class: 'w-32' }
    ]
  }
}

// Computed properties
const activeTabConfig = computed(() => tabConfigs[activeTab.value] || tabConfigs.crops)

const hasUnsavedChanges = computed(() => gameValues.hasUnsavedChanges || false)

const currentItems = computed(() => {
  const tabData = gameValues[activeTab.value]
  if (!tabData || Object.keys(tabData).length === 0) return []
  
  return Object.entries(tabData).map(([id, data]) => ({
    id,
    ...data
  }))
})

const filteredItems = computed(() => {
  let items = [...currentItems.value] // Create a copy to avoid mutating original
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.name?.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    )
  }
  
  // Apply sorting
  items.sort((a, b) => {
    const aVal = getItemValue(a, sortBy.value)
    const bVal = getItemValue(b, sortBy.value)
    
    let comparison = 0
    
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase())
    } else {
      comparison = (aVal || 0) - (bVal || 0)
    }
    
    // Apply sort direction
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
  
  return items
})

// Methods
function handleSort(columnKey) {
  if (sortBy.value === columnKey) {
    // Toggle direction if clicking the same column
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // New column, default to ascending
    sortBy.value = columnKey
    sortDirection.value = 'asc'
  }
}

function getItemValue(item, key) {
  if (key.includes('.')) {
    const keys = key.split('.')
    let value = item
    for (const k of keys) {
      value = value?.[k]
    }
    return value
  }
  return item[key]
}

function updateItemValue(itemId, key, value) {
  // Update the item value in the store
  gameValues.updateItemValue(activeTab.value, itemId, key, value)
}

function getColumnComponent(type) {
  // For now, just return 'span' until we implement inline edit components
  // TODO: Implement InlineTextEdit, InlineNumberEdit, InlineSelectEdit components
  return 'span'
}

function toggleBulkEdit() {
  bulkEditMode.value = !bulkEditMode.value
  selectedItems.value = []
}

function toggleAllSelection(event) {
  if (event.target.checked) {
    selectedItems.value = filteredItems.value.map(item => item.id)
  } else {
    selectedItems.value = []
  }
}

function editItem(item) {
  editingItem.value = { ...item }
}

function saveItemEdit(updatedItem) {
  // Save the edited item
  gameValues.updateItem(activeTab.value, updatedItem.id, updatedItem)
  editingItem.value = null
}

function cancelItemEdit() {
  editingItem.value = null
}

function duplicateItem(item) {
  const newId = `${item.id}_copy_${Date.now()}`
  const newItem = { ...item, name: `${item.name} (Copy)` }
  gameValues.addItem(activeTab.value, newId, newItem)
}

function deleteItem(itemId) {
  if (confirm('Are you sure you want to delete this item?')) {
    gameValues.deleteItem(activeTab.value, itemId)
  }
}

function addNewItem() {
  // Create a new item with default values
  const newId = `new_${activeTab.value}_${Date.now()}`
  const newItem = createDefaultItem(activeTab.value)
  gameValues.addItem(activeTab.value, newId, newItem)
  editItem({ id: newId, ...newItem })
}

function createDefaultItem(type) {
  const defaults = {
    crops: {
      name: 'New Crop',
      growth_time: 60,
      energy_cost: 1,
      energy_reward: 2,
      gold_reward: 10,
      water_cost: 1
    },
    adventures: {
      name: 'New Adventure',
      energy_cost: 10,
      duration: 30,
      gold_reward: 50,
      materials_reward: 1,
      difficulty: 'medium'
    },
    upgrades: {
      name: 'New Upgrade',
      cost: { gold: 100, energy: 0, materials: 0 },
      effects: 'New effect',
      category: 'farm'
    }
  }
  
  return defaults[type] || {}
}

function bulkDelete() {
  if (confirm(`Are you sure you want to delete ${selectedItems.value.length} items?`)) {
    selectedItems.value.forEach(itemId => {
      gameValues.deleteItem(activeTab.value, itemId)
    })
    selectedItems.value = []
  }
}

function bulkExport() {
  // Export selected items as CSV
  const items = selectedItems.value.map(id => 
    currentItems.value.find(item => item.id === id)
  )
  gameValues.exportItemsAsCSV(activeTab.value, items)
}

function saveConfiguration() {
  gameValues.saveConfiguration()
}

function resetToDefaults() {
  if (confirm('This will reset all values to defaults. Are you sure?')) {
    gameValues.resetToDefaults()
  }
}

function exportAllCSV() {
  gameValues.exportAllAsCSV()
}

function importCSV() {
  // Trigger file input for CSV import
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      gameValues.importFromCSV(activeTab.value, file)
    }
  }
  input.click()
}

function saveConfigurationSet() {
  const name = prompt('Enter a name for this configuration set:')
  if (name) {
    gameValues.saveConfigurationSet(name)
  }
}
</script>
