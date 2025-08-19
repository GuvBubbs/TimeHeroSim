# 🌳 Upgrade Tree System - Data Visualization Tool

## Current Status & Goals

**PRIMARY GOAL**: Create a clean, Civilization V-style upgrade tree that serves as a **pure data visualization tool** without any gameplay elements. This is designed to display upgrade relationships and data structures, not to function as an interactive gameplay interface.

**CURRENT STATE**: 
- ✅ Visual layout and node rendering working
- ✅ Data loading and processing complete
- ✅ Clean data-only tooltips (no gameplay status)
- ✅ All gameplay logic removed from visualization
- ❌ **KNOWN ISSUE**: Zoom controls not working (viewTransform reactivity issue between composable and template)

## Overview

The Upgrade Tree is a **Civilization V-style** data visualization system that displays all game upgrades in a hierarchical, left-to-right progression format. It helps developers and users understand the complete upgrade dependency chain and data relationships in the Time Hero game system.

**IMPORTANT**: This is a data visualization tool, not a gameplay interface. It shows upgrade relationships without status indicators, affordability calculations, or other gameplay mechanics.

## 🎯 Key Features

### Visual Design
- **Civilization V Layout**: Horizontal progression from left (early upgrades) to right (late upgrades)
- **Source-Based Swim Lanes**: Each upgrade source (Farm, Blacksmith, Adventure, etc.) gets its own horizontal lane
- **Tier-Based Positioning**: Upgrades are positioned by their dependency tier (0 = no prerequisites, 1 = depends on tier 0, etc.)
- **Data-Only Tooltips**: Hover over any upgrade to see upgrade information, costs, and effects (no gameplay status)
- **Scrollable Container**: The tree can be much wider than the screen - use scroll controls to navigate
- **Non-Functional Zoom Controls**: Zoom buttons are present but currently not working due to reactivity issues

### Pure Data Visualization
- **No Gameplay Elements**: Removed all ownership status, affordability calculations, and gameplay logic
- **Source Colors**: Nodes use their source colors directly without status-based color coding
- **Clean Display**: Focus purely on showing upgrade relationships and data structure
- **No Status Indicators**: Removed colored circles and status overlays that were used in gameplay versions

## 🏗️ System Architecture

### Core Components

#### 1. **UpgradeTree.vue** (Page Container)
- **Purpose**: Main page wrapper that provides the scrollable container
- **Key Features**:
  - Responsive height (`h-[80vh] min-h-[600px]`)
  - Horizontal and vertical scrolling (`overflow-auto`)
  - Houses the main visualization component

#### 2. **UpgradeTreeVisualizationNew.vue** (Main Visualization)
- **Purpose**: SVG-based tree rendering with interactive nodes and connections
- **Key Features**:
  - SVG canvas with calculated dimensions based on tree layout
  - Interactive node circles with hover states
  - Dependency arrows connecting related upgrades
  - Real-time updates based on game state changes

#### 3. **Data-Only Tooltips** (Information Display)
- **Purpose**: Clean upgrade information shown on hover without gameplay elements
- **Key Features**:
  - **Basic Information**: Upgrade name, description, source
  - **Cost Breakdown**: Gold, energy, materials, boss materials
  - **Effects Description**: What the upgrade does
  - **Prerequisites**: What upgrades are required before this one
  - **No Gameplay Status**: Removed affordability checks, ownership status, and time-to-afford calculations
  - **Null-Safe**: Handles missing data gracefully to prevent crashes

### Data Flow Architecture

```
CSV Data Files (data/*.csv)
         ↓
   Game Values Store (gameValues.js)
         ↓
   Upgrade Tree Composable (useUpgradeTree.js)
         ↓
   Tree Layout Engine (treeLayoutEngine.js) [CLEANED: No gameplay logic]
         ↓
   Visualization Component (UpgradeTreeVisualizationNew.vue) [CLEANED: No status indicators]
         ↓
   Data-Only Tooltips [CLEANED: No gameplay status]
```

**Note**: All gameplay-related logic (status calculations, affordability checks, ownership tracking) has been removed to create a pure data visualization tool.

## 🔧 Technical Implementation

