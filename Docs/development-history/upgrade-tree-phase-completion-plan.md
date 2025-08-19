# Upgrade Tree Phase Completion Plan
*Development Plan for Functional Node Display and Editing*

## Executive Summary

The upgrade tree system needs to be updated to work with the new comprehensive CSV data structure that includes ID and prerequisite fields across all game systems. This plan outlines the three-phase approach to complete functional data loading, Civilization 5-style node display, and full edit capabilities.

## Current State Analysis

### ✅ Phase 1 COMPLETED (August 19, 2025)
**Status**: Data integration and loading successfully implemented

**Achievements**:
- ✅ Source classification mapping fixed (camelCase vs snake_case issue resolved)
- ✅ Template binding errors resolved (upgrades/layout properly destructured)
- ✅ 439 unified nodes loading successfully from all CSV sources
- ✅ Proper source distribution across 6 swim lanes
- ✅ Export functionality updated for unified nodes structure
- ✅ Debug panel showing real-time loading status

### Data Structure Overview
The game data has been significantly expanded and restructured:

**Total CSV Files**: 30+ files with consistent `id` and `prerequisite`/`prerequisite_blueprint` fields

**Source Mapping** (6 swim lanes):
- `blacksmith` (Ember & Edge) ← town_blacksmith.csv + forge_crafting.csv + weapons.csv
- `agronomist` (Greenwise Co-op) ← town_agronomist.csv + farm_projects.csv + farm_stages.csv + crops.csv
- `land_steward` (County Land Office) ← town_land_steward.csv + phase_transitions.csv
- `carpenter` (Towerwrights Guild) ← town_carpenter.csv + tower_levels.csv
- `skills_trainer` (Field School) ← town_skills_trainer.csv + adventures.csv + xp_progression.csv
- `vendor` (Exchange Post) ← town_material_trader.csv + mining.csv + vendors.csv + boss_materials.csv

**Area Classification** (9 node colors):
- energy, water, forge, hero, housing, tower, storage, materials, deeds

### File Inclusion Matrix

#### ✅ **INCLUDED Files**
| File | Source | Area | Type |
|------|--------|------|------|
| town_blacksmith.csv | blacksmith | forge | Blueprints |
| town_agronomist.csv | agronomist | energy/water | Blueprints |
| town_land_steward.csv | land_steward | deeds | Blueprints |
| town_carpenter.csv | carpenter | housing/tower | Blueprints |
| town_skills_trainer.csv | skills_trainer | hero | Blueprints |
| town_material_trader.csv | vendor | materials | Blueprints |
| forge_crafting.csv | blacksmith | forge | Crafted Items |
| farm_projects.csv | agronomist | energy/storage | Built Items |
| farm_stages.csv | agronomist | deeds | Property |
| adventures.csv | skills_trainer | hero | Adventures |
| crops.csv | agronomist | energy | Crops |
| mining.csv | vendor | materials | Mining |
| weapons.csv | blacksmith | forge | Weapons |
| tower_levels.csv | carpenter | tower | Buildings |
| vendors.csv | vendor | materials | Vendors |
| boss_materials.csv | vendor | materials | Materials |
| phase_transitions.csv | land_steward | deeds | Progression |
| xp_progression.csv | skills_trainer | hero | Progression |

#### ❌ **EXCLUDED Files** (Per User Requirements)
- Combat tab: `armor_*.csv`, `enemy_types_*.csv`, `route_*.csv`
- Tools & Refinement: `tools.csv`, `material_refinement.csv`
- Helper/Gnome tabs: `helpers.csv`, `gnome_roles.csv`, `helper_roles.csv`

### Technical Challenges Identified

1. **Data Loading**: Current system expects old vendor-based structure
2. **Dependency Parsing**: Multiple prerequisite field names (`prerequisite`, `prerequisite_blueprint`)
3. **Source Mapping**: Need logic to map items to sources beyond town_*.csv files
4. **Area Classification**: Need logic to determine node colors based on item type/category
5. **Cross-file Dependencies**: Items can depend on items from other CSV files

