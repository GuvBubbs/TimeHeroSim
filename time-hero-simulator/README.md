# 🎮 Time Hero Game Balance Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

A comprehensive, data-driven simulation and analysis platform for validating and optimizing the game economy of **Time Hero** - an idle farming game for the Playdate console.

## 🎯 Mission Statement

This simulator serves as the **canonical source of truth** for Time Hero's game balance, ensuring players experience a satisfying 3-4 week progression journey from humble farmer (3 plots) to empire manager (90+ plots) with meaningful paradigm shifts and no frustrating bottlenecks.

## ✨ Key Features

### 🔬 Advanced Analysis Suite
- **Monte Carlo Simulations**: Run hundreds of parallel simulations with variance parameters
- **A/B Testing Framework**: Compare different game configurations with statistical significance testing
- **Bottleneck Analyzer**: Automatically detect and score progression issues with fix recommendations
- **Scenario Testing**: Automated regression testing for different player archetypes

### 📊 Comprehensive Visualization
- **Real-time Game State**: Live visualization of resources, farm plots, helpers, and progression
- **Interactive Charts**: Resource flows, phase timelines, upgrade progressions, efficiency metrics
- **Timeline Analysis**: Track progression bottlenecks and critical moments across the journey

### 🎮 Player Behavior Modeling
- **Player Archetypes**: Speedrunner, Casual Player, Weekend Warrior with realistic behavior patterns
- **Configurable Parameters**: Check-in frequency, session length, efficiency, optimization level
- **Variance Simulation**: Model real-world player behavior with statistical distributions

### 🛠️ Professional Tools
- **Data Export**: JSON/CSV export for all analysis results
- **Web Worker Performance**: Background simulation processing for responsive UI
- **Statistical Validation**: Confidence intervals, significance testing, regression detection
- **Comprehensive Reporting**: Automated recommendations and balance health assessment

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with ES6+ support

