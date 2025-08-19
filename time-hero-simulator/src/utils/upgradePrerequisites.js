/**
 * Upgrade Prerequisites Utility
 * 
 * Handles parsing and validation of complex prerequisite chains
 * for the vendor-based upgrade system.
 */

/**
 * Parse prerequisite string into structured format
 * 
 * Examples:
 * - "storage_1" -> { upgrades: ["storage_1"], farmStages: [] }
 * - "storage_2;homestead" -> { upgrades: ["storage_2"], farmStages: ["homestead"] }
 * - "pump_2;tank_3;homestead" -> { upgrades: ["pump_2", "tank_3"], farmStages: ["homestead"] }
 * 
 * @param {string} prerequisiteString - Raw prerequisite string from CSV
 * @returns {Object} Parsed prerequisites
 */
export function parsePrerequisites(prerequisiteString) {
  if (!prerequisiteString || prerequisiteString.trim() === '') {
    return { upgrades: [], farmStages: [], tools: [], buildings: [] }
  }

  const parts = prerequisiteString.split(';').map(p => p.trim()).filter(Boolean)
  const farmStages = ['homestead', 'manor_grounds', 'great_estate']
  const prerequisites = {
    upgrades: [],
    farmStages: [],
    tools: [],
    buildings: []
  }

  parts.forEach(part => {
    if (farmStages.includes(part)) {
      prerequisites.farmStages.push(part)
    } else if (part.includes('_tool') || part.includes('_weapon')) {
      prerequisites.tools.push(part)
    } else if (part.includes('_built') || part.includes('_complete')) {
      prerequisites.buildings.push(part)
    } else {
      prerequisites.upgrades.push(part)
    }
  })

  return prerequisites
}

/**
 * Check if all prerequisites are met for an upgrade
 * 
 * @param {Object} upgrade - The upgrade to check
 * @param {Object} gameState - Current game state with owned upgrades
 * @param {Object} allUpgrades - All available upgrades
 * @returns {Object} Status information
 */
export function checkPrerequisites(upgrade, gameState, allUpgrades) {
  const parsed = parsePrerequisites(upgrade.prerequisite)
  const status = {
    canPurchase: true,
    missingUpgrades: [],
    missingFarmStages: [],
    missingTools: [],
    missingBuildings: [],
    nextRequirement: null,
    blockingType: null
  }

  // Check upgrade prerequisites
  parsed.upgrades.forEach(prereqId => {
    if (!gameState.ownedUpgrades?.includes(prereqId)) {
      status.canPurchase = false
      status.missingUpgrades.push(prereqId)
      if (!status.nextRequirement) {
        status.nextRequirement = prereqId
        status.blockingType = 'upgrade'
      }
    }
  })

  // Check farm stage prerequisites
  parsed.farmStages.forEach(stage => {
    if (!gameState.farmStages?.includes(stage)) {
      status.canPurchase = false
      status.missingFarmStages.push(stage)
      if (!status.nextRequirement) {
        status.nextRequirement = stage
        status.blockingType = 'farmStage'
      }
    }
  })

  // Check tool prerequisites
  parsed.tools.forEach(tool => {
    if (!gameState.ownedTools?.includes(tool)) {
      status.canPurchase = false
      status.missingTools.push(tool)
      if (!status.nextRequirement) {
        status.nextRequirement = tool
        status.blockingType = 'tool'
      }
    }
  })

  // Check building prerequisites
  parsed.buildings.forEach(building => {
    if (!gameState.buildings?.includes(building)) {
      status.canPurchase = false
      status.missingBuildings.push(building)
      if (!status.nextRequirement) {
        status.nextRequirement = building
        status.blockingType = 'building'
      }
    }
  })

  return status
}

/**
 * Get all upgrades that depend on a specific upgrade
 * 
 * @param {string} upgradeId - The upgrade to find dependents for
 * @param {Object} allUpgrades - All available upgrades
 * @returns {Array} List of dependent upgrades
 */
export function getDependentUpgrades(upgradeId, allUpgrades) {
  return Object.values(allUpgrades).filter(upgrade => {
    const parsed = parsePrerequisites(upgrade.prerequisite)
    return parsed.upgrades.includes(upgradeId)
  })
}

/**
 * Build a complete dependency graph for all upgrades
 * 
 * @param {Object} allUpgrades - All available upgrades
 * @returns {Object} Dependency graph with nodes and edges
 */
