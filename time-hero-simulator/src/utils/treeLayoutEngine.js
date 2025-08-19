/**
 * Tree Layout Engine
 * 
 * Handles source-based positioning and layout of upgrade nodes
 * in the upgrade tree configuration visualization system.
 * 
 * Sources = swim lanes (where you buy/get upgrades)
 * Areas = node colors (what part of the game the upgrade affects)
 */

import { buildDependencyGraph } from './upgradePrerequisites.js'

/**
 * Source configuration for swim lanes (game screens and town vendors)
 */
export const SOURCES = {
  // Main Game Screens
  farm: {
    name: "Farm",
    icon: "🌾",
    color: "#22c55e", // Green
    lightColor: "#86efac",
    description: "Farm management and crops"
  },
  adventure: {
    name: "Adventure",
    icon: "⚔️",
    color: "#8b5cf6", // Purple
    lightColor: "#c4b5fd",
    description: "Adventures and exploration"
  },
  forge: {
    name: "Forge",
    icon: "🔨",
    color: "#ef4444", // Red
    lightColor: "#fca5a5",
    description: "Crafting and forging"
  },
  mine: {
    name: "Mine",
    icon: "⛏️",
    color: "#a3a3a3", // Gray
    lightColor: "#d4d4d8",
    description: "Mining and resource extraction"
  },
  tower: {
    name: "Tower",
    icon: "🗼",
    color: "#6b7280", // Slate
    lightColor: "#9ca3af",
    description: "Tower construction and upgrades"
  },
  
  // Town Vendors
  blacksmith: {
    name: "Town - Ember & Edge",
    icon: "⚒️",
    color: "#8B4513", // Brown theme
    lightColor: "#D2B48C",
    description: "Weapons, armor, and combat gear"
  },
  agronomist: {
    name: "Town - Greenwise Co-op", 
    icon: "🌱",
    color: "#228B22", // Green theme
    lightColor: "#90EE90",
    description: "Farming, crops, and agricultural tech"
  },
  landSteward: {
    name: "Town - County Land Office",
    icon: "📜",
    color: "#4B0082", // Purple theme
    lightColor: "#DDA0DD",
    description: "Property management and land development"
  },
  carpenter: {
    name: "Town - Towerwrights Guild",
    icon: "🗼",
    color: "#DAA520", // Gold theme
    lightColor: "#F0E68C",
    description: "Construction, buildings, and infrastructure"
  },
  skillsTrainer: {
    name: "Town - Field School",
    icon: "📚",
    color: "#FF6347", // Tomato theme
    lightColor: "#FFA07A",
    description: "Skills, training, and personal development"
  },
  vendor: {
    name: "Town - Exchange Post",
    icon: "💱",
    color: "#708090", // Slate gray
    lightColor: "#C0C0C0",
    description: "Materials, resources, and trading"
  }
}

/**
 * Area configuration for node colors (what part of the game the upgrade affects)
 */
export const AREAS = {
  energy: { 
    name: 'Energy Systems', 
    color: '#FFD700', 
    icon: '⚡',
    description: 'Energy storage and management'
  },
  water: { 
    name: 'Water Systems', 
    color: '#1E90FF', 
    icon: '💧',
    description: 'Water pumping and irrigation'
  },
  forge: { 
    name: 'Forge & Combat', 
    color: '#DC143C', 
    icon: '⚔️',
    description: 'Weapons, armor, and combat equipment'
  },
  hero: { 
    name: 'Hero Development', 
    color: '#9932CC', 
    icon: '🦸',
    description: 'Skills, abilities, and character growth'
  },
  housing: { 
    name: 'Housing & Buildings', 
    color: '#8B4513', 
    icon: '🏠',
    description: 'Residential and infrastructure buildings'
  },
  tower: { 
    name: 'Tower & Defense', 
    color: '#2F4F4F', 
    icon: '🏰',
    description: 'Tower construction and defensive systems'
  },
  storage: { 
    name: 'Storage & Logistics', 
    color: '#DAA520', 
    icon: '📦',
    description: 'Storage facilities and resource management'
  },
  materials: { 
    name: 'Materials & Resources', 
    color: '#CD853F', 
    icon: '⛏️',
    description: 'Raw materials and resource extraction'
  },
  deeds: { 
    name: 'Land & Property', 
    color: '#228B22', 
    icon: '📜',
    description: 'Land ownership and property management'
  }
}

