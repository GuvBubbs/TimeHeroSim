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
  const validationErrors = validateRequiredFields(rawData, ['name', 'tier', 'energy', 'growthTime'], 'crops')
  
  if (validationErrors.length > 0) {
    throw new Error(`Crops data validation failed: ${validationErrors.join(', ')}`)
  }
  
  // Convert to keyed object and add computed properties
  const cropsObj = {}
  rawData.forEach(crop => {
    const key = crop.name.toLowerCase().replace(/\s+/g, '_')
    cropsObj[key] = {
      ...crop,
      id: key,
      // Add computed properties
      energyPerMinute: crop.energy / crop.growthTime,
      stageMultiplier: crop.growthStages === 3 ? 1.0 : crop.growthStages === 4 ? 1.5 : 2.0
    }
  })
  
  return Object.freeze(cropsObj)
}

// Process adventures data specifically  
function processAdventuresData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'unlockDay'], 'adventures')
  
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
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'category', 'goldCost'], 'upgrades')
  
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
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'depth', 'energyDrain'], 'mining')
  
  if (validationErrors.length > 0) {
    throw new Error(`Mining data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const miningObj = {}
  rawData.forEach(level => {
    miningObj[level.id] = {
      ...level,
      // Add computed properties
      efficiencyRatio: level.commonAmount / level.energyDrain
    }
  })
  
  return Object.freeze(miningObj)
}

// Process helpers data specifically
function processHelpersData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'type', 'basePlotCapacity'], 'helpers')
  
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

// Main function to load all game data
export async function loadAllGameData() {
  try {
    console.log('🚀 Loading game data from CSV files...')
    
    // Load all CSV files in parallel
    const [cropsRaw, adventuresRaw, upgradesRaw, miningRaw, helpersRaw, combatRaw] = await Promise.all([
      loadCSVFile('crops.csv'),
      loadCSVFile('adventures.csv'),
      loadCSVFile('upgrades.csv'),
      loadCSVFile('mining.csv').catch(() => []),
      loadCSVFile('helpers.csv').catch(() => []),
      loadCSVFile('combat.csv').catch(() => [])
    ])
    
    console.log('📊 Raw data loaded:', {
      crops: cropsRaw.length,
      adventures: adventuresRaw.length,
      upgrades: upgradesRaw.length,
      mining: miningRaw.length,
      helpers: helpersRaw.length,
      combat: combatRaw.length
    })
    
    // Process each data type
    const crops = processCropsData(cropsRaw)
    const adventures = processAdventuresData(adventuresRaw)
    const upgrades = processUpgradesData(upgradesRaw)
    const mining = miningRaw.length > 0 ? processMiningData(miningRaw) : Object.freeze({})
    const helpers = helpersRaw.length > 0 ? processHelpersData(helpersRaw) : Object.freeze({})
    const combat = combatRaw.length > 0 ? processCombatData(combatRaw) : Object.freeze({})
    
    console.log('🔧 Processed data:', {
      crops: Object.keys(crops).length,
      adventures: Object.keys(adventures).length,
      upgrades: Object.keys(upgrades).length,
      mining: Object.keys(mining).length,
      helpers: Object.keys(helpers).length,
      combat: Object.keys(combat).length
    })
    
    // Create the final game data object
    const gameData = Object.freeze({
      crops,
      adventures,
      upgrades,
      mining,
      helpers,
      combat,
      tools: Object.freeze({}),
      storage: Object.freeze({})
    })
    
    console.log('✅ Game data loaded successfully:', {
      crops: Object.keys(crops).length,
      adventures: Object.keys(adventures).length,
      upgrades: Object.keys(upgrades).length,
      mining: Object.keys(mining).length,
      helpers: Object.keys(helpers).length,
      combat: Object.keys(combat).length
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
