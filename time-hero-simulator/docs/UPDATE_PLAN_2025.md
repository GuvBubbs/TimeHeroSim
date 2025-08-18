# Time Hero Simulator - Comprehensive Update Plan 2025

## Executive Summary
This document outlines the phased approach to update the Time Hero Simulator to match the new game design. The update will be implemented in 5 major phases over approximately 6-8 weeks.

## Major Changes Overview

### Core System Changes
1. **Real-time progression** - All timers use real-world minutes/hours (not game time)
2. **Screen-based navigation** - 6 main screens: Home/Farm, Tower, Town, Adventure, Forge, Mine
3. **Combat system** - Weapon types, armor, HP/defense mechanics
4. **Helper (Gnome) system** - Role-based automation with 5 rescuable gnomes
5. **Material refinement** - Raw materials must be refined at forge before use
6. **Offline progression** - Game continues while suspended/locked
7. **Phase progression** - Based on farm expansions via land deeds (not time-based)

### Data Structure Changes
- Crops: Now have Seed Levels (0-9) instead of unlock days
- Adventures: Include enemy types, boss materials, combat requirements
- Upgrades: Categorized by vendor (Blacksmith, Agronomist, etc.)
- New systems: Weapons, Armor, Tools, Helpers, Mining depths, Tower levels

---

## Phase 1: Data Configuration & CSV Updates
**Duration: 1 week**
**Priority: Critical - Foundation for all other work**

### 1.1 Create New CSV Files
Create the following new CSV files in `/data/`:

#### `weapons.csv`
```csv
id,name,type,level,goldCost,materials,damage,attackSpeed,advantageVs,effect
spear_1,Spear,spear,1,100,"wood:5,stone:3",10,1.0,armored_insects,
spear_2,Spear II,spear,2,250,"wood:8,copper:5",15,1.0,armored_insects,
...
```

#### `armor.csv`
```csv
id,name,defenseRating,upgradePotential,specialEffect,dropRoute,dropWeight
leather_armor,Leather Armor,5,poor,none,meadow_path,0.35
...
```

#### `tools.csv`
```csv
id,name,tier,category,goldCost,materials,effect,unlocks
hoe,Hoe,base,farm,50,"stone:5,wood:3",till_soil,plots_8
hoe_plus,Hoe+,plus,farm,750,"iron:10,wood:5,pine_resin:1",till_2x_speed,plots_20
...
```

#### `helpers.csv`
```csv
id,name,rescueRoute,role,baseEffect,levelEffect,maxLevel
gnome_1,Forest Gnome,dark_forest,variable,varies,varies,10
...
```

#### `mining.csv`
```csv
depth,name,depthRange,energyDrain,materials,runtime1500
1,Surface Shaft,0_500,2,"stone:8-12",12.5h
2,Copper Vein,500_1000,4,"copper:6-8,stone:4-6",6.25h
...
```

#### `tower.csv`
```csv
reachLevel,windLevel,seedLevel,goldCost,energyCost,materials,prerequisite
2,Breeze,0,100,50,"wood:10",tower_built
3,Gust,1,500,200,"wood:15,copper:5",reach_2
...
```

#### `vendors.csv`
```csv
id,name,category,items,location,prerequisite
blacksmith,Ember & Edge,tools,"hoe,hammer,axe,pickaxe,weapons,forge_upgrades",town,first_adventure
agronomist,Greenwise Co-op,farm,"energy_storage,water_systems,seed_storage",town,none
...
```

### 1.2 Update Existing CSV Files

#### Update `crops.csv`
- Remove `unlockDay` column
- Add `seedLevel` column (0-9)
- Add `stages` column for growth stages
- Update growth times to match new design
- Add all 30 crops from new design

#### Update `adventures.csv`
- Add enemy composition columns
- Add boss information
- Add armor drop tables
- Add first clear bonuses
- Update energy costs and durations

#### Update `upgrades.csv`
- Reorganize by vendor categories
- Add prerequisite chains
- Add material costs (not just gold/energy)
- Add building effects

### 1.3 Create JSON Configuration Files

#### `game_config.json`
```json
{
  "phases": {
    "tutorial": { "plots": "3-8", "energyCap": 50 },
    "early": { "plots": "8-20", "energyCap": 150 },
    "mid": { "plots": "20-40", "energyCap": 1500 },
    "late": { "plots": "40-65", "energyCap": 6000 },
    "endgame": { "plots": "65-90", "energyCap": 20000 }
  },
  "combat": {
    "weaponTriangle": {
      "spear": { "advantage": "armored_insects", "disadvantage": "sword" },
      "sword": { "advantage": "predatory_beasts", "disadvantage": "bow" },
      ...
    }
  }
}
```