## Three-Phase Implementation Plan

### ✅ **Phase 1: Data Integration & Loading** - COMPLETED
*Completed: August 19, 2025*

#### ✅ 1.1 Update Data Importers
- **File**: `src/utils/importers.js`
- **Completed**: Added loading for all included CSV files with camelCase source names
- **Fixed**: Handled both `prerequisite` and `prerequisite_blueprint` fields

#### ✅ 1.2 Create Source/Area Mapping Engine  
- **File**: `src/utils/nodeClassification.js` (created)
- **Completed**: Source classification logic implemented with proper camelCase mappings
- **Result**: 439 nodes successfully distributed across sources instead of all "unknown"

#### ✅ 1.3 Update Dependency Parser
- **File**: `src/utils/upgradePrerequisites.js`
- **Status**: Basic parsing working, handles semicolon-separated prerequisites

#### ✅ 1.4 Update useUpgradeTree Composable
- **File**: `src/composables/useUpgradeTree.js`
- **Completed**: Updated to process unified node structure from all CSV sources
- **Fixed**: Template binding issues resolved

### 🎨 **Phase 2: Visual Design & Layout** - 70% COMPLETE
*Started: August 19, 2025*

#### ✅ 2.1 Design Civ 5-Style Card Components
- **File**: `src/components/UpgradeNode.vue` (created)
- **Completed**: 
  - Rounded rectangular cards (200x120px, Civ 5-style)
  - Area-based icons and color coding (9 areas)
  - Visual states for available/locked/owned with status badges
  - Hover effects with scale transforms and selection highlighting
  - Cost display with resource icons and source labeling
  - Prerequisites indicator badge
- **Result**: Professional card-based UI replacing old circle nodes

#### 🔄 2.2 Update Tree Visualization (In Progress)
- **File**: `src/components/UpgradeTreeVisualization.vue`
- **Completed**: 
  - Replaced SVG circle nodes with HTML card components
  - Hybrid layout (SVG for connections, HTML for cards)
  - Component imports and interactive event handling
  - Zoom/pan transform compatibility
- **Remaining**: Source swim lane headers and card grid positioning

#### 🔄 2.3 Dependency Line Rendering (Partial)
- **Current State**: Existing SVG connection system functional
- **Remaining**: Optimize connection points for card centers
- **Future**: Different line styles for dependency types

### ⚙️ **Phase 3: Edit Functionality**
*Target: 2-3 days*

#### 3.1 Create Edit Modal Component
- **File**: `src/components/EditNodeModal.vue` (new)
- **Features**:
  - Form fields for all editable properties
  - Field validation (required fields, numeric constraints)
  - Preview of changes before saving
  - Cancel/Save actions

#### 3.2 Implement CSV Write-back
- **File**: `src/utils/csvWriter.js` (new)
- **Functionality**:
  - Convert modified data back to CSV format
  - Preserve field order and formatting
  - Handle file download or server upload
  - Autosave on successful validation

#### 3.3 Add Edit Integration
- **Files**: Update tree visualization and modal handling
- **Flow**: Click node → Open modal → Edit fields → Auto-save → Refresh display

## Technical Implementation Details

### Data Flow Architecture
```
CSV Files → importers.js → nodeClassification.js → useUpgradeTree.js → UpgradeTreeVisualization.vue
     ↑                                                                              ↓
csvWriter.js ← EditNodeModal.vue ← [User Clicks Node] ← UpgradeNode.vue ←─────────┘
```

