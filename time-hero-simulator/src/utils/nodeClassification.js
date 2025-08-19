/**
 * Node Classification System
 * 
 * Handles classification and processing of upgrade nodes from CSV data.
 * Converts raw CSV data into structured upgrade nodes with proper
 * source and area classification.
 */

/**
 * Main function to process all nodes from CSV data
 * This is the primary export that importers.js expects
 */
export function processAllNodes(csvData) {
  console.log('🔄 Processing all nodes from CSV data...', Object.keys(csvData))
  
  const allNodes = {}
  
  // Process each CSV file
  Object.entries(csvData).forEach(([filename, data]) => {
    if (!data || data.length === 0) {
      console.warn(`⚠️ No data in ${filename}`)
      return
    }
    
    console.log(`📊 Processing ${filename}: ${data.length} rows`)
    
    data.forEach((row, index) => {
      try {
        const node = createNode(row, filename)
        if (node && node.id) {
          allNodes[node.id] = node
          console.log(`  ✅ Created node: ${node.id} (${node.name})`)
        }
      } catch (error) {
        console.error(`❌ Error processing row ${index} in ${filename}:`, error, row)
      }
    })
  })
  
  console.log(`✅ Processed ${Object.keys(allNodes).length} total nodes`)
  
  // Create placeholder nodes for missing prerequisites
  const createdPlaceholders = createMissingPrerequisiteNodes(allNodes)
  console.log(`🔧 Created ${createdPlaceholders} placeholder nodes for missing prerequisites`)
  
  return allNodes
}

/**
 * Create a unified node structure from CSV row data
 */
export function createNode(row, filename) {
  if (!row || typeof row !== 'object') {
    console.warn('Invalid row data:', row)
    return null
  }
  
  // Extract basic info
  const id = row.id || row.item_id || row.name || `${filename}_${Math.random().toString(36).substr(2, 9)}`
  const name = row.name || row.item_name || id
  const description = row.description || row.effect || ''
  
  // Classify source and area
  const source = classifySource(filename, row)
  const area = classifyArea(row, filename)
  
  // Parse costs
  const costs = parseCosts(row)
  
  // Parse prerequisites 
  const prerequisites = parsePrerequisites(row)
  
  // Create unified node
  const node = {
    id: String(id),
    name: String(name),
    description: String(description),
    source: source,
    area: area,
    costs: costs,
    prerequisites: prerequisites,
    filename: filename,
    originalData: { ...row }
  }
  
  return node
}

/**
 * Classify the source (where you buy/get the upgrade)
 */
export function classifySource(filename, row) {
  const file = filename.toLowerCase()
  
  // Town vendors - check for 'town_' prefix first
  if (file.includes('town_blacksmith')) return 'blacksmith'
  if (file.includes('town_agronomist')) return 'agronomist'  
  if (file.includes('town_land_steward')) return 'landSteward'
  if (file.includes('town_carpenter')) return 'carpenter'
  if (file.includes('town_skills_trainer')) return 'skillsTrainer'
  if (file.includes('town_material_trader')) return 'vendor'
  
  // Then check for generic vendor names
  if (file.includes('blacksmith')) return 'blacksmith'
  if (file.includes('agronomist')) return 'agronomist'  
  if (file.includes('land_steward')) return 'landSteward'
  if (file.includes('carpenter')) return 'carpenter'
  if (file.includes('skills_trainer')) return 'skillsTrainer'
  if (file.includes('material_trader')) return 'vendor'
  
  // Game screens
  if (file.includes('crop')) return 'farm'
  if (file.includes('farm')) return 'farm'
  if (file.includes('adventure')) return 'adventure'
  if (file.includes('forge')) return 'forge'
  if (file.includes('mining') || file.includes('mine')) return 'mine'
  if (file.includes('tower')) return 'tower'
  if (file.includes('weapon')) return 'forge'
  if (file.includes('armor')) return 'forge'
  if (file.includes('combat')) return 'adventure'
  if (file.includes('tools')) return 'forge'
  
  // Default
  return 'unknown'
}

/**
 * Classify the area (what part of the game the upgrade affects)
 */