### 1.4 Update Game Configuration Page
- Add new tabs for each data type
- Implement CSV import/export for new files
- Add validation for new data structures
- Create helpful tooltips explaining each field

---

## Phase 2: Upgrade Tree System Overhaul
**Duration: 1 week**
**Priority: High - Visual representation of progression**

### 2.1 Vendor-Based Categorization
Update the upgrade tree to show categories by vendor:
- **Blacksmith**: Tools, Weapons, Forge upgrades
- **Agronomist**: Energy storage, Water systems, Material storage
- **Land Steward**: Land deeds (Homestead, Manor, Estate)
- **Carpenter**: Tower reaches, Nets, Auto-catchers, Gnome housing
- **Skills Trainer**: Carry capacity ranks

### 2.2 Prerequisite Visualization
- Show dependency lines between upgrades
- Highlight farm stage requirements (🏡 icons)
- Color-code by availability:
  - Green: Owned
  - Yellow: Available
  - Orange: Prerequisites not met
  - Red: Locked by farm stage

### 2.3 Multi-Currency Display
Update cost display to show:
- Gold cost
- Energy cost
- Material costs (stone, copper, iron, silver, crystal, mythril, obsidian)
- Boss materials required

### 2.4 Interactive Features
- Click to view detailed upgrade info
- Show "time to afford" calculations
- Filter by vendor/category
- Search functionality
- Export upgrade path as report

---

## Phase 3: Core Simulation Engine Rewrite
**Duration: 2 weeks**
**Priority: Critical - Heart of the simulator**

### 3.1 New State Structure
```javascript
gameState = {
  // Time tracking (real-world minutes)
  time: { 
    realMinutesElapsed: 0,
    lastUpdate: Date.now()
  },
  
  // Hero stats
  hero: {
    level: 1,
    xp: 0,
    hp: { current: 120, max: 120 },
    location: 'home', // home/tower/town/adventure/forge/mine
    carryCapacity: 1
  },
  
  // Resources
  resources: {
    energy: { current: 0, cap: 50 },
    gold: 0,
    seeds: { /* by type */ },
    materials: {
      raw: { stone: 0, copper: 0, iron: 0, silver: 0, crystal: 0, mythril: 0, obsidian: 0 },
      refined: { stone: 0, copper: 0, iron: 0, silver: 0, crystal: 0, mythril: 0, obsidian: 0 },
      boss: { pine_resin: 0, shadow_bark: 0, mountain_stone: 0, cave_crystal: 0, frozen_heart: 0, molten_core: 0 }
    }
  },
  
  // Farm system
  farm: {
    stage: 1, // 1-5 (Starter/Small/Homestead/Manor/Estate)
    plots: [], // Array of plot objects
    waterTank: { current: 20, max: 20 },
    cleanups: [], // Available cleanups
    offscreenActions: [] // Wood gathering actions
  },
  
  // Tower system
  tower: {
    reachLevel: 1,
    nets: 0,
    autoCatcher: 0,
    seedInventory: {}
  },
  
  // Combat system
  combat: {
    weapons: { owned: [], equipped: [null, null] },
    armor: { owned: [], equipped: null }
  },
  
  // Adventure system
  adventure: {
    current: null, // { route, length, startTime, enemyRoll }
    completed: [], // History of completed adventures
    firstClears: [] // Routes cleared on Long for first time
  },
  
  // Mining system
  mining: {
    currentDepth: 0,
    active: false,
    energyDrainRate: 0,
    shortcuts: [], // Unlocked depth shortcuts
    materialsCollected: {}
  },
  
  // Forge system
  forge: {
    queue: [], // Crafting queue
    currentCraft: null,
    heatLevel: 0,
    bellowsTier: 0,
    furnaceTier: 0,
    anvilTier: 0
  },
  
  // Helper system
  helpers: {
    rescued: [], // Which gnomes have been rescued
    active: [], // Active gnomes with roles
    housing: 0, // Housing capacity
    training: [] // Training queue
  },
  
  // Progression tracking
  progression: {
    phase: 'tutorial',
    upgrades: { owned: [], blueprints: [] },
    tools: { owned: [], equipped: {} },
    questsCompleted: [],
    milestonesReached: []
  },
  
  // Screen time tracking
  screenTime: {
    home: 0,
    tower: 0,
    town: 0,
    adventure: 0,
    forge: 0,
    mine: 0
  }
}
```

