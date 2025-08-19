/**
 * Tree Layout Engine
 * 
 * Handles source-based positioning and layout of upgrade nodes
 * in the upgrade tree configuration visualization system.
 * 
 * Sources = swim lanes (where you buy/get upgrades)
 * Areas = node colors (what part of the game the upgrade affects)
 */

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
    name: 'Deeds & Property', 
    color: '#4169E1', 
    icon: '📜',
    description: 'Property deeds and land management'
  }
}

/**
 * Get source configuration by ID
 */
export function getSourceConfig(sourceId) {
  return SOURCES[sourceId] || {
    name: sourceId,
    icon: '❓',
    color: '#6b7280',
    lightColor: '#9ca3af',
    description: `Unknown source: ${sourceId}`
  }
}

/**
 * Calculate tier (depth) for each node based on prerequisites
 */
function calculateNodeTiers(nodes) {
  const nodeMap = {}
  const tierMap = {}
  
  // Create lookup map
  nodes.forEach(node => {
    nodeMap[node.id] = { ...node, tier: -1 }
  })
  
  // Recursive tier calculation with cycle detection
  function calculateTier(nodeId, visiting = new Set()) {
    if (!nodeMap[nodeId]) return 0
    if (nodeMap[nodeId].tier >= 0) return nodeMap[nodeId].tier
    if (visiting.has(nodeId)) {
      console.warn(`Circular dependency detected for ${nodeId}`)
      return 0
    }
    
    visiting.add(nodeId)
    const node = nodeMap[nodeId]
    
    // No prerequisites = tier 0 (root nodes)
    if (!node.prerequisites || node.prerequisites.length === 0) {
      node.tier = 0
    } else {
      // Tier = max prerequisite tier + 1
      let maxTier = 0
      for (const prereqId of node.prerequisites) {
        const prereqTier = calculateTier(prereqId, new Set(visiting))
        maxTier = Math.max(maxTier, prereqTier)
      }
      node.tier = maxTier + 1
    }
    
    return node.tier
  }
  
  // Calculate all tiers
  Object.keys(nodeMap).forEach(id => calculateTier(id))
  
  // Group nodes by tier
  Object.values(nodeMap).forEach(node => {
    if (!tierMap[node.tier]) tierMap[node.tier] = []
    tierMap[node.tier].push(node)
  })
  
  return { nodeMap, tierMap }
}

/**
 * Get game phase name for a tier
 */
function getPhaseForTier(tier) {
  if (tier === 0) return 'Tutorial'
  if (tier <= 2) return 'Early'
  if (tier <= 4) return 'Mid'
  if (tier <= 6) return 'Late'
  return 'Endgame'
}

/**
 * Main layout calculation - Civ 5 style with swim lanes
 */
