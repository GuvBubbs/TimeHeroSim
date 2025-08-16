# Game State Management System - As Built Documentation

## System Overview

The Game State Management System serves as the central nervous system of the Time Hero Simulator. It manages all persistent game state data using Vue 3's Composition API and Pinia for reactive state management. This system ensures that all game data remains consistent, reactive, and properly synchronized across all components and background workers.

In simple terms: This system is like the "memory" of the game - it remembers everything about the current state of the player's progress, resources, farm, adventures, and all other game elements. When anything changes in the game, this system makes sure every part of the app knows about it instantly.

## System Connections

### Inputs
- **User Interface Actions**: Player interactions from ControlPanel, GameVisualizer, and other UI components
- **Worker Messages**: Simulation results and state updates from background web workers
- **CSV Data**: Initial game configuration data from the Data Management System
- **Player Profile Changes**: Behavior modifications and archetype selections
- **External Events**: Timer events, lifecycle events, and system notifications

### Outputs
- **Reactive State**: Real-time state updates to all Vue components
- **Worker Instructions**: Game state synchronization messages to web workers
- **Event Notifications**: State change events to the Event Logging System
- **UI Updates**: Reactive data bindings that trigger visual updates
- **Analysis Data**: Current state snapshots for analysis systems

## Technical Implementation

### Core Architecture

The Game State Management System is built around three primary Pinia stores that work together:

1. **Simulation Store** (`/src/stores/simulation.js`)
   - Manages current simulation execution state
   - Handles simulation controls (start/stop/pause/reset)
   - Tracks real-time game state (resources, farm, heroes, helpers)
   - Manages worker communication and synchronization

2. **Game Values Store** (`/src/stores/gameValues.js`)
   - Stores immutable configuration data (crops, upgrades, adventures)
   - Handles CSV data import and validation
   - Provides lookup tables and reference data
   - Maintains data integrity and validation rules

3. **Results Store** (`/src/stores/results.js`)
   - Accumulates analysis results from simulations
   - Manages historical data and trends
   - Provides data aggregation and statistical processing
   - Handles export and reporting functionality

### State Structure

#### Game State Schema
```javascript
gameState: {
  // Time tracking
  currentDay: Number,
  currentHour: Number, 
  currentMinute: Number,
  currentPhase: String, // 'tutorial', 'early', 'mid', 'late', 'endgame'
  
  // Resources
  resources: {
    energy: { current: Number, cap: Number },
    gold: Number,
    materials: { [materialType]: Number }
  },
  
  // Farm system
  farm: {
    plots: Array<PlotObject>,
    waterTank: { current: Number, max: Number },
    cameraWidth: Number,
    expansionCost: Number
  },
  
  // Heroes and actions
  heroes: {
    currentAction: ActionObject | null,
    location: String,
    experience: Number,
    level: Number
  },
  
  // Helper automation
  helpers: Array<HelperObject>,
  
  // Upgrades and progression
  upgrades: {
    purchased: Set<String>,
    available: Set<String>
  }
}
```

#### Player Profile Schema
```javascript
playerProfile: {
  archetype: String, // 'speedrunner', 'casual', 'weekend-warrior'
  dailyCheckIns: {
    weekday: Number,
    weekend: Number
  },
  sessionLength: {
    weekday: Number,
    weekend: Number
  },
  efficiency: Number,
  variance: {
    checkInTiming: Number,
    sessionLength: Number,
    efficiency: Number,
    decisionDelay: Number
  }
}
```

### Reactive Data Flow

#### State Updates
1. **User Action** → Component emits action
2. **Store Method** → Validates and processes action
3. **State Mutation** → Updates reactive state
4. **Vue Reactivity** → Triggers component re-renders
5. **Worker Sync** → Sends state to background workers

#### Worker Communication
1. **Worker Manager** → Handles message serialization/deserialization
2. **State Sync** → Sends current state to workers on state changes
3. **Result Processing** → Receives simulation results from workers
4. **State Application** → Applies worker results to main state

### Performance Optimizations

#### Memory Management
- **Shallow Reactive Objects**: Uses `shallowRef` for large state objects to minimize reactivity overhead
- **Selective Updates**: Only updates changed portions of state to minimize re-renders
- **Worker Offloading**: Moves heavy computation to web workers to keep UI responsive