### 3.2 Simulation Loop Updates

#### Main Loop (every simulated minute)
```javascript
function simulateMinute(state, params) {
  // Update real-time tracking
  state.time.realMinutesElapsed++
  
  // Check player availability
  if (isPlayerActive(state.time, params)) {
    // Player is active
    processPlayerActions(state, params)
    updateScreenTime(state)
  }
  
  // Process background systems (always run)
  processFarmGrowth(state)
  processAutoCatcher(state)
  processHelpers(state)
  processMining(state)
  processForge(state)
  processAdventure(state)
  
  // Check for phase transitions
  checkPhaseTransition(state)
  
  // Log events
  logStateChanges(state)
}
```

### 3.3 System-Specific Engines

#### Farm Engine
```javascript
function processFarmGrowth(state) {
  state.farm.plots.forEach(plot => {
    if (plot.crop && plot.watered) {
      plot.growthProgress += 1 // minute
      
      // Check if ready to harvest
      const crop = getCropData(plot.crop)
      if (plot.growthProgress >= crop.growthTime) {
        plot.readyToHarvest = true
      }
    }
    
    // Water consumption
    if (plot.watered) {
      plot.waterRemaining -= WATER_CONSUMPTION_RATE
      if (plot.waterRemaining <= 0) {
        plot.watered = false
      }
    }
  })
}
```

#### Combat Engine
```javascript
function processAdventure(state) {
  if (!state.adventure.current) return
  
  const adventure = state.adventure.current
  const elapsed = state.time.realMinutesElapsed - adventure.startTime
  
  // Check if adventure complete
  if (elapsed >= adventure.duration) {
    completeAdventure(state, adventure)
  } else {
    // Calculate combat progress
    const progress = elapsed / adventure.duration
    adventure.wavesCleared = Math.floor(progress * adventure.totalWaves)
    
    // Apply damage based on enemy composition
    const damage = calculateCombatDamage(state, adventure)
    state.hero.hp.current -= damage
    
    // Check for failure
    if (state.hero.hp.current <= 0) {
      failAdventure(state, adventure)
    }
  }
}
```

#### Helper Engine
```javascript
function processHelpers(state) {
  state.helpers.active.forEach(helper => {
    switch(helper.role) {
      case 'waterer':
        waterPlots(state, helper.efficiency)
        break
      case 'pump_operator':
        generateWater(state, helper.efficiency)
        break
      case 'sower':
        plantSeeds(state, helper.efficiency)
        break
      case 'harvester':
        harvestCrops(state, helper.efficiency)
        break
      // ... other roles
    }
  })
}
```

### 3.4 Player Behavior Simulation

#### Decision Making
```javascript
function makePlayerDecision(state, params) {
  const priorities = calculatePriorities(state, params)
  
  // Priority system based on player archetype
  if (state.resources.energy.current / state.resources.energy.cap > 0.8) {
    // Energy nearly full - spend it
    return startAdventure(state, params)
  } else if (needsWater(state)) {
    // Crops need water
    return pumpWater(state)
  } else if (hasReadyCrops(state)) {
    // Harvest ready crops
    return harvestCrops(state)
  } else if (canPlant(state)) {
    // Plant new crops
    return plantCrops(state)
  } else if (canUpgrade(state)) {
    // Purchase upgrade
    return purchaseUpgrade(state, params)
  }
  
  return null // Idle
}
```

### 3.5 Offline Progression
```javascript
function calculateOfflineProgress(state, offlineMinutes) {
  const summary = {
    timeAway: offlineMinutes,
    energyGained: 0,
    seedsCollected: 0,
    adventuresCompleted: 0,
    miningMaterials: {},
    craftingCompleted: []
  }
  
  // Cap at 24 hours
  const minutesToProcess = Math.min(offlineMinutes, 1440)
  
  // Process each system
  summary.energyGained = calculateOfflineFarmProgress(state, minutesToProcess)
  summary.seedsCollected = calculateOfflineTowerProgress(state, minutesToProcess)
  // ... etc
  
  return summary
}
```

---

## Phase 4: UI Updates for New Systems
**Duration: 1 week**
**Priority: Medium - Visualization of new systems**

### 4.1 Update Live Monitor Page

