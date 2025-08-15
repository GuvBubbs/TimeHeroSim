# Time Hero Game Balance Simulator

A comprehensive simulation tool for validating and tuning the game economy of **Time Hero**, an idle farming game for the Playdate console.

## 🎯 Purpose

This simulator exists to validate that Time Hero provides a satisfying 3-4 week progression journey from humble farmer (3 plots) to empire manager (90+ plots) with meaningful paradigm shifts at critical moments.

## 🚀 Current Status

### ✅ Completed (Phase 0 - Foundation)
- **Project Setup**: Vue 3 + Vite + Pinia + Chart.js + PapaParse + localForage
- **Data Architecture**: Immutable game values with modifiable simulation parameters
- **CSV Import System**: Loads crops, adventures, upgrades from CSV files
- **Core UI Components**: Control panel, game visualizer, event log
- **Player Profiles**: Adjustable behavior parameters with presets
- **State Management**: Reactive stores for game values, simulation, and results

### 🎮 Features Working
- **Data Loading**: Game data imported and validated from CSV files
- **Player Behavior Simulation**: Configurable check-ins, session length, efficiency
- **Game State Visualization**: World layout, resources, farm overview, phase tracking
- **Event Logging**: Comprehensive logging with filtering, search, and export
- **Real-time Updates**: Reactive UI showing current simulation state

## 🏗️ Architecture

### Core Principles
1. **Immutable Game Values**: CSV data is never modified by the simulator
2. **Modifiable Simulation Rules**: Player behavior parameters can be adjusted
3. **Data Integrity**: All imported values are frozen and validated
4. **Clear Separation**: Game rules vs simulation rules vs game values

### Directory Structure
```
time-hero-simulator/
├── src/
│   ├── components/          # Vue components
│   │   ├── ControlPanel.vue    # Player behavior dials
│   │   ├── GameVisualizer.vue  # Game state display
│   │   └── EventLog.vue        # Event history
│   ├── stores/             # Pinia state management
│   │   ├── gameValues.js      # Immutable game data
│   │   ├── simulation.js      # Current simulation state
│   │   └── results.js         # Analysis and reporting
│   ├── utils/              # Utility functions
│   │   └── importers.js       # CSV parsing and validation
│   ├── workers/            # Web workers (planned)
│   └── rules/              # Game logic (planned)
├── data/                   # CSV game data files
├── public/data/           # Public CSV files for web access
└── reports/               # Simulation reports (planned)
```

## 📊 Game Data

Currently includes:
- **29 Crops**: From Carrot (early) to Soybean (endgame) with growth stages
- **8 Adventure Routes**: From Meadow Path to Time Rift with scaling rewards
- **30+ Upgrades**: Storage, pumps, tools, tower floors with proper dependencies

## 🎮 How to Use

### Development Setup
```bash
npm install
npm run dev
```

### Using the Simulator
1. **Load Data**: Game data loads automatically from CSV files
2. **Configure Player**: Adjust check-ins, session length, efficiency per phase
3. **Use Presets**: Try Speedrunner, Casual, or Weekend Warrior profiles
4. **Monitor Events**: View real-time simulation events with filtering
5. **Track Progress**: Watch game state, resources, and phase progression

### Player Profiles
- **Speedrunner**: 10 check-ins/day, 95% efficiency, optimal play
- **Casual**: 2-4 check-ins/day, 65-85% efficiency, work schedule constraints
- **Weekend Warrior**: 1 weekday + 6 weekend check-ins, burst sessions

## 🔄 Next Steps (Phase 1)

### Core Game State Implementation
- [ ] **Resource System**: Energy generation, storage caps, overflow detection
- [ ] **Farm State**: Plot management with crop growth stages
- [ ] **Time System**: Game clock with 1-minute increments
- [ ] **Basic Game Loop**: Plant → Water → Grow → Harvest → Energy

### Phase 2 - Simulation Engine
- [ ] **Decision Logic**: Player behavior simulation based on efficiency
- [ ] **Adventure System**: Energy spending with duration and rewards
- [ ] **Mining System**: Depth-based energy drain and material rewards
- [ ] **Phase Detection**: Automatic phase transitions based on triggers

### Phase 3 - Advanced Systems
- [ ] **Helper Discovery**: Gnome/Golem finding with pity system
- [ ] **Upgrade System**: Blueprint purchase and construction logic
- [ ] **Bottleneck Detection**: Identify progression blockers automatically
- [ ] **Report Generation**: Comprehensive simulation analysis

## 🎯 Success Criteria

The simulator must accurately predict:
- **Phase Timing**: Tutorial (1-4h), Early (1-5d), Mid (3-8d), Late (5-12d), Endgame (10-25d)
- **Helper Discovery**: First gnome at 20+ plots (Day 4-5)
- **Paradigm Shifts**: Automation taking over at correct plot counts
- **Resource Balance**: Energy generation matching adventure requirements
- **Screen Time**: Balanced distribution across all game locations

## 🔧 Technology Stack

- **Vue 3**: Reactive UI framework with Composition API
- **Vite**: Lightning-fast build tool with hot module replacement
- **Pinia**: State management for game data and simulation state
- **PapaParse**: Robust CSV parsing for game data import
- **Chart.js**: Data visualization for progress tracking
- **localForage**: Enhanced storage for simulation reports

## 📈 Validation Philosophy

This simulator validates Time Hero's design, not prescribes it. Every balance decision must pass through simulation validation before implementation in the actual game. The simulator serves as the **canonical source of truth** for game balance.

### Core Design Philosophy
- **5x Phase Multipliers**: Each phase is 5x larger in scope than previous
- **Intentional Bottlenecks**: Create paradigm shifts at overwhelm points
- **Helper Discovery**: Transform gameplay from doing to managing
- **Respectful of Time**: Support both active and idle playstyles

## 🚀 Quick Start

```bash
# Clone and setup
npm install

# Start development
npm run dev

# Open http://localhost:5173
# Try the presets in the Control Panel
# Watch the Event Log for simulation activity
```

---

**Remember**: The simulator exists to validate Time Hero's design, ensuring a satisfying 3-4 week journey with meaningful paradigm shifts at the correct moments.