export function classifyArea(row, filename) {
  const name = (row.name || '').toLowerCase()
  const desc = (row.description || row.effect || '').toLowerCase()
  const file = filename.toLowerCase()
  
  // Energy systems
  if (name.includes('energy') || desc.includes('energy') || 
      name.includes('power') || desc.includes('power')) {
    return 'energy'
  }
  
  // Water systems
  if (name.includes('water') || desc.includes('water') ||
      name.includes('irrigation') || desc.includes('irrigation')) {
    return 'water'
  }
  
  // Forge & Combat
  if (file.includes('weapon') || file.includes('armor') || 
      name.includes('sword') || name.includes('armor') ||
      desc.includes('damage') || desc.includes('defense')) {
    return 'forge'
  }
  
  // Hero Development
  if (name.includes('skill') || desc.includes('skill') ||
      name.includes('training') || desc.includes('training') ||
      file.includes('skills_trainer')) {
    return 'hero'
  }
  
  // Housing & Buildings
  if (name.includes('house') || name.includes('building') ||
      desc.includes('house') || desc.includes('building')) {
    return 'housing'
  }
  
  // Tower & Defense
  if (file.includes('tower') || name.includes('tower') ||
      name.includes('defense') || desc.includes('defense')) {
    return 'tower'
  }
  
  // Storage & Logistics
  if (name.includes('storage') || name.includes('warehouse') ||
      desc.includes('storage') || desc.includes('capacity')) {
    return 'storage'
  }
  
  // Materials & Resources
  if (file.includes('mining') || name.includes('ore') ||
      name.includes('material') || desc.includes('material')) {
    return 'materials'
  }
  
  // Deeds & Property
  if (file.includes('land_steward') || name.includes('deed') ||
      name.includes('land') || desc.includes('land')) {
    return 'deeds'
  }
  
  // Default to energy for crops/farm items
  if (file.includes('crop') || file.includes('farm')) {
    return 'energy'
  }
  
  return 'materials' // Default fallback
}

/**
 * Parse cost information from row data
 */
export function parseCosts(row) {
  const costs = {}
  
  // Gold cost
  if (row.gold_cost || row.cost || row.price) {
    costs.gold = parseInt(row.gold_cost || row.cost || row.price) || 0
  }
  
  // Energy cost
  if (row.energy_cost || row.energy) {
    costs.energy = parseInt(row.energy_cost || row.energy) || 0
  }
  
  // Material costs (look for various material fields)
  const materials = {}
  Object.keys(row).forEach(key => {
    if (key.includes('material') && row[key]) {
      const materialName = key.replace('_cost', '').replace('material_', '')
      materials[materialName] = parseInt(row[key]) || 0
    }
  })
  
  if (Object.keys(materials).length > 0) {
    costs.materials = materials
  }
  
  return Object.keys(costs).length > 0 ? costs : null
}

/**
 * Parse prerequisite information from row data
 */
export function parsePrerequisites(row) {
  const prerequisites = []
  
  // Handle prerequisite field with semicolon separation
  if (row.prerequisite) {
    const prereqs = String(row.prerequisite)
      .split(';')  // Changed from ',' to ';'
      .map(p => p.trim())
      .filter(p => p && p !== '')
    prerequisites.push(...prereqs)
  }
  
  // Handle prerequisites field (keeping comma for backward compatibility)
  if (row.prerequisites) {
    const prereqs = String(row.prerequisites)
      .split(/[,;]/)  // Support both comma and semicolon
      .map(p => p.trim())
      .filter(p => p && p !== '')
    prerequisites.push(...prereqs)
  }
  
  if (row.requires) {
    const requires = String(row.requires)
      .split(/[,;]/)  // Support both comma and semicolon
      .map(p => p.trim())
      .filter(p => p && p !== '')
    prerequisites.push(...requires)
  }
  
  // Look for unlock conditions
  if (row.unlock_condition) {
    const prereqs = String(row.unlock_condition)
      .split(/[,;]/)  // Support both comma and semicolon
      .map(p => p.trim())
      .filter(p => p && p !== '')
    prerequisites.push(...prereqs)
  }
  
  return prerequisites.length > 0 ? prerequisites : []
}

/**
 * Validate node structure
 */
export function validateNode(node) {
  if (!node || typeof node !== 'object') {
    return false
  }
  
  if (!node.id || !node.name) {
    return false
  }
  
  return true
}

/**
 * Get all valid sources
 */
export function getAllSources() {
  return [
    'farm', 'adventure', 'forge', 'mine', 'tower',
    'blacksmith', 'agronomist', 'landSteward', 'carpenter', 'skillsTrainer', 'vendor'
  ]
}

/**
 * Get all valid areas
 */
export function getAllAreas() {
  return [
    'energy', 'water', 'forge', 'hero', 'housing', 
    'tower', 'storage', 'materials', 'deeds'
  ]
}

