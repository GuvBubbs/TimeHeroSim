import Papa from 'papaparse'

/**
 * CSV Import Utilities
 * 
 * Handles loading and parsing game data from CSV files.
 * All imported values are treated as immutable game constants.
 */

// Parse CSV data with proper type conversion
function parseCSVData(csvText, config = {}) {
  const defaultConfig = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    comments: '#',
    transformHeader: (header) => header.trim(),
    transform: (value) => {
      if (typeof value === 'string') {
        value = value.trim()
        // Convert empty strings to null
        if (value === '') return null
      }
      return value
    }
  }
  
  const result = Papa.parse(csvText, { ...defaultConfig, ...config })
  
  if (result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors)
  }
  
  return result.data
}

// Load CSV file from public directory
async function loadCSVFile(filename) {
  try {
    console.log(`🔄 Attempting to load CSV file: ${filename}`)
    const response = await fetch(`/data/${filename}`)
    console.log(`📄 Response for ${filename}:`, response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`)
    }
    const csvText = await response.text()
    console.log(`📝 CSV content for ${filename} (first 200 chars):`, csvText.substring(0, 200))
    
    const parsedData = parseCSVData(csvText)
    console.log(`✅ Parsed ${filename} successfully. Row count:`, parsedData.length)
    console.log(`🔍 First parsed row:`, parsedData[0])
    
    return parsedData
  } catch (error) {
    console.error(`❌ Error loading CSV file ${filename}:`, error)
    throw error
  }
}

// Convert CSV array to object keyed by ID
function arrayToKeyedObject(array, keyField = 'id') {
  const result = {}
  array.forEach((item, index) => {
    const key = item[keyField] || item.name?.toLowerCase().replace(/\s+/g, '_') || `item_${index}`
    result[key] = item
  })
  return result
}

// Validate required fields in data
function validateRequiredFields(data, requiredFields, dataType) {
  const errors = []
  
  data.forEach((item, index) => {
    requiredFields.forEach(field => {
      if (item[field] === null || item[field] === undefined) {
        errors.push(`Missing required field '${field}' in ${dataType} at index ${index}`)
      }
    })
  })
  
  return errors
}

// Process crops data specifically
function processCropsData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['name', 'tier', 'energy', 'growthTime', 'seedLevel'], 'crops')
  
  if (validationErrors.length > 0) {
    throw new Error(`Crops data validation failed: ${validationErrors.join(', ')}`)
  }
  
  // Convert to keyed object and add computed properties
  const cropsObj = {}
  rawData.forEach(crop => {
    const key = crop.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    cropsObj[key] = {
      ...crop,
      id: key,
      // Parse numeric fields
      seedLevel: parseInt(crop.seedLevel) || 0,
      stages: parseInt(crop.stages) || parseInt(crop.growthStages) || 1,
      growthTime: parseFloat(crop.growthTime) || 1,
      energy: parseFloat(crop.energy) || 0,
      seedCost: parseInt(crop.seedCost) || 0,
      waterConsumption: parseInt(crop.waterConsumption) || 1,
      // Add computed properties
      energyPerMinute: parseFloat(crop.energy) / parseFloat(crop.growthTime),
      energyEfficiency: parseFloat(crop.energy) / (parseFloat(crop.growthTime) + (parseInt(crop.seedCost) || 0)),
      stageMultiplier: (parseInt(crop.stages) || parseInt(crop.growthStages) || 1) === 3 ? 1.0 : 
                      (parseInt(crop.stages) || parseInt(crop.growthStages) || 1) === 4 ? 1.5 : 2.0
    }
  })
  
  return Object.freeze(cropsObj)
}

// Process adventures data specifically  
function processAdventuresData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'shortEnergy', 'shortDuration', 'shortGold'], 'adventures')
  
  if (validationErrors.length > 0) {
    throw new Error(`Adventures data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const adventuresObj = {}
  rawData.forEach(adventure => {
    adventuresObj[adventure.id] = {
      ...adventure,
      // Add computed efficiency ratios
      shortEfficiency: adventure.goldReward / (adventure.shortEnergy || 1),
      mediumEfficiency: adventure.goldReward / (adventure.mediumEnergy || 1),
      longEfficiency: adventure.goldReward / (adventure.longEnergy || 1)
    }
  })
  
  return Object.freeze(adventuresObj)
}

// Process upgrades data specifically
function processUpgradesData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'category', 'goldCost', 'vendor'], 'upgrades')
  
  if (validationErrors.length > 0) {
    throw new Error(`Upgrades data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const upgradesObj = {}
  rawData.forEach(upgrade => {
    // Create structured cost object
    const cost = {
      gold: upgrade.goldCost || 0,
      energy: upgrade.energyCost || 0,
      stone: upgrade.stoneCost || 0,
      copper: upgrade.copperCost || 0,
      iron: upgrade.ironCost || 0,
      silver: upgrade.silverCost || 0,
      crystal: upgrade.crystalCost || 0,
      mythril: upgrade.mythrilCost || 0
    }
    
    // Calculate total cost for sorting/analysis
    const materialCost = cost.stone + cost.copper + cost.iron + cost.silver + cost.crystal + cost.mythril
    
    upgradesObj[upgrade.id] = {
      ...upgrade,
      cost, // Add structured cost object for validation
      totalMaterialCost: materialCost,
      totalCost: cost.gold + cost.energy + materialCost
    }
  })
  
  return Object.freeze(upgradesObj)
}

// Process mining data specifically
function processMiningData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['depth', 'name', 'energyDrain'], 'mining')
  
  if (validationErrors.length > 0) {
    throw new Error(`Mining data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const miningObj = {}
  rawData.forEach(level => {
    miningObj[level.depth] = {
      ...level,
      // Add computed properties if needed
      ...(level.energyDrain && { efficiencyRatio: (level.materials ? level.materials.length : 1) / level.energyDrain })
    }
  })
  
  return Object.freeze(miningObj)
}

// Process helpers data specifically
function processHelpersData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'rescueRoute', 'baseHousing'], 'helpers')
  
  if (validationErrors.length > 0) {
    throw new Error(`Helpers data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const helpersObj = {}
  rawData.forEach(helper => {
    helpersObj[helper.id] = {
      ...helper,
      // Add computed properties
      efficiencyGain: helper.maxEfficiency - helper.baseEfficiency
    }
  })
  
  return Object.freeze(helpersObj)
}

// Process combat data specifically
function processCombatData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'type', 'category'], 'combat')
  
  if (validationErrors.length > 0) {
    throw new Error(`Combat data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const combatObj = {}
  rawData.forEach(item => {
    // Create structured cost object
    const cost = {
      gold: item.goldCost || 0,
      energy: item.energyCost || 0,
      stone: item.stoneCost || 0,
      copper: item.copperCost || 0,
      iron: item.ironCost || 0,
      silver: item.silverCost || 0,
      crystal: item.crystalCost || 0,
      mythril: item.mythrilCost || 0
    }
    
    combatObj[item.id] = {
      ...item,
      cost // Add structured cost object
    }
  })
  
  return Object.freeze(combatObj)
}

// Process weapons data specifically
function processWeaponsData(rawData) {
  const weaponsObj = {}
  rawData.forEach(weapon => {
    weaponsObj[weapon.id] = {
      ...weapon,
      // Parse numeric fields
      level: parseInt(weapon.level) || 1,
      goldCost: parseInt(weapon.goldCost) || 0,
      energyCost: parseInt(weapon.energyCost) || 0,
      damage: parseInt(weapon.damage) || 0,
      attackSpeed: parseFloat(weapon.attackSpeed) || 1.0
    }
  })
  return Object.freeze(weaponsObj)
}

// Process armor data specifically  
function processArmorData(rawData) {
  const armorObj = {}
  rawData.forEach(armor => {
    armorObj[armor.id] = {
      ...armor,
      // Parse numeric fields
      baseDefense: parseInt(armor.baseDefense) || 0,
      effectValue: parseInt(armor.effectValue) || 0,
      dropWeight: parseFloat(armor.dropWeight) || 0
    }
  })
  return Object.freeze(armorObj)
}

// Process tools data specifically
function processToolsData(rawData) {
  const toolsObj = {}
  rawData.forEach(tool => {
    toolsObj[tool.id] = {
      ...tool,
      // Parse numeric fields
      goldCost: parseInt(tool.goldCost) || 0,
      energyCost: parseInt(tool.energyCost) || 0,
      craftTime: parseInt(tool.craftTime) || 0
    }
  })
  return Object.freeze(toolsObj)
}

// Process helper roles data specifically
function processHelperRolesData(rawData) {
  const rolesObj = {}
  rawData.forEach(role => {
    rolesObj[role.role] = {
      ...role,
      // Parse numeric fields
      baseEffect: parseInt(role.baseEffect) || 0,
      effectPerLevel: parseFloat(role.effectPerLevel) || 0,
      maxEffect: parseInt(role.maxEffect) || 0
    }
  })
  return Object.freeze(rolesObj)
}

// Process tower levels data specifically
function processTowerLevelsData(rawData) {
  const levelsObj = {}
  rawData.forEach(level => {
    levelsObj[level.reachLevel] = {
      ...level,
      // Parse numeric fields
      reachLevel: parseInt(level.reachLevel) || 1,
      seedLevel: parseInt(level.seedLevel) || 0,
      goldCost: parseInt(level.goldCost) || 0,
      energyCost: parseInt(level.energyCost) || 0,
      catchRate: parseFloat(level.catchRate) || 1.0
    }
  })
  return Object.freeze(levelsObj)
}

// Process vendors data specifically
function processVendorsData(rawData) {
  const vendorsObj = {}
  rawData.forEach(vendor => {
    vendorsObj[vendor.id] = {
      ...vendor
    }
  })
  return Object.freeze(vendorsObj)
}

// Process cleanups data specifically
function processCleanupsData(rawData) {
  const cleanupsObj = {}
  rawData.forEach(cleanup => {
    cleanupsObj[cleanup.id] = {
      ...cleanup,
      // Parse numeric fields
      stage: parseInt(cleanup.stage) || 1,
      plotsAdded: parseInt(cleanup.plotsAdded) || 0,
      totalPlots: parseInt(cleanup.totalPlots) || 0,
      energyCost: parseInt(cleanup.energyCost) || 0,
      cooldown: parseInt(cleanup.cooldown) || 0,
      repeatable: cleanup.repeatable === 'true'
    }
  })
  return Object.freeze(cleanupsObj)
}

// Process boss materials data specifically
function processBossMaterialsData(rawData) {
  const materialsObj = {}
  rawData.forEach(material => {
    materialsObj[material.id] = {
      ...material,
      // Parse numeric fields
      dropChance: parseFloat(material.dropChance) || 0
    }
  })
  return Object.freeze(materialsObj)
}

// Main function to load all game data
export async function loadAllGameData() {
  try {
    console.log('🚀 Loading game data from CSV files...')
    
    // Load all CSV files in parallel
    const [
      cropsRaw, 
      adventuresRaw, 
      upgradesRaw, 
      miningRaw, 
      helpersRaw, 
      combatRaw,
      weaponsRaw,
      armorRaw,
      toolsRaw,
      helperRolesRaw,
      towerLevelsRaw,
      vendorsRaw,
      cleanupsRaw,
      bossMaterialsRaw
    ] = await Promise.all([
      loadCSVFile('crops.csv'),
      loadCSVFile('adventures.csv'),
      loadCSVFile('upgrades.csv'),
      loadCSVFile('mining.csv').catch(() => []),
      loadCSVFile('helpers.csv').catch(() => []),
      loadCSVFile('combat.csv').catch(() => []),
      loadCSVFile('weapons.csv').catch(() => []),
      loadCSVFile('armor.csv').catch(() => []),
      loadCSVFile('tools.csv').catch(() => []),
      loadCSVFile('helper_roles.csv').catch(() => []),
      loadCSVFile('tower_levels.csv').catch(() => []),
      loadCSVFile('vendors.csv').catch(() => []),
      loadCSVFile('cleanups.csv').catch(() => []),
      loadCSVFile('boss_materials.csv').catch(() => [])
    ])
    
    console.log('📊 Raw data loaded:', {
      crops: cropsRaw.length,
      adventures: adventuresRaw.length,
      upgrades: upgradesRaw.length,
      mining: miningRaw.length,
      helpers: helpersRaw.length,
      combat: combatRaw.length,
      weapons: weaponsRaw.length,
      armor: armorRaw.length,
      tools: toolsRaw.length,
      helperRoles: helperRolesRaw.length,
      towerLevels: towerLevelsRaw.length,
      vendors: vendorsRaw.length,
      cleanups: cleanupsRaw.length,
      bossMaterials: bossMaterialsRaw.length
    })
    
    // Process each data type
    const crops = processCropsData(cropsRaw)
    const adventures = processAdventuresData(adventuresRaw)
    const upgrades = processUpgradesData(upgradesRaw)
    const mining = miningRaw.length > 0 ? processMiningData(miningRaw) : Object.freeze({})
    const helpers = helpersRaw.length > 0 ? processHelpersData(helpersRaw) : Object.freeze({})
    const combat = combatRaw.length > 0 ? processCombatData(combatRaw) : Object.freeze({})
    const weapons = weaponsRaw.length > 0 ? processWeaponsData(weaponsRaw) : Object.freeze({})
    const armor = armorRaw.length > 0 ? processArmorData(armorRaw) : Object.freeze({})
    const tools = toolsRaw.length > 0 ? processToolsData(toolsRaw) : Object.freeze({})
    const helperRoles = helperRolesRaw.length > 0 ? processHelperRolesData(helperRolesRaw) : Object.freeze({})
    const towerLevels = towerLevelsRaw.length > 0 ? processTowerLevelsData(towerLevelsRaw) : Object.freeze({})
    const vendors = vendorsRaw.length > 0 ? processVendorsData(vendorsRaw) : Object.freeze({})
    const cleanups = cleanupsRaw.length > 0 ? processCleanupsData(cleanupsRaw) : Object.freeze({})
    const bossMaterials = bossMaterialsRaw.length > 0 ? processBossMaterialsData(bossMaterialsRaw) : Object.freeze({})
    
    console.log('🔧 Processed data:', {
      crops: Object.keys(crops).length,
      adventures: Object.keys(adventures).length,
      upgrades: Object.keys(upgrades).length,
      mining: Object.keys(mining).length,
      helpers: Object.keys(helpers).length,
      combat: Object.keys(combat).length,
      weapons: Object.keys(weapons).length,
      armor: Object.keys(armor).length,
      tools: Object.keys(tools).length,
      helperRoles: Object.keys(helperRoles).length,
      towerLevels: Object.keys(towerLevels).length,
      vendors: Object.keys(vendors).length,
      cleanups: Object.keys(cleanups).length,
      bossMaterials: Object.keys(bossMaterials).length
    })
    
    // Create the final game data object
    const gameData = Object.freeze({
      crops,
      adventures,
      upgrades,
      mining,
      helpers,
      combat,
      weapons,
      armor,
      tools,
      helperRoles,
      towerLevels,
      vendors,
      cleanups,
      bossMaterials,
      storage: Object.freeze({})
    })
    
    console.log('✅ Game data loaded successfully:', {
      crops: Object.keys(crops).length,
      adventures: Object.keys(adventures).length,
      upgrades: Object.keys(upgrades).length,
      mining: Object.keys(mining).length,
      helpers: Object.keys(helpers).length,
      combat: Object.keys(combat).length,
      weapons: Object.keys(weapons).length,
      armor: Object.keys(armor).length,
      tools: Object.keys(tools).length,
      helperRoles: Object.keys(helperRoles).length,
      towerLevels: Object.keys(towerLevels).length,
      vendors: Object.keys(vendors).length,
      cleanups: Object.keys(cleanups).length,
      bossMaterials: Object.keys(bossMaterials).length
    })
    
    console.log('🔍 Sample crop data:', Object.values(crops)[0])
    console.log('🔍 Sample adventure data:', Object.values(adventures)[0])
    console.log('🔍 Sample upgrade data:', Object.values(upgrades)[0])
    
    return gameData
    
  } catch (error) {
    console.error('❌ Failed to load game data:', error)
    throw error
  }
}

// Export individual functions for testing
export {
  parseCSVData,
  loadCSVFile,
  arrayToKeyedObject,
  validateRequiredFields,
  processCropsData,
  processAdventuresData,
  processUpgradesData,
  processMiningData,
  processHelpersData,
  processCombatData
}