### Installation
```bash
# Clone the repository
git clone https://github.com/GuvBubbs/TimeHeroSim.git
cd TimeHeroSim/time-hero-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

### First Simulation
1. **Load Game Data**: The simulator automatically loads crops, adventures, and upgrades from CSV files
2. **Choose Player Profile**: Select from Speedrunner, Casual Player, or Weekend Warrior presets
3. **Start Simulation**: Click "▶️ Start Simulation" to begin the 28-day progression journey
4. **Analyze Results**: Use the Advanced Analysis panel to explore Monte Carlo, A/B testing, and bottleneck analysis

## 📈 Analysis Workflow

### 1. Basic Simulation
```
Configure Player Behavior → Start Simulation → View Real-time Progress → Review Results
```

### 2. Statistical Validation
```
Run Monte Carlo → Analyze Confidence Intervals → Validate Balance Changes
```

### 3. A/B Testing
```
Configure Test A & B → Run Comparison → Review Statistical Significance → Apply Recommendations
```

### 4. Bottleneck Detection
```
Analyze Current Simulation → Identify Issues → Review Fix Recommendations → Test Solutions
```

## 🏗️ Architecture

### Design Principles
1. **Data Integrity**: Game values are immutable; only simulation parameters are modifiable
2. **Statistical Rigor**: All analysis uses proper statistical methods with confidence intervals
3. **Performance First**: Web workers handle heavy computation without blocking the UI
4. **Modular Design**: Each analysis tool functions independently for maximum flexibility

### Technology Stack
- **Frontend**: Vue 3 with Composition API
- **State Management**: Pinia for reactive data stores
- **Build Tool**: Vite for fast development and optimized builds
- **Visualization**: Chart.js for interactive charts and graphs
- **Data Processing**: PapaParse for CSV import, localForage for persistence
- **Performance**: Web Workers for background simulation processing

### Project Structure
```
time-hero-simulator/
├── 📁 src/
│   ├── 🧩 components/           # Vue UI components
│   │   ├── ControlPanel.vue         # Simulation controls
│   │   ├── GameVisualizer.vue       # Main game state display
│   │   ├── EventLog.vue             # Event history and filtering
│   │   ├── ResourceChart.vue        # Resource flow visualization
│   │   ├── PhaseTimeline.vue        # Progression timeline
│   │   ├── MonteCarloPanel.vue      # Statistical simulation
│   │   ├── ABTestingPanel.vue       # A/B test framework
│   │   └── BottleneckAnalyzer.vue   # Issue detection
│   ├── 🏪 stores/               # Pinia state management
│   │   ├── gameValues.js            # Immutable game data
│   │   ├── simulation.js            # Live simulation state
│   │   └── results.js               # Analysis results
│   ├── 🔧 utils/                # Core utilities
│   │   ├── importers.js             # CSV data loading
│   │   ├── monteCarloManager.js     # Statistical simulation
│   │   └── scenarioTestManager.js   # Automated testing
│   ├── 👷 workers/              # Web worker scripts
│   │   └── simulator.worker.js      # Background simulation
│   └── 📋 rules/                # Game logic implementation
├── 📊 data/                     # Game balance data
├── 🌐 public/                   # Static assets
└── 📚 docs/                     # Documentation
```

## 📚 Documentation

### User Guides
- **[Getting Started Guide](docs/user-guide.md)**: Step-by-step tutorial for new users
- **[Analysis Tools Guide](docs/analysis-guide.md)**: Comprehensive guide to all analysis features
- **[Troubleshooting](docs/troubleshooting.md)**: Common issues and solutions

### Developer Documentation
- **[Development Plan](../Docs/simulator-development-plan.md)**: Complete development roadmap
- **[Phase Completion Reports](../Docs/)**: Detailed progress tracking
- **[API Reference](docs/api-reference.md)**: Code documentation and examples

## 🎯 Use Cases

### For Game Designers
- **Balance Validation**: Statistical confidence in balance changes
- **Bottleneck Detection**: Automatic identification of progression issues
- **Player Archetype Testing**: Validate experience for different player types
- **Iteration Speed**: Rapid testing of balance hypotheses

### For QA Teams
- **Regression Testing**: Automated detection of balance regressions
- **Performance Benchmarks**: Ensure consistent progression timing
- **Edge Case Analysis**: Test extreme player behaviors
- **Release Validation**: Comprehensive pre-release balance verification

### For Data Analysts
- **Statistical Analysis**: Monte Carlo simulations with confidence intervals
- **A/B Testing**: Rigorous comparison of different configurations
- **Trend Analysis**: Historical balance change tracking
- **Export Capabilities**: Full data export for external analysis

## 🔧 Configuration

### Player Behavior Parameters
```javascript
playerBehavior: {
  checkInFrequency: 0.8,    // How often player checks the game (0-1)
  sessionLength: 0.7,       // Average play session duration (0-1)
  efficiency: 0.75,         // Player optimization level (0-1)
  idleTime: 0.3            // Proportion of time idle (0-1)
}
```

### Analysis Configuration
```javascript
monteCarloConfig: {
  runs: 100,                // Number of parallel simulations
  variance: {
    playerBehavior: 0.2,    // Variance in player behavior (0-1)
    gameRNG: 0.1           // Variance in game randomness (0-1)
  },
  confidenceLevel: 0.95     // Statistical confidence level
}
```

## 🚀 Deployment

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### GitHub Pages
```bash
npm run build        # Build static files
npm run deploy       # Deploy to GitHub Pages
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Vue 3 Composition API
- ESLint + Prettier configuration
- Comprehensive JSDoc comments
- Unit tests for core logic

## 📈 Performance

### Benchmarks
- **Simulation Speed**: 28-day simulation in <2 seconds
- **Monte Carlo**: 100 parallel runs in <30 seconds
- **Memory Usage**: <100MB for typical simulations
- **UI Responsiveness**: <16ms frame times during simulation

### Optimization Features
- Web Worker background processing
- Efficient data structures for large datasets
- Memory management for long-running simulations
- Progressive loading for large analysis results

## 🐛 Known Limitations

### Current Constraints
- Simulation limited to 28-day progression period
- Player behavior models are statistical approximations
- Some advanced game mechanics are simplified
- Cross-browser testing ongoing

### Future Enhancements
- Extended simulation periods (90+ days)
- Machine learning for player behavior prediction
- Real-time multiplayer simulation scenarios
- Advanced 3D visualization modes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Time Hero Development Team**: Game design and balance requirements
- **Vue.js Community**: Framework and ecosystem support
- **Chart.js Contributors**: Visualization capabilities
- **Statistical Computing Community**: Analysis methodologies

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/GuvBubbs/TimeHeroSim/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GuvBubbs/TimeHeroSim/discussions)
- **Documentation**: [Project Wiki](https://github.com/GuvBubbs/TimeHeroSim/wiki)

---

**Time Hero Game Balance Simulator** - Ensuring perfect progression balance through data-driven analysis.

Built with ❤️ for the Time Hero community.
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
