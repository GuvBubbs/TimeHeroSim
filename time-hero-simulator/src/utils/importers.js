import Papa from 'papaparse'
import { processAllNodes } from './nodeClassification.js'

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
    console.log(`🔍 Parsed ${filename}:`, {
      rows: parsedData.length,
      headers: parsedData.length > 0 ? Object.keys(parsedData[0]) : [],
      sampleRow: parsedData[0]
    })
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

// Generic data processor for simple CSV data
function processGenericData(rawData, keyField = 'id') {
  if (!rawData || rawData.length === 0) {
    return Object.freeze({})
  }
  
  const result = {}
  rawData.forEach((item, index) => {
    // Add an index field to preserve CSV order
    const enhancedItem = {
      ...item,
      _csvIndex: index
    }
    
    const key = item[keyField] || item.name?.toLowerCase().replace(/\s+/g, '_') || `item_${index}`
    result[key] = enhancedItem
  })
  
  return Object.freeze(result)
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
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'tier', 'seed_level', 'growth_time_min', 'energy_per_harvest'], 'crops')
  
  if (validationErrors.length > 0) {
    throw new Error(`Crops data validation failed: ${validationErrors.join(', ')}`)
  }
  
  // Convert to keyed object and add computed properties
  const cropsObj = {}
  rawData.forEach((crop, index) => {
    cropsObj[crop.id] = {
      ...crop,
      _csvIndex: index // Preserve original CSV order
    }
  })
  
  return Object.freeze(cropsObj)
}