/**
 * Layout configuration constants
 */
export const LAYOUT_CONFIG = {
  sourceSpacing: 350,      // Vertical space between sources
  categorySpacing: 120,    // Vertical space between categories within source
  tierSpacing: 150,        // Horizontal space between tiers
  nodeSpacing: 80,         // Vertical space between nodes in same tier/category
  nodeWidth: 120,
  nodeHeight: 60,
  headerHeight: 50,
  labelWidth: 180,
  minCanvasWidth: 1200,
  minCanvasHeight: 800
}

/**
 * Calculate positions for all upgrade nodes based on source organization
 * 
 * @param {Object} upgrades - All upgrades indexed by ID
 * @param {Object} gameState - Current game state for status
 * @returns {Object} Layout result with nodes, edges, and dimensions
 */
export function calculateSourceTreeLayout(upgrades, gameState = {}) {
  console.log('🔍 calculateSourceTreeLayout called with:', {
    upgradesCount: Object.keys(upgrades).length,
    upgradesKeys: Object.keys(upgrades).slice(0, 5),
    sampleUpgrade: Object.values(upgrades)[0],
    gameState: gameState
  })
  
  const graph = buildDependencyGraph(upgrades)
  const upgradesBySource = groupUpgradesBySource(upgrades)
  
  console.log('📊 Grouped upgrades by source:', upgradesBySource)
  
  const layout = {
    nodes: {},
    edges: [],
    sourceSections: {},
    dimensions: {
      width: LAYOUT_CONFIG.minCanvasWidth,
      height: LAYOUT_CONFIG.minCanvasHeight
    }
  }

  let currentY = LAYOUT_CONFIG.headerHeight

  // Process each source
  Object.entries(SOURCES).forEach(([sourceId, sourceConfig]) => {
    const sourceUpgrades = upgradesBySource[sourceId] || []
    if (sourceUpgrades.length === 0) return

    const sourceSection = {
      id: sourceId,
      name: sourceConfig.name,
      icon: sourceConfig.icon,
      color: sourceConfig.color,
      y: currentY,
      height: 0,
      categories: {}
    }

    // Group upgrades by area (category) within source
    const upgradesByArea = groupByArea(sourceUpgrades)
    let areaY = currentY + LAYOUT_CONFIG.headerHeight

    Object.entries(upgradesByArea).forEach(([area, areaUpgrades]) => {
      const areaSection = layoutArea(
        area, 
        areaUpgrades, 
        areaY, 
        sourceConfig,
        graph
      )

      // Position nodes for this area
      Object.values(areaSection.nodes).forEach(node => {
        layout.nodes[node.id] = {
          ...node,
          sourceId,
          area,
          // Use area color for node, source color for swim lane
          nodeColor: AREAS[area]?.color || '#888888',
          sourceColor: sourceConfig.color
        }
      })

      layout.edges.push(...areaSection.edges)
      sourceSection.categories[area] = areaSection
      areaY += areaSection.height + LAYOUT_CONFIG.categorySpacing
    })

    sourceSection.height = areaY - currentY - LAYOUT_CONFIG.categorySpacing
    layout.sourceSections[sourceId] = sourceSection
    currentY = areaY + LAYOUT_CONFIG.sourceSpacing
  })

  // Calculate edges after all nodes are positioned
  layout.edges = calculateLayoutEdges(layout.nodes, graph.edges)

  // Update canvas dimensions
  const maxX = Math.max(...Object.values(layout.nodes).map(n => n.x + LAYOUT_CONFIG.nodeWidth))
  layout.dimensions.width = Math.max(maxX + 100, LAYOUT_CONFIG.minCanvasWidth)
  layout.dimensions.height = Math.max(currentY, LAYOUT_CONFIG.minCanvasHeight)

  return layout
}

/**
 * Group upgrades by source field (not vendor field)
 * 
 * @param {Object} upgrades - All upgrades
 * @returns {Object} Upgrades grouped by source
 */
function groupUpgradesBySource(upgrades) {
  const grouped = {}
  
  Object.values(upgrades).forEach(upgrade => {
    const source = upgrade.source || 'unknown' // source field from nodeClassification
    if (!grouped[source]) {
      grouped[source] = []
    }
    grouped[source].push(upgrade)
  })

  return grouped
}