### Node Data Structure
```javascript
{
  id: string,           // Unique identifier
  name: string,         // Display name
  source: string,       // Which swim lane (blacksmith, agronomist, etc.)
  area: string,         // Color classification (energy, forge, etc.)
  prerequisites: [],    // Array of prerequisite IDs
  csvSource: string,    // Original file name
  rawData: object,      // Complete original CSV row
  position: {x, y},     // Calculated layout position
  isAvailable: boolean, // Computed availability
  isLocked: boolean     // Computed lock state
}
```

### Risk Mitigation

#### Data Loading Risks
- **Risk**: CSV structure variations between files
- **Mitigation**: Robust field mapping with fallbacks
- **Testing**: Validate data loading with sample from each CSV

#### Performance Risks  
- **Risk**: Large number of nodes causing UI lag
- **Mitigation**: Virtual scrolling and selective rendering
- **Testing**: Load test with full dataset

#### Dependency Complexity
- **Risk**: Circular or invalid dependencies
- **Mitigation**: Dependency validation and cycle detection
- **Testing**: Unit tests for dependency resolution

## Success Criteria

### ✅ Phase 1 Complete
- [x] All included CSV files loading successfully
- [x] Nodes appearing in upgrade tree (439 nodes detected)
- [x] Source swim lanes populated correctly (6 sources with proper distribution)
- [x] Basic dependency parsing working
- [x] Template binding errors resolved
- [x] Debug panel showing loading status

### 🎯 Phase 2 Complete  
- [x] Civ 5-style card nodes displaying instead of circles
- [x] Proper area color coding with left border accents
- [x] Status badges for owned/available/locked states
- [x] Hover effects and selection highlighting
- [x] Cost display with resource icons
- [ ] Source swim lane headers with vendor names  
- [ ] Clean dependency line rendering between cards
- [ ] Grid-based card positioning within lanes
- [ ] Smooth zoom/pan interactions (partially working)

### ⚙️ Phase 3 Complete
- [ ] Click node opens edit modal
- [ ] All fields editable with validation
- [ ] Changes save back to CSV files
- [ ] Tree updates after edits
- [ ] No data loss or corruption

## Next Steps

### ✅ Completed: Phase 1 Data Integration (August 19, 2025)
- Data loading pipeline functional with 439 unified nodes
- Source classification working correctly 
- Template binding issues resolved

### 🎯 Current Focus: Phase 2 Visual Design (70% Complete - August 19, 2025)
1. **✅ Day 1**: Created Civ 5-style UpgradeNode.vue component with card design
2. **✅ Day 1**: Updated UpgradeTreeVisualization.vue for card layout integration
3. **🔄 Day 2**: Implement source swim lane headers and grid positioning  
4. **📋 Day 3**: Optimize dependency line rendering and polish visual effects

### 📋 Upcoming: Phase 3 Edit Functionality (Target: Week 4)
- Edit modal component creation
- CSV write-back implementation
- Full CRUD operations testing

## Phase 2 Implementation Priority

### High Priority (Core Features)
1. **UpgradeNode Card Component**: Civ 5-style rectangular cards with proper sizing
2. **Swim Lane Layout**: 6 source-based vertical lanes with headers
3. **Area Color Coding**: 9-color system based on node area classification
4. **Basic Interactivity**: Hover states and click selection

### Medium Priority (Polish)
1. **Dependency Lines**: SVG connection lines between related cards
2. **Zoom/Pan Controls**: Smooth navigation for large trees
3. **Loading States**: Skeleton cards during data loading

### Lower Priority (Enhancement)
1. **Advanced Animations**: Card entrance/exit transitions
2. **Performance Optimization**: Virtual scrolling for large datasets

## Questions for Clarification

1. **CSV Write-back**: Should edited files be downloaded or uploaded to server?
2. **Validation Rules**: Are there specific constraints on field values?
3. **Node Grouping**: Should nodes be visually grouped within swim lanes?
4. **Dependency Types**: Should different prerequisite types have different visual styles?

---

*This plan provides a comprehensive roadmap to complete the upgrade tree functionality with full data integration, visual polish, and edit capabilities.*