#### State Synchronization
- **Debounced Updates**: Groups rapid state changes to reduce worker message frequency
- **Incremental Sync**: Sends only changed data to workers rather than full state
- **Priority Queuing**: Prioritizes critical state updates over analytics updates

### Error Handling and Recovery

#### State Validation
- **Schema Validation**: Validates all state mutations against expected schemas
- **Boundary Checking**: Ensures numerical values stay within valid ranges
- **Reference Integrity**: Validates relationships between state objects

#### Recovery Mechanisms
- **State Snapshots**: Maintains snapshots for rollback on corruption
- **Graceful Degradation**: Falls back to safe defaults when invalid data detected
- **Error Reporting**: Logs state inconsistencies for debugging

### Integration Points

#### Component Integration
```javascript
// Standard component usage
const simulation = useSimulationStore()
const gameValues = useGameValuesStore()

// Reactive computed properties
const energyPercentage = computed(() => 
  (simulation.gameState.resources.energy.current / 
   simulation.gameState.resources.energy.cap) * 100
)

// Action dispatching
function plantCrop() {
  simulation.performAction('plant', { crop: 'wheat', plotId: 1 })
}
```

#### Worker Integration
```javascript
// Worker state synchronization
workerManager.postMessage({
  type: 'STATE_UPDATE',
  payload: {
    gameState: simulation.gameState,
    gameValues: gameValues.allGameValues,
    playerProfile: simulation.playerProfile
  }
})
```

### Advanced Features

#### Time Travel Debugging
- **State History**: Maintains chronological state snapshots
- **Replay Capability**: Can reconstruct any previous state
- **Action Logging**: Records all state-changing actions with timestamps

#### State Persistence
- **Local Storage**: Automatically saves critical state to browser storage
- **Session Recovery**: Restores state after browser refresh or crash
- **Export/Import**: Allows full state export for sharing or backup

#### Concurrent Simulation Support
- **Multi-Worker Coordination**: Manages multiple parallel simulations
- **State Isolation**: Ensures worker simulations don't interfere with UI state
- **Result Aggregation**: Combines results from multiple simulation runs

## Testing and Validation

### Unit Testing
- **State Mutations**: Verifies all state changes produce expected results
- **Action Processing**: Tests all user actions and system events
- **Reactivity**: Validates reactive updates trigger correctly

### Integration Testing
- **Component Integration**: Tests component-store interactions
- **Worker Communication**: Validates worker message passing
- **Data Flow**: Tests end-to-end data flow through the system

### Performance Testing
- **Memory Usage**: Monitors memory consumption during long simulations
- **Update Frequency**: Measures reactivity system performance
- **Synchronization Overhead**: Tests worker communication efficiency

## Code References

### Primary Implementation Files
- `/src/stores/simulation.js` - Core simulation state management
- `/src/stores/gameValues.js` - Static game data management  
- `/src/stores/results.js` - Analysis results management
- `/src/utils/workerManager.js` - Worker communication management
- `/src/main.js` - Pinia store initialization and app setup

### Component Integration Examples
- `/src/components/ControlPanel.vue` - Simulation control interface
- `/src/components/GameVisualizer.vue` - Real-time state visualization
- `/src/components/EventLog.vue` - State change event tracking

### Worker Integration Files
- `/src/utils/simulationEngine.js` - Pure simulation logic (worker-compatible)
- `/src/workers/simulationWorker.js` - Background simulation execution
- `/src/utils/monteCarloManager.js` - Statistical analysis coordination

### Configuration and Setup
- `/src/App.vue` - Main application initialization
- `/package.json` - Dependencies and build configuration
- `/vite.config.js` - Build system configuration

## Future Considerations

### Scalability Enhancements
- **State Sharding**: Split large state objects across multiple stores
- **Lazy Loading**: Load state segments on demand
- **Compression**: Compress state data for storage and transmission

### Advanced Analytics
- **State Mining**: Extract patterns from historical state data
- **Predictive Modeling**: Use state history to predict future behavior
- **Performance Profiling**: Detailed analysis of state management performance

### Developer Experience
- **State Debugging Tools**: Enhanced development tools for state inspection
- **Documentation Generation**: Auto-generate state schema documentation
- **Type Safety**: Full TypeScript integration for compile-time validation