/**
 * Group upgrades by area (category field in CSV) within a source
 * 
 * @param {Array} sourceUpgrades - Upgrades for a specific source
 * @returns {Object} Upgrades grouped by area
 */
function groupByArea(sourceUpgrades) {
  const grouped = {}
  
  sourceUpgrades.forEach(upgrade => {
    const area = upgrade.category || 'uncategorized'
    if (!grouped[area]) {
      grouped[area] = []
    }
    grouped[area].push(upgrade)
  })

  return grouped
}

/**
 * Layout upgrades within an area
 * 
 * @param {string} area - Area name (category)
 * @param {Array} areaUpgrades - Upgrades in this area
 * @param {number} startY - Starting Y position
 * @param {Object} sourceConfig - Source configuration
 * @param {Object} graph - Dependency graph
 * @returns {Object} Area layout result
 */
function layoutArea(area, areaUpgrades, startY, sourceConfig, graph) {
  const areaLayout = {
    name: area,
    y: startY,
    height: 0,
    nodes: {},
    edges: [],
    maxTier: 0
  }

  // Sort upgrades by depth (tier) for left-to-right progression
  const upgradesWithDepth = areaUpgrades.map(upgrade => ({
    upgrade,
    depth: graph.nodes[upgrade.id]?.depth || 0
  })).sort((a, b) => a.depth - b.depth)

  // Group by depth (tier)
  const tierGroups = {}
  upgradesWithDepth.forEach(({ upgrade, depth }) => {
    if (!tierGroups[depth]) {
      tierGroups[depth] = []
    }
    tierGroups[depth].push(upgrade)
    areaLayout.maxTier = Math.max(areaLayout.maxTier, depth)
  })

  // Position nodes tier by tier
  let maxY = startY + LAYOUT_CONFIG.headerHeight

  Object.entries(tierGroups).forEach(([tier, tierUpgrades]) => {
    const tierNum = parseInt(tier, 10)
    const x = LAYOUT_CONFIG.labelWidth + (tierNum * LAYOUT_CONFIG.tierSpacing)
    
    tierUpgrades.forEach((upgrade, index) => {
      const y = startY + LAYOUT_CONFIG.headerHeight + (index * LAYOUT_CONFIG.nodeSpacing)
      
      areaLayout.nodes[upgrade.id] = {
        id: upgrade.id,
        x,
        y,
        tier: tierNum,
        area,
        upgrade,
        width: LAYOUT_CONFIG.nodeWidth,
        height: LAYOUT_CONFIG.nodeHeight
      }

      maxY = Math.max(maxY, y + LAYOUT_CONFIG.nodeHeight)
    })
  })

  areaLayout.height = maxY - startY

  return areaLayout
}

/**
 * Calculate edges between positioned nodes
 * 
 * @param {Object} nodes - Positioned nodes
 * @param {Array} graphEdges - Edges from dependency graph
 * @returns {Array} Layout edges with paths
 */
function calculateLayoutEdges(nodes, graphEdges) {
  return graphEdges
    .filter(edge => nodes[edge.from] && nodes[edge.to])
    .map(edge => {
      const fromNode = nodes[edge.from]
      const toNode = nodes[edge.to]
      
      return {
        id: `${edge.from}-${edge.to}`,
        from: edge.from,
        to: edge.to,
        type: edge.type,
        path: calculateEdgePath(fromNode, toNode),
        color: getEdgeColor(edge.type),
        style: getEdgeStyle(edge.type)
      }
    })
}

/**
 * Calculate SVG path for an edge between two nodes
 * 
 * @param {Object} fromNode - Source node
 * @param {Object} toNode - Target node
 * @returns {string} SVG path string
 */
function calculateEdgePath(fromNode, toNode) {
  const fromX = fromNode.x + fromNode.width
  const fromY = fromNode.y + fromNode.height / 2
  const toX = toNode.x
  const toY = toNode.y + toNode.height / 2

  // Use bezier curve for smoother connections
  const controlPointOffset = Math.min(100, Math.abs(toX - fromX) / 3)
  const controlX1 = fromX + controlPointOffset
  const controlX2 = toX - controlPointOffset

  return `M ${fromX} ${fromY} C ${controlX1} ${fromY}, ${controlX2} ${toY}, ${toX} ${toY}`
}