#### Screen Layout Display
```vue
<template>
  <div class="game-world-layout">
    <!-- T-shaped layout -->
    <div class="top-screen" :class="{ active: hero.location === 'tower' }">
      🗼 Tower
      <div class="time-spent">{{ screenTime.tower }}min</div>
    </div>
    
    <div class="middle-row">
      <div class="screen" :class="{ active: hero.location === 'town' }">
        🏰 Town
      </div>
      <div class="screen home" :class="{ active: hero.location === 'home' }">
        🌱 Home/Farm
      </div>
      <div class="screen">📜 Signpost</div>
      <div class="screen" :class="{ active: hero.location === 'adventure' }">
        ⚔️ Adventure
      </div>
    </div>
    
    <div class="bottom-screens">
      <div class="screen" :class="{ active: hero.location === 'forge' }">
        ⚒️ Forge
      </div>
      <div class="screen" :class="{ active: hero.location === 'mine' }">
        ⛏️ Mine
      </div>
    </div>
  </div>
</template>
```

### 4.2 New Components

#### Helper Management Panel
```vue
<HelperPanel>
  - Show rescued gnomes
  - Role assignment interface
  - Training queue
  - Efficiency display
  - Housing requirements
</HelperPanel>
```

#### Combat Simulator Panel
```vue
<CombatPanel>
  - Weapon loadout selector
  - Enemy composition display
  - Risk assessment
  - Damage calculations
  - Boss strategy hints
</CombatPanel>
```

#### Mining Depth Tracker
```vue
<MiningTracker>
  - Current depth visualization
  - Energy drain rate
  - Material collection log
  - Shortcut unlocks
  - Runtime estimates
</MiningTracker>
```

### 4.3 Update Control Panel
Add controls for:
- Helper behavior settings
- Combat preferences
- Mining strategy
- Forge priorities
- Tower catching patterns

---

## Phase 5: Reports & Analysis Updates
**Duration: 1 week**
**Priority: Low - Can be done after core systems work**

### 5.1 New Metrics

#### Combat Metrics
- Win/loss ratio by route
- Average HP remaining
- Weapon usage distribution
- Armor effectiveness
- Boss kill times

#### Helper Metrics
- Helper utilization rate
- Role distribution
- Training efficiency
- Automation percentage
- Rescue timing

#### Screen Time Analysis
- Time per screen (absolute and %)
- Visit frequency
- Session duration per screen
- Screen transition patterns
- Bottleneck identification

### 5.2 New Reports

#### Phase Progression Report
```
Phase Timeline:
- Tutorial: X minutes (Target: 60-120)
- Early: X hours (Target: 2-3 days)
- Mid: X days (Target: 4-5 days)
- Late: X days (Target: 7 days)
- Endgame: X days (Target: 7-14 days)

Key Milestones:
✓ First helper discovered: Day X (Target: 4-5)
✓ First farm expansion: Day X (Target: 5-6)
✓ Crystal materials obtained: Day X (Target: 11-13)
⚠️ Mythril discovered: Day X (Target: 14-16) - DELAYED

Bottlenecks Identified:
- Day 12: Silver shortage delayed Crystal Pick
- Day 18: Energy storage capped 34% of time
```

#### Helper System Report
```
Helper Discovery:
- Gnome 1: Dark Forest - Day X
- Gnome 2: Mountain Pass - Day X
- Gnome 3: Crystal Caves - Day X
- Gnome 4: Frozen Tundra - Day X
- Gnome 5: Volcano Core - Day X

Role Assignments:
- Waterer: 2 gnomes (40%)
- Harvester: 1 gnome (20%)
- Pump Operator: 1 gnome (20%)
- Miner's Friend: 1 gnome (20%)

Automation Impact:
- Manual tasks reduced by: 65%
- Farm efficiency increased: 230%
- Energy generation boost: 180%
```

### 5.3 Export Formats
Update export to include:
- Helper configurations
- Combat loadouts
- Screen time breakdowns
- Material flow rates
- Offline progression calculations

---

## Implementation Schedule

### Week 1: Data Configuration
- [ ] Day 1-2: Create new CSV files
- [ ] Day 3-4: Update existing CSVs
- [ ] Day 5: Update Game Configuration page
- [ ] Weekend: Testing and validation

### Week 2: Upgrade Trees
- [ ] Day 1-2: Vendor categorization
- [ ] Day 3-4: Prerequisite visualization
- [ ] Day 5: Interactive features
- [ ] Weekend: Polish and testing

