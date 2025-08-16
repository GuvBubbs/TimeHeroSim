# Simulation Engine - As Built Documentation

## System Overview

The Simulation Engine is the computational heart of the Time Hero Simulator. It contains the pure game logic that processes time advancement, player actions, resource management, and all game mechanics. This engine is designed to be completely stateless and environment-agnostic, meaning it can run identically in the main browser thread, web workers, or even Node.js environments.

In simple terms: This is the "brain" that knows all the rules of the Time Hero game. It takes the current game state (like what the player has, where they are, what they're doing) and calculates what happens next when time passes or actions are taken. It's like having the complete rulebook of the game coded into software.

## System Connections

### Inputs
- **Current Game State**: Complete snapshot of the game's current condition
- **Game Values**: Static configuration data (crops, upgrades, adventures)
- **Player Actions**: Commands from player input (plant, adventure, upgrade, etc.)
- **Time Advancement**: Requests to process game time progression
- **Random Number Generation**: For variance in outcomes and events

### Outputs
- **Updated Game State**: New state after processing time/actions
- **Event Notifications**: Descriptions of what happened during processing
- **Action Results**: Success/failure status and effects of player actions
- **Performance Metrics**: Timing data for optimization analysis
- **Validation Errors**: Notifications of invalid actions or state inconsistencies

## Technical Implementation

### Core Architecture

The Simulation Engine follows a functional programming approach with pure functions that never modify their inputs. The main processing flow consists of:

#### Primary Processing Function
```javascript
function simulateGameTick(gameState, gameValues) {
  const result = {
    gameState: cloneDeep(gameState),
    events: [],
    metrics: { tickStartTime: performance.now() }
  }
  
  // Core processing steps
  advanceTime(result.gameState, result)
  processCurrentAction(result.gameState, gameValues, result)
  processFarmSystems(result.gameState, gameValues, result)
  processHelperAutomation(result.gameState, gameValues, result)
  checkPhaseProgression(result.gameState, gameValues, result)
  updateAvailableUpgrades(result.gameState, gameValues, result)
  
  result.metrics.tickEndTime = performance.now()
  result.metrics.processingTime = result.metrics.tickEndTime - result.metrics.tickStartTime
  
  return result
}
```

### Game Time Management

#### Time Advancement System
The engine processes time in discrete 1-minute intervals (game time). Each tick represents:
- **1 Game Minute** = Variable real-time depending on simulation speed
- **Time Flow**: Day/Hour/Minute tracking with proper wraparound
- **Phase Transitions**: Automatic progression through game phases based on achievements

#### Time-Based Processing
```javascript
function advanceTime(gameState, result) {
  gameState.currentMinute++
  
  if (gameState.currentMinute >= 60) {
    gameState.currentMinute = 0
    gameState.currentHour++
    
    if (gameState.currentHour >= 24) {
      gameState.currentHour = 0
      gameState.currentDay++
      
      // Daily reset events
      processNewDay(gameState, result)
    }
  }
  
  // Energy regeneration (every 10 minutes)
  if (gameState.currentMinute % 10 === 0) {
    regenerateEnergy(gameState, result)
  }
}
```

### Action Processing System

#### Action Execution Pipeline
The engine processes player actions through a standardized pipeline:

1. **Action Validation**: Verify action is possible given current state
2. **Resource Checking**: Ensure sufficient resources are available
3. **State Preparation**: Set up any required state changes
4. **Action Execution**: Apply the action's effects
5. **Event Generation**: Create events describing what happened
6. **State Finalization**: Ensure state consistency

#### Action Types and Processing

**Farm Actions**
```javascript
function processPlantAction(gameState, gameValues, action, result) {
  const plot = gameState.farm.plots.find(p => p.id === action.plotId)
  const crop = gameValues.crops[action.cropId]
  
  // Validation
  if (!plot || plot.crop || !crop) {
    return { success: false, error: 'Invalid plant action' }
  }
  
  if (gameState.resources.energy.current < crop.energyCost) {
    return { success: false, error: 'Insufficient energy' }
  }
  
  // Apply action
  plot.crop = action.cropId
  plot.plantedAt = gameState.currentMinute + (gameState.currentHour * 60) + (gameState.currentDay * 1440)
  plot.growthStage = 1
  plot.readyAt = plot.plantedAt + crop.growthTime
  
  gameState.resources.energy.current -= crop.energyCost
  
  result.events.push({
    type: 'action',
    category: 'farm',
    message: `Planted ${crop.name} in plot ${plot.id}`,
    timestamp: getCurrentGameTime(gameState)
  })
  
  return { success: true }
}
```

**Adventure Actions**
```javascript
function processAdventureAction(gameState, gameValues, action, result) {
  const adventure = gameValues.adventures[action.adventureId]
  
  // Calculate combat results
  const combatResult = calculateCombatOutcome(
    gameState.heroes.level,
    adventure.difficulty,
    action.duration
  )
  
  // Apply rewards
  gameState.resources.gold += combatResult.goldReward
  gameState.resources.materials = mergeResources(
    gameState.resources.materials,
    combatResult.materialRewards
  )
  
  // Experience gain
  gameState.heroes.experience += combatResult.experienceGain
  checkLevelUp(gameState, gameValues, result)
  
  return { success: true, result: combatResult }
}
```

### Resource Management System

#### Resource Processing
The engine handles multiple resource types with different behaviors:

**Energy System**
- **Regeneration**: Passive regeneration every 10 game minutes
- **Capacity Management**: Energy cap based on upgrades and progression
- **Consumption**: Various actions consume different amounts

**Gold Economy**
- **Adventure Rewards**: Primary gold income from adventures
- **Crop Sales**: Secondary income from farm automation
- **Upgrade Costs**: Major gold expenditure for progression

**Material Resources**
- **Mining Rewards**: Stone, ore, gems from mining activities
- **Adventure Loot**: Special materials from specific adventures
- **Crafting Requirements**: Materials consumed for upgrades

#### Resource Validation
```javascript
function validateResourceCosts(gameState, costs) {
  const validation = { valid: true, missing: [] }
  
  // Check energy
  if (costs.energy && gameState.resources.energy.current < costs.energy) {
    validation.valid = false
    validation.missing.push(`energy (need ${costs.energy}, have ${gameState.resources.energy.current})`)
  }
  
  // Check gold
  if (costs.gold && gameState.resources.gold < costs.gold) {
    validation.valid = false
    validation.missing.push(`gold (need ${costs.gold}, have ${gameState.resources.gold})`)
  }
  
  // Check materials
  for (const [material, amount] of Object.entries(costs.materials || {})) {
    const current = gameState.resources.materials[material] || 0
    if (current < amount) {
      validation.valid = false
      validation.missing.push(`${material} (need ${amount}, have ${current})`)
    }
  }
  
  return validation
}
```

### Farm System Integration

#### Crop Growth Processing
The engine processes crop growth through distinct stages:

```javascript
function processCropGrowth(gameState, gameValues, result) {
  const currentTime = getCurrentGameTime(gameState)
  
  for (const plot of gameState.farm.plots) {
    if (!plot.crop) continue
    
    const crop = gameValues.crops[plot.crop]
    const timeSincePlanted = currentTime - plot.plantedAt
    
    // Calculate growth stage
    const expectedStage = Math.min(
      Math.floor(timeSincePlanted / (crop.growthTime / crop.stages)) + 1,
      crop.stages
    )
    
    if (expectedStage > plot.growthStage) {
      plot.growthStage = expectedStage
      
      result.events.push({
        type: 'growth',
        category: 'farm',
        message: `${crop.name} in plot ${plot.id} reached stage ${expectedStage}`,
        timestamp: currentTime
      })
    }
    
    // Check for readiness
    if (timeSincePlanted >= crop.growthTime && !plot.ready) {
      plot.ready = true
      plot.readyAt = currentTime
      
      result.events.push({
        type: 'ready',
        category: 'farm',
        message: `${crop.name} in plot ${plot.id} is ready for harvest!`,
        timestamp: currentTime
      })
    }
  }
}
```

#### Water System Management
```javascript
function processWaterSystem(gameState, gameValues, result) {
  const waterConsumption = calculateWaterConsumption(gameState.farm.plots, gameValues)
  
  if (gameState.farm.waterTank.current >= waterConsumption) {
    gameState.farm.waterTank.current -= waterConsumption
  } else {
    // Insufficient water - crop growth slowdown
    const slowdownFactor = gameState.farm.waterTank.current / waterConsumption
    applyCropGrowthSlowdown(gameState.farm.plots, slowdownFactor, result)
    gameState.farm.waterTank.current = 0
  }
  
  // Water tank refill (daily)
  if (gameState.currentHour === 6 && gameState.currentMinute === 0) {
    gameState.farm.waterTank.current = gameState.farm.waterTank.max
    result.events.push({
      type: 'system',
      category: 'farm',
      message: 'Water tank refilled for the day',
      timestamp: getCurrentGameTime(gameState)
    })
  }
}
```

### Helper Automation System

#### Helper Discovery and Management
```javascript
function processHelperDiscovery(gameState, gameValues, result) {
  // Helper discovery is based on farm activity and progression
  const activePlots = gameState.farm.plots.filter(p => p.crop).length
  const discoveryChance = calculateHelperDiscoveryChance(
    activePlots,
    gameState.currentDay,
    gameState.helpers.length
  )
  
  if (Math.random() < discoveryChance) {
    const newHelper = generateHelper(gameState, gameValues)
    gameState.helpers.push(newHelper)
    
    result.events.push({
      type: 'discovery',
      category: 'helpers',
      message: `Found a new helper: ${newHelper.name} (${newHelper.specialty})`,
      timestamp: getCurrentGameTime(gameState)
    })
  }
}
```

#### Automated Action Processing
```javascript
function processHelperAutomation(gameState, gameValues, result) {
  for (const helper of gameState.helpers) {
    if (!helper.active) continue
    
    switch (helper.specialty) {
      case 'farming':
        processAutomatedFarming(helper, gameState, gameValues, result)
        break
      case 'harvesting':
        processAutomatedHarvesting(helper, gameState, gameValues, result)
        break
      case 'maintenance':
        processAutomatedMaintenance(helper, gameState, gameValues, result)
        break
    }
  }
}
```

### Progression and Phase Management

#### Phase Transition Logic
```javascript
function checkPhaseProgression(gameState, gameValues, result) {
  const currentPhase = gameState.currentPhase
  const requirements = gameValues.phaseRequirements[getNextPhase(currentPhase)]
  
  if (!requirements) return // Already at final phase
  
  const meetsRequirements = evaluatePhaseRequirements(gameState, requirements)
  
  if (meetsRequirements) {
    const nextPhase = getNextPhase(currentPhase)
    gameState.currentPhase = nextPhase
    
    result.events.push({
      type: 'progression',
      category: 'phase',
      message: `Advanced to ${nextPhase} phase!`,
      timestamp: getCurrentGameTime(gameState),
      importance: 'high'
    })
    
    // Unlock new content for this phase
    unlockPhaseContent(gameState, gameValues, nextPhase, result)
  }
}
```

#### Upgrade System Processing
```javascript
function updateAvailableUpgrades(gameState, gameValues, result) {
  for (const [upgradeId, upgrade] of Object.entries(gameValues.upgrades)) {
    if (gameState.upgrades.purchased.has(upgradeId)) continue
    if (gameState.upgrades.available.has(upgradeId)) continue
    
    // Check unlock requirements
    const requirements = upgrade.requirements
    const meetsRequirements = evaluateUpgradeRequirements(gameState, requirements)
    
    if (meetsRequirements) {
      gameState.upgrades.available.add(upgradeId)
      
      result.events.push({
        type: 'unlock',
        category: 'upgrades',
        message: `New upgrade available: ${upgrade.name}`,
        timestamp: getCurrentGameTime(gameState)
      })
    }
  }
}
```

### Performance Optimization

#### Computational Efficiency
- **Lazy Evaluation**: Only processes systems that have changed
- **Batch Processing**: Groups similar operations for efficiency
- **Early Termination**: Skips unnecessary calculations when conditions aren't met

#### Memory Management
- **Object Pooling**: Reuses objects for frequently created/destroyed entities
- **Minimal Cloning**: Only deep clones objects that will be modified
- **Garbage Collection Friendly**: Minimizes object creation during hot loops

### Error Handling and Validation

#### State Consistency Checking
```javascript
function validateGameState(gameState, result) {
  const errors = []
  
  // Resource bounds checking
  if (gameState.resources.energy.current > gameState.resources.energy.cap) {
    errors.push('Energy exceeds capacity')
    gameState.resources.energy.current = gameState.resources.energy.cap
  }
  
  // Farm state validation
  for (const plot of gameState.farm.plots) {
    if (plot.crop && !gameValues.crops[plot.crop]) {
      errors.push(`Invalid crop ${plot.crop} in plot ${plot.id}`)
      plot.crop = null
      plot.growthStage = 0
    }
  }
  
  if (errors.length > 0) {
    result.events.push({
      type: 'validation',
      category: 'system',
      message: `State validation errors: ${errors.join(', ')}`,
      timestamp: getCurrentGameTime(gameState),
      importance: 'high'
    })
  }
}
```

### Testing and Quality Assurance

#### Unit Testing Coverage
- **Individual Functions**: All core functions have comprehensive unit tests
- **Action Processing**: Every action type tested for various scenarios
- **Edge Cases**: Boundary conditions and error states thoroughly tested
- **Performance**: Benchmarking for computational efficiency

#### Integration Testing
- **State Consistency**: Verifies state remains valid after all operations
- **Event Generation**: Ensures appropriate events are generated
- **Resource Conservation**: Validates resource quantities are preserved

## Code References

### Primary Implementation Files
- `/src/utils/simulationEngine.js` - Core simulation logic and game rules
- `/src/workers/simulationWorker.js` - Web worker wrapper for background execution
- `/src/utils/gameLogic/` - Specialized logic modules for different game systems

### Action Processing Modules
- `/src/utils/gameLogic/farmActions.js` - Farm-related action processing
- `/src/utils/gameLogic/adventureActions.js` - Adventure and combat logic
- `/src/utils/gameLogic/upgradeActions.js` - Upgrade purchase and application

### System Integration Files
- `/src/stores/simulation.js` - Integration with state management
- `/src/utils/workerManager.js` - Worker communication and coordination
- `/src/components/GameVisualizer.vue` - Real-time engine output visualization

### Configuration and Data Files
- `/data/crops.csv` - Crop definitions and growth parameters
- `/data/adventures.csv` - Adventure definitions and reward tables
- `/data/upgrades.csv` - Upgrade definitions and requirements

### Testing and Validation
- `/tests/simulationEngine.test.js` - Comprehensive engine testing suite
- `/tests/gameLogic/` - Specialized tests for individual game systems
- `/tests/integration/` - End-to-end simulation testing

## Future Considerations

### Performance Enhancements
- **WASM Integration**: Move critical loops to WebAssembly for maximum performance
- **GPU Acceleration**: Leverage GPU compute for parallel simulation runs
- **Advanced Caching**: Memoize expensive calculations for repeated scenarios

### Feature Expansions
- **Scripting Support**: Allow custom game logic through embedded scripting
- **Plugin Architecture**: Enable modular expansion of game systems
- **Real-time Multiplayer**: Support for synchronized multi-player simulations

### Analytics Integration
- **Telemetry Collection**: Gather performance and behavior data during simulation
- **Predictive Modeling**: Use simulation data to predict player behavior patterns
- **Automated Balance Testing**: Continuous integration testing for game balance