/**
 * Get color for edge based on type
 * 
 * @param {string} edgeType - Type of edge
 * @returns {string} Color hex code
 */
function getEdgeColor(edgeType) {
  const colors = {
    upgrade: '#6366f1',      // Indigo for upgrade dependencies
    farmStage: '#f59e0b',    // Amber for farm stage requirements
    tool: '#10b981',         // Emerald for tool requirements
    building: '#8b5cf6'      // Violet for building requirements
  }
  return colors[edgeType] || colors.upgrade
}

/**
 * Get stroke style for edge based on type
 * 
 * @param {string} edgeType - Type of edge
 * @returns {Object} Stroke style properties
 */
function getEdgeStyle(edgeType) {
  const styles = {
    upgrade: {
      strokeDasharray: 'none',
      strokeWidth: 2,
      opacity: 0.7
    },
    farmStage: {
      strokeDasharray: '8,4',
      strokeWidth: 2,
      opacity: 0.8
    },
    tool: {
      strokeDasharray: '4,2',
      strokeWidth: 1.5,
      opacity: 0.6
    },
    building: {
      strokeDasharray: '8,2,2,2',
      strokeWidth: 1.5,
      opacity: 0.6
    }
  }
  return styles[edgeType] || styles.upgrade
}

/**
 * Find optimal view bounds for a set of nodes
 * 
 * @param {Object} nodes - Nodes to fit in view
 * @param {number} padding - Padding around nodes
 * @returns {Object} View bounds
 */
export function calculateViewBounds(nodes, padding = 50) {
  const nodeList = Object.values(nodes)
  if (nodeList.length === 0) {
    return {
      x: 0,
      y: 0,
      width: LAYOUT_CONFIG.minCanvasWidth,
      height: LAYOUT_CONFIG.minCanvasHeight
    }
  }

  const minX = Math.min(...nodeList.map(n => n.x))
  const maxX = Math.max(...nodeList.map(n => n.x + n.width))
  const minY = Math.min(...nodeList.map(n => n.y))
  const maxY = Math.max(...nodeList.map(n => n.y + n.height))

  return {
    x: minX - padding,
    y: minY - padding,
    width: (maxX - minX) + (padding * 2),
    height: (maxY - minY) + (padding * 2)
  }
}

/**
 * Get source configuration by ID
 * 
 * @param {string} sourceId - Source identifier
 * @returns {Object} Source configuration
 */
export function getSourceConfig(sourceId) {
  return SOURCES[sourceId] || {
    name: 'Unknown Source',
    icon: '❓',
    color: '#6b7280',
    lightColor: '#d1d5db',
    description: 'Unknown source'
  }
}

/**
 * Filter layout based on provided filters
 * 
 * @param {Object} layout - Full layout to filter
 * @param {Object} filters - Filter criteria
 * @returns {Object} Filtered layout
 */
export function filterLayout(layout, filters) {
  if (!layout || !layout.nodes) {
    return layout
  }

  const filteredNodes = {}
  const filteredEdges = []

  // Filter nodes
  Object.values(layout.nodes).forEach(node => {
    let include = true

    // Source filter
    if (filters.sources && !filters.sources.includes('all')) {
      include = include && filters.sources.includes(node.sourceId)
    }

    // Area filter  
    if (filters.areas && !filters.areas.includes('all')) {
      include = include && filters.areas.includes(node.area)
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase()
      include = include && (
        node.upgrade.name.toLowerCase().includes(searchTerm) ||
        node.upgrade.description?.toLowerCase().includes(searchTerm)
      )
    }

    // Affordability filter
    if (filters.showOnlyAffordable && node.status) {
      include = include && node.status.canAfford
    }

    // Availability filter
    if (filters.showOnlyAvailable && node.status) {
      include = include && node.status.canPurchase
    }

    // Hide owned filter
    if (filters.hideOwned && node.status) {
      include = include && !node.status.owned
    }

    if (include) {
      filteredNodes[node.id] = node
    }
  })

  // Filter edges to only include connections between visible nodes
  layout.edges.forEach(edge => {
    if (filteredNodes[edge.from] && filteredNodes[edge.to]) {
      filteredEdges.push(edge)
    }
  })

  return {
    ...layout,
    nodes: filteredNodes,
    edges: filteredEdges
  }
}