export function buildDependencyGraph(allUpgrades) {
  const nodes = {}
  const edges = []

  // Create nodes
  Object.values(allUpgrades).forEach(upgrade => {
    nodes[upgrade.id] = {
      id: upgrade.id,
      upgrade,
      prerequisites: parsePrerequisites(upgrade.prerequisite),
      dependents: [],
      depth: 0
    }
  })

  // Create edges and populate dependents
  Object.values(nodes).forEach(node => {
    node.prerequisites.upgrades.forEach(prereqId => {
      if (nodes[prereqId]) {
        edges.push({
          from: prereqId,
          to: node.id,
          type: 'upgrade'
        })
        nodes[prereqId].dependents.push(node.id)
      }
    })

    // Add farm stage edges
    node.prerequisites.farmStages.forEach(stage => {
      edges.push({
        from: stage,
        to: node.id,
        type: 'farmStage'
      })
    })

    // Add tool/building edges
    node.prerequisites.tools.forEach(tool => {
      edges.push({
        from: tool,
        to: node.id,
        type: 'tool'
      })
    })

    node.prerequisites.buildings.forEach(building => {
      edges.push({
        from: building,
        to: node.id,
        type: 'building'
      })
    })
  })

  // Calculate depths for layout
  calculateNodeDepths(nodes)

  return { nodes, edges }
}

/**
 * Calculate the depth of each node in the dependency tree
 * 
 * @param {Object} nodes - Node map from buildDependencyGraph
 */
function calculateNodeDepths(nodes) {
  const visited = new Set()
  
  function calculateDepth(nodeId) {
    if (visited.has(nodeId)) return nodes[nodeId].depth
    
    visited.add(nodeId)
    const node = nodes[nodeId]
    
    if (node.prerequisites.upgrades.length === 0) {
      node.depth = 0
    } else {
      node.depth = Math.max(
        ...node.prerequisites.upgrades
          .filter(prereqId => nodes[prereqId])
          .map(prereqId => calculateDepth(prereqId) + 1)
      )
    }
    
    return node.depth
  }

  Object.keys(nodes).forEach(nodeId => {
    if (!visited.has(nodeId)) {
      calculateDepth(nodeId)
    }
  })
}

/**
 * Find the critical path to a target upgrade
 * 
 * @param {string} targetId - Target upgrade ID
 * @param {Object} allUpgrades - All available upgrades
 * @param {Object} gameState - Current game state
 * @returns {Array} Ordered list of upgrades in critical path
 */
export function findCriticalPath(targetId, allUpgrades, gameState) {
  const graph = buildDependencyGraph(allUpgrades)
  const path = []
  const visited = new Set()

  function buildPath(nodeId) {
    if (visited.has(nodeId) || gameState.ownedUpgrades?.includes(nodeId)) {
      return
    }

    visited.add(nodeId)
    const node = graph.nodes[nodeId]
    
    if (!node) return

    // First add all prerequisites
    node.prerequisites.upgrades.forEach(prereqId => {
      if (!gameState.ownedUpgrades?.includes(prereqId)) {
        buildPath(prereqId)
      }
    })

    // Then add this upgrade
    if (!gameState.ownedUpgrades?.includes(nodeId)) {
      path.push(nodeId)
    }
  }

  buildPath(targetId)
  return path
}

/**
 * Get all upgrades that would become available if specific upgrades were owned
 * 
 * @param {Array} upgradeIds - List of upgrade IDs to simulate owning
 * @param {Object} allUpgrades - All available upgrades
 * @param {Object} gameState - Current game state
 * @returns {Array} List of newly available upgrades
 */
export function getUnlockedUpgrades(upgradeIds, allUpgrades, gameState) {
  const simulatedGameState = {
    ...gameState,
    ownedUpgrades: [...(gameState.ownedUpgrades || []), ...upgradeIds]
  }

  return Object.values(allUpgrades).filter(upgrade => {
    const currentStatus = checkPrerequisites(upgrade, gameState, allUpgrades)
    const simulatedStatus = checkPrerequisites(upgrade, simulatedGameState, allUpgrades)
    
    return !currentStatus.canPurchase && simulatedStatus.canPurchase
  })
}

/**
 * Determine upgrade status based on prerequisites and resources
 * 
 * @param {Object} upgrade - The upgrade to check
 * @param {Object} gameState - Current game state
 * @param {Object} allUpgrades - All available upgrades
 * @returns {string} Status: 'owned', 'available', 'prerequisite_missing', 'farm_locked', 'tool_locked'
 */
export function getUpgradeStatus(upgrade, gameState, allUpgrades) {
  if (gameState.ownedUpgrades?.includes(upgrade.id)) {
    return 'owned'
  }

  const prereqStatus = checkPrerequisites(upgrade, gameState, allUpgrades)
  
  if (!prereqStatus.canPurchase) {
    switch (prereqStatus.blockingType) {
      case 'farmStage':
        return 'farm_locked'
      case 'tool':
        return 'tool_locked'
      case 'building':
        return 'building_locked'
      default:
        return 'prerequisite_missing'
    }
  }

  return 'available'
}