### 1. Data Processing Pipeline

#### CSV Data Loading
- Upgrade data is loaded from multiple CSV files in `/data/` directory
- Files include: `town_blacksmith.csv`, `town_agronomist.csv`, `weapons.csv`, `armor_base.csv`, etc.
- Each CSV row becomes a node in the upgrade tree

#### Node Classification
- **Source Classification**: Each upgrade is categorized by its source file (Farm, Blacksmith, Adventure, etc.)
- **Prerequisite Parsing**: Dependencies are parsed from CSV columns (supports semicolon separation)
- **Tier Calculation**: Nodes are assigned tiers based on their dependency depth

#### Layout Engine
- **Global Tier System**: All nodes get tiers calculated globally (not per-source)
- **Swim Lane Layout**: Sources become horizontal lanes with consistent spacing
- **Positioning Algorithm**: Nodes positioned by `(tier × TIER_WIDTH, lane × LANE_HEIGHT)`

### 2. Interactive Features

#### Hover System
- **Tooltip Display**: Clean upgrade information appears when hovering over nodes
- **Data Focus**: Shows upgrade costs, effects, and prerequisites without gameplay status
- **State Management**: Hover state is tracked and managed reactively

#### Pure Visualization
- **No Status Updates**: Tree displays static upgrade relationships without real-time game state
- **Source Colors**: Node colors reflect their data source (Farm=green, Blacksmith=orange, etc.)
- **Data Relationships**: Focus on showing prerequisite chains and upgrade dependencies

### 3. Performance Optimizations

#### Defensive Programming
- **Null Checks**: All data access includes null/undefined checks
- **Error Boundaries**: Components handle missing data gracefully
- **Safe Rendering**: Template guards prevent crashes from incomplete data

#### Efficient Updates
- **Computed Properties**: Layout calculations are cached and only re-run when needed
- **Reactive State**: Vue's reactivity system ensures minimal re-renders
- **SVG Optimization**: Vector graphics provide smooth scaling and interaction

## 📋 Component API Reference

### UpgradeTree.vue
```javascript
// Props: None (page-level component)
// Exports: None (container only)
```

### UpgradeTreeVisualizationNew.vue
```javascript
// Props: None (uses composables for data)
// Key Methods:
// - handleNodeClick(node): Handle node selection
// - handleNodeHover(node): Handle tooltip display
// - isNodeHighlighted(nodeId): Check if node should be emphasized
```

### UpgradeTooltip.vue
```javascript
Props: {
  node: Object,        // The upgrade node to display
  gameState: Object,   // Current game state for cost checking
  position: Object     // { x, y } for tooltip positioning
}

// Key Methods:
// - canAffordResource(type, amount, resourceId): Check affordability
// - formatNumber(num): Display large numbers with K/M suffixes
// - formatMaterialName(id): Convert IDs to readable names
```

### useUpgradeTree.js Composable
```javascript
// Returns:
{
  // State
  sourceStats: Object,     // Upgrade counts by source
  layout: Object,          // Current tree layout data
  selectedNode: Ref,       // Currently selected upgrade
  hoveredNode: Ref,        // Currently hovered upgrade
  
  // Methods
  selectNode(nodeId): void,           // Select a specific upgrade
  clearSelection(): void,             // Clear current selection
  highlightDependencies(nodeId): void // Show dependency chain
}
```

## 🐛 Known Issues

### Critical Issues
1. **Zoom Controls Not Working**
   - **Problem**: Zoom in/out/reset/fit buttons are not functional
   - **Root Cause**: Vue reactivity issue between `useUpgradeInteractions` composable and template
   - **Symptoms**: `viewTransform` values update in composable but show as `undefined` in template
   - **Current State**: Transform values (zoom: 1.1, panX: -49.95) update correctly in logs but don't apply to SVG DOM
   - **Attempted Fixes**: Direct template binding, computed properties, explicit reactivity tracking
   - **Next Steps**: Need to resolve `interactions.viewTransform.zoom/panX/panY` returning undefined in template

### Technical Details
- Functions in `useUpgradeInteractions.js` execute correctly
- `viewTransform.value` updates properly in composable  
- Template watchers detect changes but receive `undefined` values
- SVG transform style remains empty string / "none"
- Issue appears to be Vue 3 reactivity between composable ref exports and template access

