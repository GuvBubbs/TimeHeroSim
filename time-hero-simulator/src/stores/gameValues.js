import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Game Values Store - Immutable imported values
 * 
 * This store contains all game values loaded from CSVs/JSON files.
 * These values are NEVER modified by the simulator - they represent
 * the actual game's design and must be preserved exactly.
 */
export const useGameValuesStore = defineStore('gameValues', () => {
  // Immutable game data - loaded from CSV/JSON files
  const crops = ref(Object.freeze({}))
  const upgrades = ref(Object.freeze({}))
  const adventures = ref(Object.freeze({}))
  const mining = ref(Object.freeze({}))
  const helpers = ref(Object.freeze({}))
  const combat = ref(Object.freeze({}))
  const tools = ref(Object.freeze({}))
  const storage = ref(Object.freeze({}))
  
  // Validation state
  const isLoaded = ref(false)
  const validationErrors = ref([])
  const lastUpdated = ref(null)
  const hasUnsavedChanges = ref(false)
  
  // Computed getters for easy access
  const getCropsByTier = computed(() => {
    const tiers = { early: [], mid: [], late: [], endgame: [] }
    Object.values(crops.value).forEach(crop => {
      if (tiers[crop.tier]) {
        tiers[crop.tier].push(crop)
      }
    })
    return tiers
  })
  
  const getUpgradesByCategory = computed(() => {
    const categories = {}
    Object.values(upgrades.value).forEach(upgrade => {
      if (!categories[upgrade.category]) {
        categories[upgrade.category] = []
      }
      categories[upgrade.category].push(upgrade)
    })
    return categories
  })
  
  // Load game values from imported data
  function loadGameValues(gameData) {
    try {
      // Freeze all imported data to prevent modification
      crops.value = Object.freeze(gameData.crops || {})
      upgrades.value = Object.freeze(gameData.upgrades || {})
      adventures.value = Object.freeze(gameData.adventures || {})
      mining.value = Object.freeze(gameData.mining || {})
      helpers.value = Object.freeze(gameData.helpers || {})
      combat.value = Object.freeze(gameData.combat || {})
      tools.value = Object.freeze(gameData.tools || {})
      storage.value = Object.freeze(gameData.storage || {})
      
      isLoaded.value = true
      lastUpdated.value = new Date().toISOString()
      validationErrors.value = []
      
      console.log('Game values loaded successfully:', {
        crops: Object.keys(crops.value).length,
        upgrades: Object.keys(upgrades.value).length,
        adventures: Object.keys(adventures.value).length
      })
    } catch (error) {
      console.error('Failed to load game values:', error)
      validationErrors.value.push(`Load error: ${error.message}`)
    }
  }
  
  // Validate imported data integrity
  function validateGameValues() {
    const errors = []
    
    // Validate crops
    Object.entries(crops.value).forEach(([id, crop]) => {
      if (!crop.energy || crop.energy < 0) {
        errors.push(`Invalid energy for crop ${id}: ${crop.energy}`)
      }
      if (!crop.growthTime || crop.growthTime < 0) {
        errors.push(`Invalid growth time for crop ${id}: ${crop.growthTime}`)
      }
      if (!['early', 'mid', 'late', 'endgame'].includes(crop.tier)) {
        errors.push(`Invalid tier for crop ${id}: ${crop.tier}`)
      }
    })
    
    // Validate upgrades have costs
    Object.entries(upgrades.value).forEach(([id, upgrade]) => {
      if (!upgrade.cost || Object.keys(upgrade.cost).length === 0) {
        errors.push(`Missing cost for upgrade ${id}`)
      }
    })
    
    validationErrors.value = errors
    return errors.length === 0
  }
  
  // Get crop by ID with error handling
  function getCrop(cropId) {
    return crops.value[cropId] || null
  }
  
  // Get upgrade by ID with error handling
  function getUpgrade(upgradeId) {
    return upgrades.value[upgradeId] || null
  }
  
  // Get adventure route by ID
  function getAdventure(adventureId) {
    return adventures.value[adventureId] || null
  }

  // Save configuration (placeholder for future implementation)
  function saveConfiguration() {
    hasUnsavedChanges.value = false
    console.log('Configuration saved')
  }
  
  // Stub methods for GameConfiguration component
  function updateItemValue(category, itemId, key, value) {
    console.log('updateItemValue called:', category, itemId, key, value)
    // TODO: Implement actual update logic
  }
  
  function updateItem(category, itemId, updatedItem) {
    console.log('updateItem called:', category, itemId, updatedItem)
    // TODO: Implement actual update logic
  }
  
  function addItem(category, itemId, newItem) {
    console.log('addItem called:', category, itemId, newItem)
    // TODO: Implement actual add logic
  }
  
  function deleteItem(category, itemId) {
    console.log('deleteItem called:', category, itemId)
    // TODO: Implement actual delete logic
  }
  
  function exportItemsAsCSV(category, items) {
    console.log('exportItemsAsCSV called:', category, items)
    // TODO: Implement CSV export
  }
  
  function resetToDefaults() {
    console.log('resetToDefaults called')
    // TODO: Reload from CSV files
  }
  
  function exportAllAsCSV() {
    console.log('exportAllAsCSV called')
    // TODO: Export all data as CSV
  }
  
  function importFromCSV(category, file) {
    console.log('importFromCSV called:', category, file)
    // TODO: Import CSV file
  }
  
  function saveConfigurationSet(name) {
    console.log('saveConfigurationSet called:', name)
    // TODO: Save configuration set
  }
  
  function updateUpgrade(upgradeId, updatedData) {
    console.log('updateUpgrade called:', upgradeId, updatedData)
    // TODO: Implement upgrade update logic
  }
  
  function deleteUpgrade(upgradeId) {
    console.log('deleteUpgrade called:', upgradeId)
    // TODO: Implement upgrade deletion logic
  }
  
  function exportUpgradeTree() {
    console.log('exportUpgradeTree called')
    // TODO: Export upgrade tree as JSON or CSV
  }
  
  return {
    // State
    crops,
    upgrades,
    adventures,
    mining,
    helpers,
    combat,
    tools,
    storage,
    isLoaded,
    validationErrors,
    lastUpdated,
    hasUnsavedChanges,
    
    // Computed
    getCropsByTier,
    getUpgradesByCategory,
    
    // Actions
    loadGameValues,
    validateGameValues,
    getCrop,
    getUpgrade,
    getAdventure,
    saveConfiguration,
    
    // Methods for GameConfiguration component
    updateItemValue,
    updateItem,
    addItem,
    deleteItem,
    exportItemsAsCSV,
    resetToDefaults,
    exportAllAsCSV,
    importFromCSV,
    saveConfigurationSet,
    updateUpgrade,
    deleteUpgrade,
    exportUpgradeTree
  }
})