### Week 3-4: Simulation Engine
- [ ] Week 3: Core state structure and main loop
- [ ] Week 3: Farm, Tower, and Helper systems
- [ ] Week 4: Combat, Mining, and Forge systems
- [ ] Week 4: Offline progression and testing

### Week 5: UI Updates
- [ ] Day 1-2: Live Monitor updates
- [ ] Day 3-4: New component creation
- [ ] Day 5: Control Panel updates
- [ ] Weekend: Integration testing

### Week 6: Reports & Analysis
- [ ] Day 1-2: New metrics implementation
- [ ] Day 3-4: Report generation
- [ ] Day 5: Export format updates
- [ ] Weekend: Final testing

### Week 7-8: Buffer & Polish
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] User acceptance testing

---

## Testing Strategy

### Unit Tests
- Test each system engine independently
- Validate state transitions
- Check resource calculations
- Verify combat formulas

### Integration Tests
- Test system interactions
- Validate phase transitions
- Check helper automation
- Verify offline progression

### Validation Tests
Run all tests from `simulator-validation-tests.md`:
- Phase timing validation
- Player archetype tests
- System-specific validation
- Bottleneck detection
- Screen time distribution

### Performance Tests
- 1000+ Monte Carlo runs
- Full 30-day simulations
- Memory usage monitoring
- Web Worker efficiency

---

## Risk Mitigation

### Technical Risks
1. **Data migration complexity**
   - Mitigation: Keep old data files as backup
   - Create migration scripts
   - Version control all changes

2. **Simulation accuracy**
   - Mitigation: Extensive testing against design docs
   - Regular validation runs
   - Side-by-side comparison with old system

3. **Performance impact**
   - Mitigation: Profile after each phase
   - Use Web Workers for heavy computation
   - Implement caching strategies

### Schedule Risks
1. **Scope creep**
   - Mitigation: Stick to phased approach
   - Defer nice-to-have features
   - Regular progress reviews

2. **Testing delays**
   - Mitigation: Test continuously
   - Automate validation tests
   - Parallel testing during development

---

## Success Criteria

The update is successful when:

1. **All new systems implemented**
   - ✓ Combat with weapons and armor
   - ✓ Helper system with 5 gnomes
   - ✓ Tower seed catching
   - ✓ Forge crafting
   - ✓ Mining with depths
   - ✓ Town vendors

2. **Simulation accuracy**
   - ✓ Phase timing within ±10% of targets
   - ✓ Helper discovery at correct times
   - ✓ Resource generation matches formulas
   - ✓ Combat outcomes are deterministic

3. **Performance maintained**
   - ✓ 30-day simulation < 10 seconds
   - ✓ UI remains responsive
   - ✓ Memory usage < 500MB
   - ✓ Monte Carlo 100 runs < 30 seconds

4. **Data integrity**
   - ✓ All game values preserved
   - ✓ No modification of imported data
   - ✓ Clear separation of game/simulation rules
   - ✓ Version controlled configuration

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Create feature branches** for each phase
3. **Set up testing infrastructure**
4. **Begin Phase 1** with CSV creation
5. **Schedule weekly progress reviews**

---

## Appendix: Key Files to Update

### Phase 1 Files
- `/data/*.csv` - All CSV files
- `/src/stores/gameValues.js` - Add new data structures
- `/src/pages/GameConfiguration.vue` - Add new tabs
- `/src/utils/csvImporter.js` - Handle new formats

### Phase 2 Files
- `/src/pages/UpgradeTree.vue` - Vendor categorization
- `/src/components/UpgradeTreeVisualization.vue` - New visualization
- `/src/utils/upgradeCalculator.js` - Multi-currency costs

### Phase 3 Files
- `/src/utils/simulationEngine.js` - Complete rewrite
- `/src/utils/combatEngine.js` - New file
- `/src/utils/helperEngine.js` - New file
- `/src/utils/offlineCalculator.js` - New file

### Phase 4 Files
- `/src/pages/LiveMonitor.vue` - Screen layout
- `/src/components/HelperPanel.vue` - New component
- `/src/components/CombatPanel.vue` - New component
- `/src/components/MiningTracker.vue` - New component

### Phase 5 Files
- `/src/pages/Reports.vue` - New report types
- `/src/utils/metricsCalculator.js` - New metrics
- `/src/utils/reportGenerator.js` - Updated formats

---

*This plan is a living document and will be updated as implementation progresses.*