/**
 * Create placeholder nodes for missing prerequisites
 * @param {Object} allNodes - Current nodes object
 * @returns {number} Number of placeholder nodes created
 */
function createMissingPrerequisiteNodes(allNodes) {
  const missingPrereqs = new Set()
  let placeholdersCreated = 0
  
  // Collect all referenced prerequisites
  Object.values(allNodes).forEach(node => {
    if (node.prerequisites && node.prerequisites.length > 0) {
      node.prerequisites.forEach(prereqId => {
        if (!allNodes[prereqId] && !missingPrereqs.has(prereqId)) {
          missingPrereqs.add(prereqId)
        }
      })
    }
  })
  
  console.log(`🔍 Found ${missingPrereqs.size} missing prerequisites:`, Array.from(missingPrereqs).sort())
  
  // Create placeholder nodes for missing prerequisites
  missingPrereqs.forEach(prereqId => {
    const placeholderNode = createPlaceholderNode(prereqId)
    allNodes[prereqId] = placeholderNode
    placeholdersCreated++
    console.log(`  🆕 Created placeholder: ${prereqId} (${placeholderNode.source})`)
  })
  
  return placeholdersCreated
}

/**
 * Create a placeholder node for a missing prerequisite
 * @param {string} prereqId - The missing prerequisite ID
 * @returns {Object} Placeholder node
 */
function createPlaceholderNode(prereqId) {
  // Determine source and area based on ID patterns
  const source = classifyPlaceholderSource(prereqId)
  const area = classifyPlaceholderArea(prereqId)
  
  return {
    id: prereqId,
    name: formatPlaceholderName(prereqId),
    description: `Missing prerequisite: ${prereqId}`,
    source: source,
    area: area,
    costs: null,
    prerequisites: [],
    filename: 'placeholder',
    originalData: { id: prereqId, placeholder: true },
    isPlaceholder: true
  }
}

/**
 * Classify source for placeholder nodes based on ID patterns
 * @param {string} prereqId - The prerequisite ID
 * @returns {string} Source classification
 */
function classifyPlaceholderSource(prereqId) {
  // Farm-related patterns
  if (prereqId.includes('clear_weeds') || prereqId.includes('till_') || 
      prereqId.includes('terraform') || prereqId.includes('sacred_clearing') ||
      prereqId.includes('homestead') || prereqId.includes('manor') || 
      prereqId.includes('estate')) {
    return 'farm'
  }
  
  // Tower-related patterns
  if (prereqId.includes('reach_') || prereqId.includes('tower_') ||
      prereqId.includes('tower_built')) {
    return 'tower'
  }
  
  // Helper-related patterns
  if (prereqId.includes('gnome_') || prereqId.includes('helper_')) {
    return 'skillsTrainer'
  }
  
  // Anvil/forge patterns
  if (prereqId.includes('anvil_')) {
    return 'blacksmith'
  }
  
  // Blueprint patterns
  if (prereqId.includes('blueprint_')) {
    return 'carpenter'
  }
  
  // Default to unknown but log for investigation
  console.warn(`🤔 Unknown placeholder source pattern for: ${prereqId}`)
  return 'unknown'
}

/**
 * Classify area for placeholder nodes based on ID patterns
 * @param {string} prereqId - The prerequisite ID
 * @returns {string} Area classification
 */
function classifyPlaceholderArea(prereqId) {
  // Farm/energy related
  if (prereqId.includes('clear_weeds') || prereqId.includes('till_') || 
      prereqId.includes('terraform') || prereqId.includes('sacred_clearing')) {
    return 'energy'
  }
  
  // Housing/deeds related
  if (prereqId.includes('homestead') || prereqId.includes('manor') || 
      prereqId.includes('estate')) {
    return 'deeds'
  }
  
  // Tower/defense related
  if (prereqId.includes('reach_') || prereqId.includes('tower_')) {
    return 'tower'
  }
  
  // Hero/helper related
  if (prereqId.includes('gnome_') || prereqId.includes('helper_')) {
    return 'hero'
  }
  
  // Forge/materials related
  if (prereqId.includes('anvil_') || prereqId.includes('blueprint_')) {
    return 'forge'
  }
  
  // Default to materials
  return 'materials'
}

/**
 * Format placeholder name for display
 * @param {string} prereqId - The prerequisite ID
 * @returns {string} Formatted name
 */
function formatPlaceholderName(prereqId) {
  // Convert underscores to spaces and capitalize
  return prereqId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/(\d+)/, ' $1') // Add space before numbers
    .trim()
}