// Process adventures data specifically  
function processAdventuresData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'route', 'length', 'energy_cost'], 'adventures')
  
  if (validationErrors.length > 0) {
    throw new Error(`Adventures data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const adventuresObj = {}
  rawData.forEach((adventure, index) => {
    adventuresObj[adventure.id] = {
      ...adventure,
      _csvIndex: index // Preserve original CSV order
    }
  })
  
  return Object.freeze(adventuresObj)
}

// Process upgrades data specifically
function processUpgradesData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'vendor', 'category'], 'upgrades')
  
  if (validationErrors.length > 0) {
    throw new Error(`Upgrades data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const upgradesObj = {}
  rawData.forEach((upgrade, index) => {
    upgradesObj[upgrade.id] = {
      ...upgrade,
      _csvIndex: index // Preserve original CSV order
    }
  })
  
  return Object.freeze(upgradesObj)
}

// Process mining data specifically
function processMiningData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'depth_range', 'base_energy_per_min'], 'mining')
  
  if (validationErrors.length > 0) {
    throw new Error(`Mining data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const miningObj = {}
  rawData.forEach((level, index) => {
    miningObj[level.id] = {
      ...level,
      _csvIndex: index // Preserve original CSV order
    }
  })
  
  return Object.freeze(miningObj)
}

// Process helpers data specifically
function processHelpersData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'prerequisite', 'role_options'], 'helpers')
  
  if (validationErrors.length > 0) {
    throw new Error(`Helpers data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const helpersObj = {}
  rawData.forEach((helper, index) => {
    helpersObj[helper.id] = {
      ...helper,
      _csvIndex: index // Preserve original CSV order
    }
  })
  
  return Object.freeze(helpersObj)
}

// Process combat data specifically
function processCombatData(rawData) {
  // Use generic processing since combat.csv structure may vary
  return processGenericData(rawData, 'id')
}

// Process weapons data specifically
function processWeaponsData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'type', 'level'], 'weapons')
  
  if (validationErrors.length > 0) {
    throw new Error(`Weapons data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const weaponsObj = {}
  rawData.forEach((weapon, index) => {
    weaponsObj[weapon.id] = {
      ...weapon,
      _csvIndex: index // Preserve original CSV order
    }
  })
  return Object.freeze(weaponsObj)
}

// Process tools data specifically
function processToolsData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'tier', 'category'], 'tools')
  
  if (validationErrors.length > 0) {
    throw new Error(`Tools data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const toolsObj = {}
  rawData.forEach((tool, index) => {
    toolsObj[tool.id] = {
      ...tool,
      _csvIndex: index // Preserve original CSV order
    }
  })
  return Object.freeze(toolsObj)
}

// Process helper roles data specifically
function processHelperRolesData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['role', 'name', 'category'], 'helperRoles')
  
  if (validationErrors.length > 0) {
    throw new Error(`Helper roles data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const rolesObj = {}
  rawData.forEach((role, index) => {
    rolesObj[role.role] = {
      ...role,
      _csvIndex: index // Preserve original CSV order
    }
  })
  return Object.freeze(rolesObj)
}

// Process tower levels data specifically
function processTowerLevelsData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['reachLevel', 'windLevel', 'seedLevel'], 'towerLevels')
  
  if (validationErrors.length > 0) {
    throw new Error(`Tower levels data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const levelsObj = {}
  rawData.forEach((level, index) => {
    levelsObj[level.reachLevel] = {
      ...level,
      _csvIndex: index // Preserve original CSV order
    }
  })
  return Object.freeze(levelsObj)
}

// Process vendors data specifically
function processVendorsData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'shopType'], 'vendors')
  
  if (validationErrors.length > 0) {
    throw new Error(`Vendors data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const vendorsObj = {}
  rawData.forEach((vendor, index) => {
    vendorsObj[vendor.id] = {
      ...vendor,
      _csvIndex: index // Preserve original CSV order
    }
  })
  return Object.freeze(vendorsObj)
}

// Process cleanups data specifically
// Process boss materials data specifically
function processBossMaterialsData(rawData) {
  const validationErrors = validateRequiredFields(rawData, ['id', 'name', 'dropFrom'], 'bossMaterials')
  
  if (validationErrors.length > 0) {
    throw new Error(`Boss materials data validation failed: ${validationErrors.join(', ')}`)
  }
  
  const materialsObj = {}
  rawData.forEach((material, index) => {
    materialsObj[material.id] = {
      ...material,
      _csvIndex: index // Preserve original CSV order
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
      armorBaseRaw,
      armorPotentialRaw,
      armorEffectsRaw,
      routeLootTableRaw,
      enemyTypesDamageRaw,
      routeWaveCompositionRaw,
      toolsRaw,
      helperRolesRaw,
      towerLevelsRaw,
      vendorsRaw,
      bossMaterialsRaw,
      // Farm system data
      farmCleanupsRaw,
      farmStagesRaw,
      farmProjectsRaw,
      gnomeRolesRaw,
      // Progression data
      xpProgressionRaw,
      // Town vendor data
      townBlacksmithRaw,
      townAgronomistRaw,
      townCarpenterRaw,
      townLandStewardRaw,
      townMaterialTraderRaw,
      townSkillsTrainerRaw,
      // Crafting data
      forgeCraftingRaw,
      materialRefinementRaw,
      // Game flow data
      phaseTransitionsRaw
    ] = await Promise.all([
      loadCSVFile('crops.csv'),
      loadCSVFile('adventures.csv'),
      loadCSVFile('upgrades.csv'),
      loadCSVFile('mining.csv').catch(() => []),
      loadCSVFile('helpers.csv').catch(() => []),
      loadCSVFile('combat.csv').catch(() => []),
      loadCSVFile('weapons.csv').catch(() => []),
      loadCSVFile('armor_base.csv').catch(() => []),
      loadCSVFile('armor_potential.csv').catch(() => []),
      loadCSVFile('armor_effects.csv').catch(() => []),
      loadCSVFile('route_loot_table.csv').catch(() => []),
      loadCSVFile('enemy_types_damage.csv').catch(() => []),
      loadCSVFile('route_wave_composition.csv').catch(() => []),
      loadCSVFile('tools.csv').catch(() => []),
      loadCSVFile('helper_roles.csv').catch(() => []),
      loadCSVFile('tower_levels.csv').catch(() => []),
      loadCSVFile('vendors.csv').catch(() => []),
      loadCSVFile('boss_materials.csv').catch(() => []),
      // Farm system files
      loadCSVFile('farm_cleanups.csv').catch(() => []),
      loadCSVFile('farm_stages.csv').catch(() => []),
      loadCSVFile('farm_projects.csv').catch(() => []),
      loadCSVFile('gnome_roles.csv').catch(() => []),
      // Progression files
      loadCSVFile('xp_progression.csv').catch(() => []),
      // Town vendor files
      loadCSVFile('town_blacksmith.csv').catch(() => []),
      loadCSVFile('town_agronomist.csv').catch(() => []),
      loadCSVFile('town_carpenter.csv').catch(() => []),
      loadCSVFile('town_land_steward.csv').catch(() => []),
      loadCSVFile('town_material_trader.csv').catch(() => []),
      loadCSVFile('town_skills_trainer.csv').catch(() => []),
      // Crafting files
      loadCSVFile('forge_crafting.csv').catch(() => []),
      loadCSVFile('material_refinement.csv').catch(() => []),
      // Game flow files
      loadCSVFile('phase_transitions.csv').catch(() => [])
    ])
    
    console.log('📊 Raw data loaded:', {
      crops: cropsRaw.length,
      adventures: adventuresRaw.length,
      upgrades: upgradesRaw.length,
      mining: miningRaw.length,
      helpers: helpersRaw.length,
      combat: combatRaw.length,
      weapons: weaponsRaw.length,
      armorBase: armorBaseRaw.length,
      armorPotential: armorPotentialRaw.length,
      armorEffects: armorEffectsRaw.length,
      routeLootTable: routeLootTableRaw.length,
      enemyTypesDamage: enemyTypesDamageRaw.length,
      routeWaveComposition: routeWaveCompositionRaw.length,
      tools: toolsRaw.length,
      helperRoles: helperRolesRaw.length,
      towerLevels: towerLevelsRaw.length,
      vendors: vendorsRaw.length,
      bossMaterials: bossMaterialsRaw.length,
      farmCleanups: farmCleanupsRaw.length,
      farmStages: farmStagesRaw.length,
      farmProjects: farmProjectsRaw.length,
      gnomeRoles: gnomeRolesRaw.length,
      xpProgression: xpProgressionRaw.length,
      townBlacksmith: townBlacksmithRaw.length,
      townAgronomist: townAgronomistRaw.length,
      townCarpenter: townCarpenterRaw.length,
      townLandSteward: townLandStewardRaw.length,
      townMaterialTrader: townMaterialTraderRaw.length,
      townSkillsTrainer: townSkillsTrainerRaw.length,
      forgeCrafting: forgeCraftingRaw.length,
      materialRefinement: materialRefinementRaw.length,
      phaseTransitions: phaseTransitionsRaw.length
    })
    
    // Process each data type
    const crops = processCropsData(cropsRaw)
    const adventures = processAdventuresData(adventuresRaw)
    const upgrades = processUpgradesData(upgradesRaw)
    const mining = miningRaw.length > 0 ? processMiningData(miningRaw) : Object.freeze({})
    const helpers = helpersRaw.length > 0 ? processHelpersData(helpersRaw) : Object.freeze({})
    const combat = combatRaw.length > 0 ? processCombatData(combatRaw) : Object.freeze({})
    const weapons = weaponsRaw.length > 0 ? processWeaponsData(weaponsRaw) : Object.freeze({})
    const armorBase = armorBaseRaw.length > 0 ? processGenericData(armorBaseRaw, 'defense_rating') : Object.freeze({})
    const armorPotential = armorPotentialRaw.length > 0 ? processGenericData(armorPotentialRaw, 'upgrade_potential') : Object.freeze({})
    const armorEffects = armorEffectsRaw.length > 0 ? processGenericData(armorEffectsRaw, 'effect') : Object.freeze({})
    const routeLootTable = routeLootTableRaw.length > 0 ? processGenericData(routeLootTableRaw, 'route') : Object.freeze({})
    const enemyTypesDamage = enemyTypesDamageRaw.length > 0 ? processGenericData(enemyTypesDamageRaw, 'enemy_type') : Object.freeze({})
    const routeWaveComposition = routeWaveCompositionRaw.length > 0 ? processGenericData(routeWaveCompositionRaw, 'route') : Object.freeze({})
    const tools = toolsRaw.length > 0 ? processToolsData(toolsRaw) : Object.freeze({})
    const helperRoles = helperRolesRaw.length > 0 ? processHelperRolesData(helperRolesRaw) : Object.freeze({})
    const towerLevels = towerLevelsRaw.length > 0 ? processTowerLevelsData(towerLevelsRaw) : Object.freeze({})
    const vendors = vendorsRaw.length > 0 ? processVendorsData(vendorsRaw) : Object.freeze({})
    const bossMaterials = bossMaterialsRaw.length > 0 ? processBossMaterialsData(bossMaterialsRaw) : Object.freeze({})
    
    // Process new data types using generic processor
    const farmCleanups = farmCleanupsRaw.length > 0 ? processGenericData(farmCleanupsRaw, 'id') : Object.freeze({})
    const farmStages = farmStagesRaw.length > 0 ? processGenericData(farmStagesRaw, 'stage') : Object.freeze({})
    const farmProjects = farmProjectsRaw.length > 0 ? processGenericData(farmProjectsRaw, 'id') : Object.freeze({})
    const gnomeRoles = gnomeRolesRaw.length > 0 ? processGenericData(gnomeRolesRaw, 'role') : Object.freeze({})
    const xpProgression = xpProgressionRaw.length > 0 ? processGenericData(xpProgressionRaw, 'level') : Object.freeze({})
    const townBlacksmith = townBlacksmithRaw.length > 0 ? processGenericData(townBlacksmithRaw, 'id') : Object.freeze({})
    const townAgronomist = townAgronomistRaw.length > 0 ? processGenericData(townAgronomistRaw, 'id') : Object.freeze({})
    const townCarpenter = townCarpenterRaw.length > 0 ? processGenericData(townCarpenterRaw, 'id') : Object.freeze({})
    const townLandSteward = townLandStewardRaw.length > 0 ? processGenericData(townLandStewardRaw, 'id') : Object.freeze({})
    const townMaterialTrader = townMaterialTraderRaw.length > 0 ? processGenericData(townMaterialTraderRaw, 'id') : Object.freeze({})
    const townSkillsTrainer = townSkillsTrainerRaw.length > 0 ? processGenericData(townSkillsTrainerRaw, 'id') : Object.freeze({})
    const forgeCrafting = forgeCraftingRaw.length > 0 ? processGenericData(forgeCraftingRaw, 'id') : Object.freeze({})
    const materialRefinement = materialRefinementRaw.length > 0 ? processGenericData(materialRefinementRaw, 'material') : Object.freeze({})
    const phaseTransitions = phaseTransitionsRaw.length > 0 ? processGenericData(phaseTransitionsRaw, 'phase') : Object.freeze({})
    
    console.log('🔧 Processed data:', {
      crops: Object.keys(crops).length,
      adventures: Object.keys(adventures).length,
      upgrades: Object.keys(upgrades).length,
      mining: Object.keys(mining).length,
      helpers: Object.keys(helpers).length,
      combat: Object.keys(combat).length,
      weapons: Object.keys(weapons).length,
      armorBase: Object.keys(armorBase).length,
      armorPotential: Object.keys(armorPotential).length,
      armorEffects: Object.keys(armorEffects).length,
      routeLootTable: Object.keys(routeLootTable).length,
      enemyTypesDamage: Object.keys(enemyTypesDamage).length,
      routeWaveComposition: Object.keys(routeWaveComposition).length,
      tools: Object.keys(tools).length,
      helperRoles: Object.keys(helperRoles).length,
      towerLevels: Object.keys(towerLevels).length,
      vendors: Object.keys(vendors).length,
      bossMaterials: Object.keys(bossMaterials).length,
      farmCleanups: Object.keys(farmCleanups).length,
      farmStages: Object.keys(farmStages).length,
      farmProjects: Object.keys(farmProjects).length,
      gnomeRoles: Object.keys(gnomeRoles).length,
      xpProgression: Object.keys(xpProgression).length,
      townBlacksmith: Object.keys(townBlacksmith).length,
      townAgronomist: Object.keys(townAgronomist).length,
      townCarpenter: Object.keys(townCarpenter).length,
      townLandSteward: Object.keys(townLandSteward).length,
      townMaterialTrader: Object.keys(townMaterialTrader).length,
      townSkillsTrainer: Object.keys(townSkillsTrainer).length,
      forgeCrafting: Object.keys(forgeCrafting).length,
      materialRefinement: Object.keys(materialRefinement).length,
      phaseTransitions: Object.keys(phaseTransitions).length
    })
    
    // Create unified nodes for upgrade tree
    const allRawCsvData = {
      crops: cropsRaw,
      adventures: adventuresRaw,
      mining: miningRaw,
      weapons: weaponsRaw,
      towerLevels: towerLevelsRaw,
      vendors: vendorsRaw,
      bossMaterials: bossMaterialsRaw,
      farmStages: farmStagesRaw,
      farmProjects: farmProjectsRaw,
      xpProgression: xpProgressionRaw,
      townBlacksmith: townBlacksmithRaw,
      townAgronomist: townAgronomistRaw,
      townCarpenter: townCarpenterRaw,
      townLandSteward: townLandStewardRaw,
      townMaterialTrader: townMaterialTraderRaw,
      townSkillsTrainer: townSkillsTrainerRaw,
      forgeCrafting: forgeCraftingRaw,
      phaseTransitions: phaseTransitionsRaw
    }
    
    const unifiedNodesObj = processAllNodes(allRawCsvData)
    const unifiedNodes = Object.values(unifiedNodesObj) // Convert object to array
    
    // Create the final game data object
    const gameData = Object.freeze({
      crops,
      adventures,
      upgrades,
      mining,
      helpers,
      combat,
      weapons,
      armorBase,
      armorPotential,
      armorEffects,
      routeLootTable,
      enemyTypesDamage,
      routeWaveComposition,
      tools,
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
      storage: Object.freeze({}),
      // Unified nodes for upgrade tree
      unifiedNodes: Object.freeze(unifiedNodes)
    })
    
    console.log('✅ Game data loaded successfully:', {
      crops: Object.keys(crops).length,
      adventures: Object.keys(adventures).length,
      upgrades: Object.keys(upgrades).length,
      mining: Object.keys(mining).length,
      helpers: Object.keys(helpers).length,
      combat: Object.keys(combat).length,
      weapons: Object.keys(weapons).length,
      armorBase: Object.keys(armorBase).length,
      armorPotential: Object.keys(armorPotential).length,
      armorEffects: Object.keys(armorEffects).length,
      routeLootTable: Object.keys(routeLootTable).length,
      enemyTypesDamage: Object.keys(enemyTypesDamage).length,
      routeWaveComposition: Object.keys(routeWaveComposition).length,
      tools: Object.keys(tools).length,
      helperRoles: Object.keys(helperRoles).length,
      towerLevels: Object.keys(towerLevels).length,
      vendors: Object.keys(vendors).length,
      bossMaterials: Object.keys(bossMaterials).length,
      farmCleanups: Object.keys(farmCleanups).length,
      farmStages: Object.keys(farmStages).length,
      farmProjects: Object.keys(farmProjects).length,
      gnomeRoles: Object.keys(gnomeRoles).length,
      xpProgression: Object.keys(xpProgression).length,
      townBlacksmith: Object.keys(townBlacksmith).length,
      townAgronomist: Object.keys(townAgronomist).length,
      townCarpenter: Object.keys(townCarpenter).length,
      townLandSteward: Object.keys(townLandSteward).length,
      townMaterialTrader: Object.keys(townMaterialTrader).length,
      townSkillsTrainer: Object.keys(townSkillsTrainer).length,
      forgeCrafting: Object.keys(forgeCrafting).length,
      materialRefinement: Object.keys(materialRefinement).length,
      phaseTransitions: Object.keys(phaseTransitions).length
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