## 🎮 User Interaction Guide

### Navigation
1. **Scrolling**: Use mouse wheel or scroll bars to navigate the large tree
2. **Hover Information**: Move mouse over any upgrade to see data tooltip
3. **Node Colors**: Each color represents a different upgrade source (Farm, Blacksmith, Adventure, etc.)
4. **Zoom Controls**: Present but currently non-functional due to reactivity issues

### Understanding the Layout
1. **Left to Right**: Early game upgrades are on the left, late game on the right
2. **Horizontal Lanes**: Each lane represents a different upgrade source (Farm, Blacksmith, etc.)
3. **Arrows**: Lines connect prerequisites to their dependent upgrades
4. **Tiers**: Vertical columns represent dependency tiers (tier 0 = no requirements)

### Tooltip Information
- **Basic Info**: Shows upgrade name, source, and description
- **Cost Section**: Shows what resources are needed to purchase the upgrade
- **Effects Section**: Describes what the upgrade does
- **Prerequisites**: Lists other upgrades required first
- **Note**: No gameplay status (affordability, ownership, time-to-afford) is shown

## 🔍 Troubleshooting

### Current Known Issues

#### Zoom Controls Not Working
- **Symptoms**: Buttons click but no visual change occurs
- **Diagnosis**: Vue reactivity disconnect between composable and template
- **Debug Evidence**: 
  - Composable: `{ zoom: 1.1, panX: -49.95, panY: -30 }` ✅
  - Template: `{ zoom: undefined, panX: undefined, panY: undefined }` ❌
- **Technical Details**: `interactions.viewTransform` properties return undefined despite successful updates in composable

#### Legacy Issues (Resolved)
- **Tooltip Crashes**: Fixed by removing gameplay logic and adding null checks
- **Layout Problems**: Resolved by cleaning up tier calculation and source classification  
- **Missing Upgrades**: Fixed by improving CSV parsing and source mapping

### Debug Tools
- **Browser Console**: Check for JavaScript errors and reactivity issues
- **Vue DevTools**: Inspect component state and composable values
- **Network Tab**: Verify CSV files are loading correctly

## 🚀 Future Enhancements

### Priority Fixes
1. **Fix Zoom Controls**: Resolve Vue reactivity issue preventing zoom functionality
2. **Improve Performance**: Optimize rendering for very large upgrade trees
3. **Enhanced Navigation**: Better scrolling and positioning controls

### Potential Features
- **Search Functionality**: Find specific upgrades by name or effect
- **Filter Controls**: Show/hide specific sources or upgrade types  
- **Export Options**: Save tree layouts or upgrade data
- **Responsive Design**: Better mobile/tablet support

### Technical Improvements
- **Virtual Scrolling**: Handle very large trees more efficiently
- **Lazy Loading**: Load data on-demand for better performance
- **Better Reactivity**: Resolve composable-to-template binding issues

---

## 📝 Developer Notes

This upgrade tree system represents a conversion from a gameplay interface to a **pure data visualization tool**, focusing on:

1. **Data Clarity**: Clean display of upgrade relationships without gameplay noise
2. **Stability**: Comprehensive null checks prevent crashes
3. **Usability**: Intuitive Civilization V-style horizontal progression  
4. **Maintainability**: Clear separation of data visualization from gameplay logic

### Recent Changes
- **Removed all gameplay elements**: No status indicators, affordability checks, or ownership tracking
- **Simplified node colors**: Uses source colors directly instead of status-based coloring
- **Cleaned tooltips**: Shows pure upgrade data without gameplay calculations
- **Removed status functions**: Eliminated `determineNodeStatus`, `canAffordUpgrade`, etc.

### Current Technical State
- **✅ Working**: Data loading, layout calculation, node rendering, hover tooltips
- **❌ Broken**: Zoom controls due to Vue reactivity issues with composable exports
- **🧹 Cleaned**: All gameplay logic successfully removed for pure data visualization

The system is designed to be a developer and user tool for understanding upgrade data structure and relationships, not for actual gameplay interaction.
