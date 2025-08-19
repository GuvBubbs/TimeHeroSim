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
  const adventures = ref(Object.freeze({}))
  const mining = ref(Object.freeze({}))
  const helpers = ref(Object.freeze({}))
  const tools = ref(Object.freeze({}))
  const storage = ref(Object.freeze({}))
  
  // New data structures for Phase 1
  const weapons = ref(Object.freeze({}))
  const helperRoles = ref(Object.freeze({}))
  const towerLevels = ref(Object.freeze({}))
  const vendors = ref(Object.freeze({}))
  const bossMaterials = ref(Object.freeze({}))
  
  // Combat system data structures
  const armorBase = ref(Object.freeze({}))
  const armorPotential = ref(Object.freeze({}))
  const armorEffects = ref(Object.freeze({}))
  const routeLootTable = ref(Object.freeze({}))
  const enemyTypesDamage = ref(Object.freeze({}))
  const routeWaveComposition = ref(Object.freeze({}))
  
  // Farm system data structures
  const farmCleanups = ref(Object.freeze({}))
  const farmStages = ref(Object.freeze({}))
  const farmProjects = ref(Object.freeze({}))
  const gnomeRoles = ref(Object.freeze({}))
  
  // Progression and XP
  const xpProgression = ref(Object.freeze({}))
  
  // Town vendor data structures
  const townBlacksmith = ref(Object.freeze({}))
  const townAgronomist = ref(Object.freeze({}))
  const townCarpenter = ref(Object.freeze({}))
  const townLandSteward = ref(Object.freeze({}))
  const townMaterialTrader = ref(Object.freeze({}))
  const townSkillsTrainer = ref(Object.freeze({}))
  
  // Crafting and refinement
  const forgeCrafting = ref(Object.freeze({}))
  const materialRefinement = ref(Object.freeze({}))
  
  // Game flow
  const phaseTransitions = ref(Object.freeze({}))
  
  // Unified nodes for upgrade tree
  const unifiedNodes = ref(Object.freeze([]))
  
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
      adventures.value = Object.freeze(gameData.adventures || {})
      mining.value = Object.freeze(gameData.mining || {})
      helpers.value = Object.freeze(gameData.helpers || {})
      tools.value = Object.freeze(gameData.tools || {})
      storage.value = Object.freeze(gameData.storage || {})
      
      // New data structures
      weapons.value = Object.freeze(gameData.weapons || {})
      helperRoles.value = Object.freeze(gameData.helperRoles || {})
      towerLevels.value = Object.freeze(gameData.towerLevels || {})
      vendors.value = Object.freeze(gameData.vendors || {})
      bossMaterials.value = Object.freeze(gameData.bossMaterials || {})
      
      // Combat system data structures
      armorBase.value = Object.freeze(gameData.armorBase || {})
      armorPotential.value = Object.freeze(gameData.armorPotential || {})
      armorEffects.value = Object.freeze(gameData.armorEffects || {})
      routeLootTable.value = Object.freeze(gameData.routeLootTable || {})
      enemyTypesDamage.value = Object.freeze(gameData.enemyTypesDamage || {})
      routeWaveComposition.value = Object.freeze(gameData.routeWaveComposition || {})
      
      // Farm system data structures
      farmCleanups.value = Object.freeze(gameData.farmCleanups || {})
      farmStages.value = Object.freeze(gameData.farmStages || {})
      farmProjects.value = Object.freeze(gameData.farmProjects || {})
      gnomeRoles.value = Object.freeze(gameData.gnomeRoles || {})
      
      // Progression and XP
      xpProgression.value = Object.freeze(gameData.xpProgression || {})
      
      // Town vendor data structures
      townBlacksmith.value = Object.freeze(gameData.townBlacksmith || {})
      townAgronomist.value = Object.freeze(gameData.townAgronomist || {})
      townCarpenter.value = Object.freeze(gameData.townCarpenter || {})
      townLandSteward.value = Object.freeze(gameData.townLandSteward || {})
      townMaterialTrader.value = Object.freeze(gameData.townMaterialTrader || {})
      townSkillsTrainer.value = Object.freeze(gameData.townSkillsTrainer || {})
      
      // Crafting and refinement
      forgeCrafting.value = Object.freeze(gameData.forgeCrafting || {})
      materialRefinement.value = Object.freeze(gameData.materialRefinement || {})
      
      // Game flow
      phaseTransitions.value = Object.freeze(gameData.phaseTransitions || {})
      
      // Unified nodes for upgrade tree
      unifiedNodes.value = Object.freeze(gameData.unifiedNodes || [])
      
      isLoaded.value = true
      lastUpdated.value = new Date().toISOString()
      validationErrors.value = []
      
      console.log('Game values loaded successfully:', {
        crops: Object.keys(crops.value).length,
        adventures: Object.keys(adventures.value).length,
        weapons: Object.keys(weapons.value).length,
        armorBase: Object.keys(armorBase.value).length,
        armorPotential: Object.keys(armorPotential.value).length,
        armorEffects: Object.keys(armorEffects.value).length,
        routeLootTable: Object.keys(routeLootTable.value).length,
        enemyTypesDamage: Object.keys(enemyTypesDamage.value).length,
        routeWaveComposition: Object.keys(routeWaveComposition.value).length,
        tools: Object.keys(tools.value).length,
        helpers: Object.keys(helpers.value).length,
        helperRoles: Object.keys(helperRoles.value).length,
        mining: Object.keys(mining.value).length,
        towerLevels: Object.keys(towerLevels.value).length,
        vendors: Object.keys(vendors.value).length,
        bossMaterials: Object.keys(bossMaterials.value).length,
        farmCleanups: Object.keys(farmCleanups.value).length,
        farmStages: Object.keys(farmStages.value).length,
        farmProjects: Object.keys(farmProjects.value).length,
        gnomeRoles: Object.keys(gnomeRoles.value).length,
        xpProgression: Object.keys(xpProgression.value).length,
        townBlacksmith: Object.keys(townBlacksmith.value).length,
        townAgronomist: Object.keys(townAgronomist.value).length,
        townCarpenter: Object.keys(townCarpenter.value).length,
        townLandSteward: Object.keys(townLandSteward.value).length,
        townMaterialTrader: Object.keys(townMaterialTrader.value).length,
        townSkillsTrainer: Object.keys(townSkillsTrainer.value).length,
        forgeCrafting: Object.keys(forgeCrafting.value).length,
        materialRefinement: Object.keys(materialRefinement.value).length,
        phaseTransitions: Object.keys(phaseTransitions.value).length
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
      if (!crop.energy_per_harvest || crop.energy_per_harvest < 0) {
        errors.push(`Invalid energy for crop ${id}: ${crop.energy_per_harvest}`)
      }
      if (!crop.growth_time_min || crop.growth_time_min < 0) {
        errors.push(`Invalid growth time for crop ${id}: ${crop.growth_time_min}`)
      }
      if (!['Early', 'Mid', 'Late', 'Endgame'].includes(crop.tier)) {
        errors.push(`Invalid tier for crop ${id}: ${crop.tier}`)
      }
      if (crop.seed_level === undefined || crop.seed_level < 0 || crop.seed_level > 9) {
        errors.push(`Invalid seed level for crop ${id}: ${crop.seed_level}`)
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
  
  // Get adventure route by ID
  function getAdventure(adventureId) {
    return adventures.value[adventureId] || null
  }

  // Save configuration (placeholder for future implementation)
  function saveConfiguration() {
    hasUnsavedChanges.value = false
    console.log('Configuration saved')
  }
  
  // Method implementations for GameConfiguration component
  function updateItemValue(category, itemId, key, value) {
    console.log('updateItemValue called:', category, itemId, key, value)
    const dataRef = getDataRef(category)
    if (dataRef && dataRef.value[itemId]) {
      const updatedData = { ...dataRef.value }
      updatedData[itemId] = { ...updatedData[itemId], [key]: value }
      dataRef.value = Object.freeze(updatedData)
      hasUnsavedChanges.value = true
    }
  }
  
  function updateItem(category, itemId, updatedItem) {
    console.log('updateItem called:', category, itemId, updatedItem)
    const dataRef = getDataRef(category)
    if (dataRef) {
      const updatedData = { ...dataRef.value }
      updatedData[itemId] = { ...updatedItem }
      dataRef.value = Object.freeze(updatedData)
      hasUnsavedChanges.value = true
      
      // Save to server automatically
      saveCategoryToServer(category)
    }
  }
  
  function addItem(category, itemId, newItem) {
    console.log('addItem called:', category, itemId, newItem)
    const dataRef = getDataRef(category)
    if (dataRef) {
      const updatedData = { ...dataRef.value }
      updatedData[itemId] = { ...newItem }
      dataRef.value = Object.freeze(updatedData)
      hasUnsavedChanges.value = true
      
      // Save to server automatically
      saveCategoryToServer(category)
    }
  }
  
  function deleteItem(category, itemId) {
    console.log('deleteItem called:', category, itemId)
    const dataRef = getDataRef(category)
    if (dataRef && dataRef.value[itemId]) {
      const updatedData = { ...dataRef.value }
      delete updatedData[itemId]
      dataRef.value = Object.freeze(updatedData)
      hasUnsavedChanges.value = true
      
      // Save to server automatically
      saveCategoryToServer(category)
    }
  }

  // New function to save data to server via API
  async function saveCategoryToServer(category) {
    const dataRef = getDataRef(category)
    if (!dataRef) return

    const items = Object.values(dataRef.value)
    if (items.length === 0) return

    // Get headers from first item or use default
    const allKeys = new Set()
    items.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== '_csvIndex') { // Exclude internal fields
          allKeys.add(key)
        }
      })
    })

    const headers = Array.from(allKeys)
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n'
    
    // Sort by _csvIndex if available to maintain order
    const sortedItems = items.sort((a, b) => {
      if (a._csvIndex !== undefined && b._csvIndex !== undefined) {
        return a._csvIndex - b._csvIndex
      }
      if (a._csvIndex !== undefined) return -1
      if (b._csvIndex !== undefined) return 1
      return (a.id || '').localeCompare(b.id || '')
    })
    
    sortedItems.forEach(item => {
      const row = headers.map(key => {
        let value = item[key] || ''
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          value = '"' + value.replace(/"/g, '""') + '"'
        }
        return value
      })
      csvContent += row.join(',') + '\n'
    })

    try {
      const response = await fetch('/api/save-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `${category}.csv`,
          content: csvContent
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ ${result.message}`)
        hasUnsavedChanges.value = false
      } else {
        const error = await response.json()
        console.error('Failed to save CSV:', error.error)
      }
    } catch (error) {
      console.error('Error saving to server:', error)
    }
  }

  // Helper function to get the correct data ref
  function getDataRef(category) {
    const dataRefs = {
      crops,
      adventures,
      mining,
      helpers,
      tools,
      storage,
      weapons,
      armorBase,
      armorPotential,
      armorEffects,
      routeLootTable,
      enemyTypesDamage,
      routeWaveComposition,
      helperRoles,
      towerLevels,
      vendors,
      bossMaterials,
      farmCleanups,
      farmStages,
      farmProjects,
      gnomeRoles,
      xpProgression,
      townBlacksmith,
      townAgronomist,
      townCarpenter,
      townLandSteward,
      townMaterialTrader,
      townSkillsTrainer,
      forgeCrafting,
      materialRefinement,
      phaseTransitions
    }
    return dataRefs[category]
  }

  // CSV Export functions
  function exportCategoryAsCSV(category) {
    const dataRef = getDataRef(category)
    if (!dataRef || !dataRef.value) {
      console.error('No data found for category:', category)
      return
    }

    const items = Object.values(dataRef.value)
    if (items.length === 0) {
      console.error('No items found for category:', category)
      return
    }

    // Get all unique keys from all items
    const allKeys = new Set()
    items.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== '_csvIndex') { // Exclude internal fields
          allKeys.add(key)
        }
      })
    })

    const headers = Array.from(allKeys)
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n'
    
    // Sort items by _csvIndex to maintain original order, then by id
    const sortedItems = items.sort((a, b) => {
      if (a._csvIndex !== undefined && b._csvIndex !== undefined) {
        return a._csvIndex - b._csvIndex
      }
      if (a._csvIndex !== undefined) return -1
      if (b._csvIndex !== undefined) return 1
      return (a.id || '').localeCompare(b.id || '')
    })
    
    sortedItems.forEach(item => {
      const row = headers.map(key => {
        let value = item[key] || ''
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          value = '"' + value.replace(/"/g, '""') + '"'
        }
        return value
      })
      csvContent += row.join(',') + '\n'
    })

    // Download the CSV file
    downloadCSV(csvContent, `${category}.csv`)
  }
  
  function exportItemsAsCSV(category, items) {
    console.log('exportItemsAsCSV called:', category, items)
    
    if (!items || items.length === 0) {
      console.error('No items to export')
      return
    }

    // Get all unique keys from all items
    const allKeys = new Set()
    items.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== '_csvIndex') { // Exclude internal fields
          allKeys.add(key)
        }
      })
    })

    const headers = Array.from(allKeys)
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n'
    
    items.forEach(item => {
      const row = headers.map(key => {
        let value = item[key] || ''
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          value = '"' + value.replace(/"/g, '""') + '"'
        }
        return value
      })
      csvContent += row.join(',') + '\n'
    })

    // Download the CSV file
    downloadCSV(csvContent, `${category}_export.csv`)
  }

  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  function resetToDefaults() {
    console.log('resetToDefaults called')
    // Reload from original CSV files
    window.location.reload()
  }
  
  function exportAllAsCSV() {
    console.log('exportAllAsCSV called')
    const categories = [
      'crops', 'adventures', 'mining', 'helpers', 'tools', 'storage',
      'weapons', 'armorBase', 'armorPotential', 'armorEffects', 'routeLootTable', 'enemyTypesDamage', 'routeWaveComposition',
      'helperRoles', 'towerLevels', 'vendors', 'bossMaterials',
      'farmCleanups', 'farmStages', 'farmProjects', 'gnomeRoles', 'xpProgression',
      'townBlacksmith', 'townAgronomist', 'townCarpenter', 'townLandSteward', 
      'townMaterialTrader', 'townSkillsTrainer', 'forgeCrafting', 'materialRefinement', 'phaseTransitions'
    ]
    
    categories.forEach(category => {
      const dataRef = getDataRef(category)
      if (dataRef && dataRef.value && Object.keys(dataRef.value).length > 0) {
        exportCategoryAsCSV(category)
      }
    })
  }
  
  function importFromCSV(category, file) {
    console.log('importFromCSV called:', category, file)
    // TODO: Implement CSV import functionality
    // This would require parsing the CSV and updating the data
    console.log('CSV import not yet implemented')
  }
  
  function saveConfigurationSet(name) {
    console.log('saveConfigurationSet called:', name)
    // Save all current data as a named configuration
    const configData = {
      name,
      timestamp: new Date().toISOString(),
      data: {
        crops: crops.value,
        adventures: adventures.value,
        // ... include all other data
      }
    }
    
    // Download as JSON
    const jsonContent = JSON.stringify(configData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `config_${name}_${Date.now()}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
    adventures,
    mining,
    helpers,
    tools,
    storage,
    weapons,
    armorBase,
    armorPotential,
    armorEffects,
    routeLootTable,
    enemyTypesDamage,
    routeWaveComposition,
    helperRoles,
    towerLevels,
    vendors,
    bossMaterials,
    farmCleanups,
    farmStages,
    farmProjects,
    gnomeRoles,
    xpProgression,
    townBlacksmith,
    townAgronomist,
    townCarpenter,
    townLandSteward,
    townMaterialTrader,
    townSkillsTrainer,
    forgeCrafting,
    materialRefinement,
    phaseTransitions,
    unifiedNodes,
    isLoaded,
    validationErrors,
    lastUpdated,
    hasUnsavedChanges,
    
    // Computed
    getCropsBySeedLevel,
    getWeaponsByType,
    
    // Actions
    loadGameValues,
    validateGameValues,
    getCrop,
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
    saveCategoryToServer,
    exportItemsAsCSV,
    exportCategoryAsCSV,
    downloadCSV,
    resetToDefaults,
    exportAllAsCSV,
    importFromCSV,
    saveConfigurationSet,
    getDataRef,
    updateUpgrade,
    deleteUpgrade,
    exportUpgradeTree
  }
})
