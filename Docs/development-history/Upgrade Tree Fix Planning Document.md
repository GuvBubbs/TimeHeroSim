# Time Hero Simulator - Upgrade Tree Fix Planning Document

## Executive Summary
The upgrade tree visualization is experiencing critical layout issues with canvas dimensions of 2120×24645 pixels (should be wide, not tall). This document provides a targeted surgical fix plan to stabilize the Civilization V-style upgrade tree without adding new features.

## Audit Summary

### 1. **CRITICAL: Geometry Issue (Blocker)**
**Current State**: Canvas is 2120×24645 pixels (extremely tall)
**Expected**: Canvas should be wide (many tiers across X-axis) not tall

**Root Cause Analysis**:
- File: `src/utils/treeLayoutEngine.js`
- Line: ~145-170 (calculateSourceTreeLayout function)
- Issue: Nodes are positioned vertically within swim lanes. Tier calculation happens per-source instead of globally
- Current logic: Each source group calculates its own tiers (0-N), causing vertical stacking

### 2. **Missing Prerequisites Issue**
**Current State**: 113 unique missing prerequisites (anvil_1, anvil_2, etc.)
**Location**: Prerequisites defined in CSVs but nodes not created

**Root Cause**:
- File: `src/utils/nodeClassification.js`
- Line: ~124 (parsePrerequisites function)
- Issue: Prerequisites use semicolons (`;`) in CSV but parser expects commas (`,`)
- Example: `"blueprint_hoe_plus;anvil_1"` should create two prerequisites

### 3. **Source Classification Issue**
**Current State**: 59 nodes in "unknown" source
**Expected**: All nodes should map to proper sources

**Root Cause**:
- File: `src/utils/nodeClassification.js`  
- Line: ~77-95 (classifySource function)
- Issue: Missing mappings for CSV filenames like `town_blacksmith`, `town_agronomist`, etc.

### 4. **Global vs Per-Lane Tiering**
**Current State**: Tiers calculated per source group
**Expected**: Global tier calculation across all nodes

**Root Cause**:
- File: `src/utils/treeLayoutEngine.js`
- Line: ~55-85 (calculateNodeTiers function)
- Issue: Function called per source group, not on entire node set

## Fix Plan

### Stage 1: Fix Prerequisites Parsing (High Priority)
**File**: `src/utils/nodeClassification.js`
**Function**: `parsePrerequisites` (line ~124)

```javascript
// CURRENT (line 124-136)
export function parsePrerequisites(row) {
  const prerequisites = []
  
  if (row.prerequisite) {
    prerequisites.push(String(row.prerequisite))
  }
  
  if (row.prerequisites) {
    const prereqs = String(row.prerequisites).split(',').map(p => p.trim()).filter(p => p)
    prerequisites.push(...prereqs)
  }
  
  // ... rest of function
}

// FIXED
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
  
  // ... rest of function
}
```

### Stage 2: Fix Source Classification
**File**: `src/utils/nodeClassification.js`
**Function**: `classifySource` (line ~77)

```javascript
// CURRENT (line 77-95)
export function classifySource(filename, row) {
  const file = filename.toLowerCase()
  
  // Town vendors
  if (file.includes('blacksmith')) return 'blacksmith'
  // ... etc
}

// FIXED
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
```

### Stage 3: Fix Global Tier Calculation (Critical)
**File**: `src/utils/treeLayoutEngine.js`
**Function**: `calculateSourceTreeLayout` (line ~145)

