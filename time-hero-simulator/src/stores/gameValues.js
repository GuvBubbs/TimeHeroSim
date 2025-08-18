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
  
  // New data structures for Phase 1
  const weapons = ref(Object.freeze({}))
  const armor = ref(Object.freeze({}))
  const helperRoles = ref(Object.freeze({}))
  const towerLevels = ref(Object.freeze({}))
  const vendors = ref(Object.freeze({}))
  const cleanups = ref(Object.freeze({}))
  const bossMaterials = ref(Object.freeze({}))
  
  // Validation state
  const isLoaded = ref(false)
  const validationErrors = ref([])
  const lastUpdated = ref(null)
  const hasUnsavedChanges = ref(false)
  
  // Computed getters for easy access
  const getCropsBySeedLevel = computed(() => {
    const levels = {}
    Object.values(crops.value).forEach(crop => {
      const level = crop.seedLevel || 0
      if (!levels[level]) {
        levels[level] = []
      }
      levels[level].push(crop)
    })
    return levels
  })
  
  const getUpgradesByVendor = computed(() => {
    const vendors = {}
    Object.values(upgrades.value).forEach(upgrade => {
      if (!vendors[upgrade.vendor]) {
        vendors[upgrade.vendor] = []
      }
      vendors[upgrade.vendor].push(upgrade)
    })
    return vendors
  })
  
  const getWeaponsByType = computed(() => {
    const types = {}
    Object.values(weapons.value).forEach(weapon => {
      if (!types[weapon.type]) {
        types[weapon.type] = []
      }
      types[weapon.type].push(weapon)
    })
    return types
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
      
      // New data structures
      weapons.value = Object.freeze(gameData.weapons || {})
      armor.value = Object.freeze(gameData.armor || {})
      helperRoles.value = Object.freeze(gameData.helperRoles || {})
      towerLevels.value = Object.freeze(gameData.towerLevels || {})
      vendors.value = Object.freeze(gameData.vendors || {})
      cleanups.value = Object.freeze(gameData.cleanups || {})
      bossMaterials.value = Object.freeze(gameData.bossMaterials || {})
      
      isLoaded.value = true
      lastUpdated.value = new Date().toISOString()
      validationErrors.value = []
      
      console.log('Game values loaded successfully:', {
        crops: Object.keys(crops.value).length,
        upgrades: Object.keys(upgrades.value).length,
        adventures: Object.keys(adventures.value).length,
        weapons: Object.keys(weapons.value).length,
        armor: Object.keys(armor.value).length,
        tools: Object.keys(tools.value).length,
        helpers: Object.keys(helpers.value).length,
        helperRoles: Object.keys(helperRoles.value).length,
        mining: Object.keys(mining.value).length,
        towerLevels: Object.keys(towerLevels.value).length,
        vendors: Object.keys(vendors.value).length,
        cleanups: Object.keys(cleanups.value).length,
        bossMaterials: Object.keys(bossMaterials.value).length
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
      if (crop.seedLevel === undefined || crop.seedLevel < 0 || crop.seedLevel > 9) {
        errors.push(`Invalid seed level for crop ${id}: ${crop.seedLevel}`)
      }
    })
    
    // Validate weapons
    Object.entries(weapons.value).forEach(([id, weapon]) => {
      if (!weapon.damage || weapon.damage < 0) {
        errors.push(`Invalid damage for weapon ${id}: ${weapon.damage}`)
      }
      if (!weapon.type || !['spear', 'sword', 'bow', 'crossbow', 'wand'].includes(weapon.type)) {
        errors.push(`Invalid type for weapon ${id}: ${weapon.type}`)
      }
      if (!weapon.level || weapon.level < 1 || weapon.level > 10) {
        errors.push(`Invalid level for weapon ${id}: ${weapon.level}`)
      }
      if (weapon.materials && !validateMaterialsFormat(weapon.materials)) {
        errors.push(`Invalid materials format for weapon ${id}: ${weapon.materials}`)
      }
    })
    
    // Validate tools
    Object.entries(tools.value).forEach(([id, tool]) => {
      if (!tool.tier || !['base', 'plus', 'master', 'iron', 'silver', 'crystal', 'mythril'].includes(tool.tier)) {
        errors.push(`Invalid tier for tool ${id}: ${tool.tier}`)
      }
      if (!tool.category || !['farm', 'mining'].includes(tool.category)) {
        errors.push(`Invalid category for tool ${id}: ${tool.category}`)
      }
      if (tool.materials && !validateMaterialsFormat(tool.materials)) {
        errors.push(`Invalid materials format for tool ${id}: ${tool.materials}`)
      }
    })
    
    // Validate upgrades have proper materials format
    Object.entries(upgrades.value).forEach(([id, upgrade]) => {
      if (!upgrade.vendor) {
        errors.push(`Missing vendor for upgrade ${id}`)
      }
      if (upgrade.materials && !validateMaterialsFormat(upgrade.materials)) {
        errors.push(`Invalid materials format for upgrade ${id}: ${upgrade.materials}`)
      }
    })
    
    // Validate adventures
    Object.entries(adventures.value).forEach(([id, adventure]) => {
      if (adventure.enemyTypes && !validateEnemyTypesFormat(adventure.enemyTypes)) {
        errors.push(`Invalid enemy types format for adventure ${id}: ${adventure.enemyTypes}`)
      }
      if (adventure.commonMat && !validateMaterialsFormat(adventure.commonMat)) {
        errors.push(`Invalid common materials format for adventure ${id}: ${adventure.commonMat}`)
      }
    })
    
    validationErrors.value = errors
    return errors.length === 0
  }
  
  // Validate materials format: "wood:5;stone:3" or "stone:8-12"
  function validateMaterialsFormat(materialsString) {
    if (!materialsString || materialsString.trim() === '') return true
    
    try {
      const materials = materialsString.split(';')
      return materials.every(material => {
        const parts = material.trim().split(':')
        if (parts.length !== 2) return false
        
        const [materialName, amount] = parts
        if (!materialName || materialName.trim() === '') return false
        
        // Check if amount is a number or range (e.g., "8-12")
        const amountStr = amount.trim()
        if (amountStr.includes('-')) {
          const rangeParts = amountStr.split('-')
          return rangeParts.length === 2 && 
                 !isNaN(parseInt(rangeParts[0])) && 
                 !isNaN(parseInt(rangeParts[1]))
        } else {
          return !isNaN(parseInt(amountStr))
        }
      })
    } catch (error) {
      return false
    }
  }
  
  // Validate enemy types format: "slimes:100" or "beasts:60;slimes:40"
  function validateEnemyTypesFormat(enemyTypesString) {
    if (!enemyTypesString || enemyTypesString.trim() === '') return true
    
    try {
      const enemies = enemyTypesString.split(';')
      return enemies.every(enemy => {
        const parts = enemy.trim().split(':')
        return parts.length === 2 && 
               parts[0].trim() !== '' && 
               !isNaN(parseInt(parts[1]))
      })
    } catch (error) {
      return false
    }
  }
  
  // Parse materials string into object
  function parseMaterials(materialsString) {
    if (!materialsString || materialsString.trim() === '') return {}
    
    const materials = {}
    materialsString.split(';').forEach(material => {
      const [name, amount] = material.trim().split(':')
      if (name && amount) {
        materials[name.trim()] = amount.trim()
      }
    })
    return materials
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
    weapons,
    armor,
    helperRoles,
    towerLevels,
    vendors,
    cleanups,
    bossMaterials,
    isLoaded,
    validationErrors,
    lastUpdated,
    hasUnsavedChanges,
    
    // Computed
    getCropsBySeedLevel,
    getUpgradesByVendor,
    getWeaponsByType,
    
    // Actions
    loadGameValues,
    validateGameValues,
    getCrop,
    getUpgrade,
    getAdventure,
    saveConfiguration,
    parseMaterials,
    validateMaterialsFormat,
    validateEnemyTypesFormat,
    
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
