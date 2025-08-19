/**
 * Node Classification Engine
 * 
 * Maps items from CSV files to sources (swim lanes) and areas (node colors)
 * for the upgrade tree visualization system.
 */

/**
 * Determine which source (swim lane) an item belongs to
 */
export function classifySource(item, csvSource) {
  // Direct town vendor mappings with camelCase to match SOURCES
  const townMappings = {
    'townBlacksmith': 'blacksmith',
    'townAgronomist': 'agronomist', 
    'townLandSteward': 'landSteward',
    'townCarpenter': 'carpenter',
    'townSkillsTrainer': 'skillsTrainer',
    'townMaterialTrader': 'vendor'
  }
  
  if (townMappings[csvSource]) {
    return townMappings[csvSource]
  }
  
  // Logical mappings for other files to main game screens and vendors
  const sourceMappings = {
    // Main Game Screens
    'crops': 'farm',
    'farmProjects': 'farm', 
    'farmStages': 'farm',
    
    'adventures': 'adventure',
    'xpProgression': 'adventure',
    
    'forgeCrafting': 'forge',
    'weapons': 'forge',
    
    'mining': 'mine',
    
    'towerLevels': 'tower',
    
    // Fallback to Town Vendors
    'phaseTransitions': 'landSteward',
    'vendors': 'vendor',
    'bossMaterials': 'vendor'
  }
  
  return sourceMappings[csvSource] || 'vendor' // Default fallback
}

/**
 * Determine which area (node color) an item belongs to
 */
export function classifyArea(item, csvSource) {
  // Type-based classification (most specific)
  if (item.type) {
    const typeMappings = {
      'energy_storage': 'energy',
      'water_system': 'water', 
      'tool': 'forge',
      'weapon': 'forge',
      'adventure': 'hero',
      'crop': 'energy',
      'building': 'housing',
      'tower': 'tower',
      'material': 'materials',
      'deed': 'deeds',
      'skill': 'hero'
    }
    
    if (typeMappings[item.type]) {
      return typeMappings[item.type]
    }
  }
  
  // Category-based classification  
  if (item.category) {
    const categoryMappings = {
      'energy': 'energy',
      'water': 'water',
      'forge': 'forge', 
      'combat': 'forge',
      'housing': 'housing',
      'tower': 'tower',
      'storage': 'storage',
      'materials': 'materials',
      'deeds': 'deeds',
      'hero': 'hero'
    }
    
    if (categoryMappings[item.category]) {
      return categoryMappings[item.category]
    }
  }
  
  // CSV source-based fallback classification
  const sourceMappings = {
    'town_blacksmith': 'forge',
    'town_agronomist': 'energy',
    'town_land_steward': 'deeds', 
    'town_carpenter': 'housing',
    'town_skills_trainer': 'hero',
    'town_material_trader': 'materials',
    'forge_crafting': 'forge',
    'farm_projects': 'energy',
    'farm_stages': 'deeds',
    'adventures': 'hero',
    'crops': 'energy',
    'mining': 'materials',
    'weapons': 'forge',
    'tower_levels': 'tower',
    'vendors': 'materials',
    'boss_materials': 'materials',
    'xp_progression': 'hero',
    'phase_transitions': 'deeds'
  }
  
  return sourceMappings[csvSource] || 'materials' // Default fallback
}

/**
 * Parse prerequisite string into array of dependencies
 */
export function parsePrerequisites(prerequisiteField) {
  if (!prerequisiteField || prerequisiteField.trim() === '') {
    return []
  }
  
  // Handle semicolon-separated prerequisites
  return prerequisiteField
    .split(';')
    .map(req => req.trim())
    .filter(req => req.length > 0)
}

/**
 * Parse materials string into object
 * Format: "wood:5;stone:3" -> { wood: 5, stone: 3 }
 */
export function parseMaterials(materialsField) {
  if (!materialsField || materialsField.trim() === '') {
    return {}
  }
  
  const materials = {}
  const pairs = materialsField.split(';')
  
  pairs.forEach(pair => {
    const [material, amount] = pair.split(':').map(s => s.trim())
    if (material && amount) {
      materials[material.toLowerCase()] = parseInt(amount) || 1
    }
  })
  
  return materials
}

/**
 * Extract cost information from CSV item
 */
export function extractCosts(item) {
  // Handle various cost field naming conventions
  const gold = item.goldCost || item.gold_cost || item.cost || 0
  const energy = item.energyCost || item.energy_cost || item.build_energy || 0
  
  // Parse materials from string format
  const materials = parseMaterials(item.materials)
  const bossMaterials = parseMaterials(item.boss_materials || item.bossMaterials)
  
  return {
    gold: parseInt(gold) || 0,
    energy: parseInt(energy) || 0,
    materials,
    bossMaterials
  }
}

/**
 * Create a unified node object from CSV item
 */
export function createNode(item, csvSource, index) {
  const source = classifySource(item, csvSource)
  const area = classifyArea(item, csvSource)
  const prerequisites = parsePrerequisites(item.prerequisite || item.prerequisite_blueprint || '')
  const costs = extractCosts(item)
  
  // Create a unique ID by combining csvSource with item id if needed
  const nodeId = item.id || `${csvSource}_${index}`
  
  return {
    id: nodeId,
    name: item.name || 'Unnamed Item',
    description: item.description || item.effect || '', // Use description or effect field
    effect: item.effect || '',
    source: source,
    area: area,
    category: item.category || 'general', // Preserve category field
    vendor: item.vendor || source, // Vendor info for tooltip
    costs: costs, // Structured cost information
    prerequisites: prerequisites,
    csvSource: csvSource,
    rawData: { ...item }, // Clone the original data
    position: { x: 0, y: 0 }, // Will be calculated by layout engine
    isAvailable: prerequisites.length === 0, // Simple initial logic
    isLocked: prerequisites.length > 0
  }
}

/**
 * Process all CSV data into unified node structure
 */
export function processAllNodes(allCsvData) {
  const nodes = []
  const excludedSources = new Set([
    // Combat tab exclusions
    'armor_base', 'armor_effects', 'armor_potential',
    'enemy_types_damage', 'route_loot_table', 'route_wave_composition',
    // Tools & refinement exclusions  
    'tools', 'material_refinement',
    // Helper/gnome exclusions
    'helpers', 'gnome_roles', 'helper_roles',
    'farm_cleanups' // Also excluded based on user criteria
  ])
  
  for (const [csvSource, csvData] of Object.entries(allCsvData)) {
    if (excludedSources.has(csvSource) || !Array.isArray(csvData)) {
      console.log(`⏭️ Skipping ${csvSource}:`, { excluded: excludedSources.has(csvSource), isArray: Array.isArray(csvData) })
      continue
    }
    
    console.log(`🔍 Processing ${csvSource}:`, { rows: csvData.length, sampleItem: csvData[0] })
    
    csvData.forEach((item, index) => {
      if (item && item.id) { // Only include items with IDs
        const node = createNode(item, csvSource, index)
        nodes.push(node)
      } else {
        console.log(`⚠️ Skipping item in ${csvSource}[${index}]:`, { hasItem: !!item, hasId: !!(item && item.id), item: item })
      }
    })
  }
  
  console.log('🔧 Node classification complete:', {
    totalNodes: nodes.length,
    sourceBreakdown: nodes.reduce((acc, node) => {
      acc[node.source] = (acc[node.source] || 0) + 1
      return acc
    }, {}),
    areaBreakdown: nodes.reduce((acc, node) => {
      acc[node.area] = (acc[node.area] || 0) + 1  
      return acc
    }, {})
  })
  
  return nodes
}