```javascript
// FIXED VERSION
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
  const TIER_WIDTH = 200       // Increased from 180 for better spacing
  const NODE_HEIGHT = 60        // Reduced from 70 for compactness
  const NODE_WIDTH = 160        // Increased from 140 for readability
  const NODE_MARGIN = 10        // Reduced from 15
  const SOURCE_HEADER = 40      // Reduced from 60
  const SOURCE_MARGIN = 20      // Reduced from 30
  const LEFT_MARGIN = 180       // Reduced from 220
  
  let currentY = 20
  const maxTier = Math.max(...Object.values(globalNodeMap).map(n => n.tier))
  
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
          tier: parseInt(tier),
          status: determineNodeStatus(node, gameState),
          canAfford: canAffordUpgrade(node, gameState),
          isOwned: gameState.ownedUpgrades?.includes(node.id) || false
        }
        
        layout.nodes[node.id] = layoutNode
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
  
  // Create edges (unchanged)
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
              opacity: 0.6
            }
          }
          layout.edges.push(edge)
        } else {
          console.warn(`  ⚠️ Missing prerequisite node: ${prereqId} for ${node.id}`)
        }
      })
    }
  })
  
  console.log(`✅ Layout complete: ${Object.keys(layout.nodes).length} nodes, ${layout.edges.length} edges`)
  return layout
}
```

### Stage 4: Add Missing Prerequisites Warning (Optional Enhancement)
**File**: `src/composables/useUpgradeTree.js`
**Location**: After calculateLayout call

```javascript
// Add after line ~200 in calculateLayout function
// Log missing prerequisites once
const missingPrereqs = new Set()
Object.values(layout.value?.nodes || {}).forEach(node => {
  if (node.prerequisites) {
    node.prerequisites.forEach(prereqId => {
      if (!layout.value.nodes[prereqId] && !missingPrereqs.has(prereqId)) {
        missingPrereqs.add(prereqId)
      }
    })
  }
})

if (missingPrereqs.size > 0) {
  console.warn(`📋 Missing prerequisites (${missingPrereqs.size} unique):`, Array.from(missingPrereqs).sort())
}
```

## Verification Steps

### Stage 1 Verification (Prerequisites)
1. Open browser console
2. Look for parsed prerequisites with multiple values
3. Verify: `blueprint_hoe_plus` should have prerequisites: `['blueprint_hoe', 'anvil_1']`

### Stage 2 Verification (Source Classification)
1. Check overlay stats
2. Verify: "unknown" source count should be near 0
3. Verify: "blacksmith" should contain ~79 nodes

### Stage 3 Verification (Global Tiers)
1. Check overlay stats
2. Verify: Max tier should be > 5 (indicating dependency depth)
3. Verify: Canvas width > height (e.g., 2400×800 instead of 2120×24645)

### Stage 4 Verification (Missing Prerequisites)
1. Check console for warning
2. Should list items like `anvil_1`, `anvil_2`, etc.
3. Count should match the 113 unique missing prerequisites

## Implementation Order

1. **Stage 1**: Fix prerequisite parsing (5 minutes)
   - Immediate impact on edge connections
   - Low risk change

2. **Stage 3**: Fix global tier calculation (10 minutes)
   - Critical for fixing geometry
   - Moderate risk - requires testing

3. **Stage 2**: Fix source classification (5 minutes)
   - Improves organization
   - Low risk change

4. **Stage 4**: Add logging (2 minutes)
   - Optional but helpful
   - Zero risk

## Expected Outcomes

### Before Fix
- Canvas: 2120×24645 pixels
- Max tier: 0-2 per lane
- Missing edges: 211
- Unknown source: 59 nodes

### After Fix
- Canvas: ~2400×800 pixels
- Max tier: 8-12 globally
- Missing edges: Reduced (forge upgrades still missing)
- Unknown source: <10 nodes

## Testing Checklist
- [ ] Canvas is wider than tall
- [ ] Nodes align horizontally by dependency depth
- [ ] Prerequisites parse correctly with semicolons
- [ ] Town vendor nodes map to correct sources
- [ ] Console shows missing prerequisites warning
- [ ] Edges connect properly between nodes
- [ ] No JavaScript errors in console

## Notes
- No new features added
- No schema changes
- All changes are internal logic fixes
- Public interfaces preserved
- Small, targeted diffs only