export function calculateSourceTreeLayout(upgrades, gameState = {}) {
  console.log('🎯 Starting layout calculation with', Object.keys(upgrades).length, 'nodes')
  
  // FIRST: Calculate global tiers for ALL nodes
  const allNodes = Object.values(upgrades)
  const { nodeMap: globalNodeMap, tierMap: globalTierMap } = calculateNodeTiers(allNodes)
  
  // Update upgrades with calculated tiers
  Object.keys(upgrades).forEach(id => {
    if (globalNodeMap[id]) {
      upgrades[id].tier = globalNodeMap[id].tier
    }
  })
  
  // Group nodes by source (swim lanes) - but keep global tiers
  const sourceGroups = {}
  Object.values(upgrades).forEach(node => {
    const source = node.source || 'unknown'
    if (!sourceGroups[source]) sourceGroups[source] = []
    sourceGroups[source].push(node)
  })
  
  console.log('📊 Nodes grouped by source:', Object.keys(sourceGroups).map(s => `${s}: ${sourceGroups[s].length}`))
  console.log('📊 Global tier distribution:', Object.entries(globalTierMap).map(([tier, nodes]) => `Tier ${tier}: ${nodes.length} nodes`))
  
  const layout = {
    nodes: {},
    edges: [],
    sourceSections: {},
    dimensions: { width: 1600, height: 800 }
  }
  
  // Layout constants
  const TIER_WIDTH = 220       // Increased from 200 for better spacing
  const NODE_HEIGHT = 60        // Reduced from 70 for compactness
  const NODE_WIDTH = 160        // Increased from 140 for readability
  const NODE_MARGIN = 12        // Increased from 10 for better separation
  const SOURCE_HEADER = 40      // Reduced from 60
  const SOURCE_MARGIN = 25      // Increased from 20 for clearer separation
  const LEFT_MARGIN = 180       // Reduced from 220
  
  let currentY = 20
  const maxTier = Object.keys(globalNodeMap).length > 0 ? Math.max(...Object.values(globalNodeMap).map(n => n.tier)) : 0
  
  // Process each source as a swim lane - but use GLOBAL tiers for X positioning
  Object.entries(sourceGroups).forEach(([sourceId, sourceNodes]) => {
    console.log(`📍 Processing swim lane: ${sourceId} with ${sourceNodes.length} nodes`)
    
    // Group this source's nodes by their GLOBAL tier
    const sourceTierGroups = {}
    sourceNodes.forEach(node => {
      const tier = node.tier || 0
      if (!sourceTierGroups[tier]) sourceTierGroups[tier] = []
      sourceTierGroups[tier].push(node)
    })
    
    // Calculate lane height based on max nodes in any tier for this source
    const maxNodesInTier = Math.max(...Object.values(sourceTierGroups).map(nodes => nodes.length))
    const laneHeight = SOURCE_HEADER + (maxNodesInTier * (NODE_HEIGHT + NODE_MARGIN)) + NODE_MARGIN
    
    // Store source section
    layout.sourceSections[sourceId] = {
      y: currentY,
      height: laneHeight,
      name: SOURCES[sourceId]?.name || sourceId,
      icon: SOURCES[sourceId]?.icon || '📋',
      color: SOURCES[sourceId]?.color || '#6b7280',
      categories: {}
    }
    
    // Position nodes using GLOBAL tier for X coordinate
    Object.entries(sourceTierGroups).forEach(([tier, tierNodes]) => {
      const tierX = LEFT_MARGIN + (parseInt(tier) * TIER_WIDTH)
      let nodeY = currentY + SOURCE_HEADER + NODE_MARGIN
      
      // Sort nodes for consistent ordering
      tierNodes.sort((a, b) => a.name.localeCompare(b.name))
      
      tierNodes.forEach(node => {
        const layoutNode = {
          ...node,
          x: tierX,
          y: nodeY,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          sourceId: sourceId,
          tier: parseInt(tier)
        }
        
        layout.nodes[node.id] = layoutNode
        console.log(`  📌 Positioned ${node.id} at tier ${tier} (${tierX}, ${nodeY})`)
        
        nodeY += NODE_HEIGHT + NODE_MARGIN
      })
    })
    
    currentY += laneHeight + SOURCE_MARGIN
  })
  
  // Update canvas dimensions based on global tiers
  layout.dimensions.width = LEFT_MARGIN + ((maxTier + 1) * TIER_WIDTH) + 100
  layout.dimensions.height = currentY + 50
  
  console.log(`📐 Canvas dimensions: ${layout.dimensions.width}x${layout.dimensions.height}`)
  console.log(`📊 Max global tier: ${maxTier}`)
  
  // Add tier markers for visual debugging
  layout.tierMarkers = []
  for (let tier = 0; tier <= maxTier; tier++) {
    const tierX = LEFT_MARGIN + (tier * TIER_WIDTH)
    layout.tierMarkers.push({
      x: tierX - 10,
      y: 0,
      height: layout.dimensions.height,
      label: `Tier ${tier}`,
      phase: getPhaseForTier(tier)
    })
  }
  
  // Create edges (connections between prerequisites)
  Object.values(layout.nodes).forEach(node => {
    if (node.prerequisites && node.prerequisites.length > 0) {
      node.prerequisites.forEach(prereqId => {
        if (layout.nodes[prereqId]) {
          const edge = {
            id: `${prereqId}-${node.id}`,
            from: prereqId,
            to: node.id,
            type: 'upgrade',
            path: calculateEdgePath(layout.nodes[prereqId], layout.nodes[node.id]),
            color: '#6366f1',
            style: {
              strokeWidth: 2,
              strokeDasharray: 'none',
              opacity: 0.8
            }
          }
          layout.edges.push(edge)
          console.log(`  🔗 Connected ${prereqId} → ${node.id}`)
        } else {
          console.warn(`  ⚠️ Missing prerequisite node: ${prereqId} for ${node.id}`)
        }
      })
    }
  })
  
  console.log(`✅ Layout complete: ${Object.keys(layout.nodes).length} nodes, ${layout.edges.length} edges`)
  return layout
}

/**
 * Calculate smooth bezier curve path between nodes
 */
function calculateEdgePath(fromNode, toNode) {
  // Connect from right edge of source card to left edge of target card
  const fromX = fromNode.x + fromNode.width
  const fromY = fromNode.y + fromNode.height / 2
  const toX = toNode.x
  const toY = toNode.y + toNode.height / 2
  
  // Bezier curve for smooth connection with better control points
  const controlOffset = Math.min(100, Math.abs(toX - fromX) / 2)
  const controlX1 = fromX + controlOffset
  const controlX2 = toX - controlOffset
  
  return `M ${fromX} ${fromY} C ${controlX1} ${fromY}, ${controlX2} ${toY}, ${toX} ${toY}`
}

/**
 * Filter layout based on provided filters
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
        node.name.toLowerCase().includes(searchTerm) ||
        node.description?.toLowerCase().includes(searchTerm)
      )
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
