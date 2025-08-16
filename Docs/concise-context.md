# Concise Context - Time Hero Game Balance Simulator

## Project Overview

The **Time Hero Game Balance Simulator** is a comprehensive web-based application designed to validate and optimize the game economy of Time Hero through statistical simulation and analysis. It serves as the canonical source of truth for all game balance decisions.

**Technology Stack**: Vue 3 + Composition API, Pinia state management, Chart.js visualization, Web Workers for performance

**Current Status**: Production-ready, Phase 10 completed, fully deployed

## Core Purpose

**Primary Mission**: Enable data-driven game balance decisions through rigorous statistical analysis
**Target Users**: Game designers, QA teams, data analysts, and development stakeholders
**Key Value**: Transform subjective balance decisions into objective, statistically-validated insights

## System Architecture

### High-Level Components
1. **Game State Management** - Reactive state handling with Pinia stores
2. **Simulation Engine** - Pure game logic processing time and player actions
3. **Web Worker System** - Background processing for performance and responsiveness
4. **Analysis Framework** - Monte Carlo, A/B testing, bottleneck detection
5. **Data Management** - CSV import, validation, and configuration management
6. **Visualization System** - Real-time charts and interactive data display

### Key Data Flow
```
CSV Data → Validation → Game State → Simulation Engine → Web Workers → Analysis → Visualization
```

## Core Capabilities

### Simulation Features
- **Real-time Simulation**: Live game state progression with visual feedback
- **Player Archetypes**: Speedrunner, Casual Player, Weekend Warrior behavior modeling
- **Variable Speed**: 1x to max speed simulation with pause/resume controls
- **Complete Game Systems**: Farm, adventure, upgrade, helper, and resource systems

### Analysis Tools
- **Monte Carlo Analysis**: 50-1000 simulation runs with statistical confidence intervals
- **A/B Testing**: Rigorous comparison of game configurations with significance testing
- **Bottleneck Detection**: Automated identification of progression obstacles
- **Scenario Validation**: Comprehensive testing across multiple player archetypes

### Data Management
- **CSV Configuration**: Easy modification of crops, adventures, and upgrades
- **Hot Reload**: Development-time automatic reloading of configuration changes
- **Data Validation**: Comprehensive error checking and business logic validation
- **Export Capabilities**: JSON, CSV, and Markdown export for external analysis

## Key Systems Detail

### Game State Management (`/src/stores/`)
- **Simulation Store**: Current game state and simulation controls
- **Game Values Store**: Static configuration data from CSV files
- **Results Store**: Analysis results and historical data
- **Reactive Updates**: Real-time UI updates via Vue 3 reactivity

### Simulation Engine (`/src/utils/simulationEngine.js`)
- **Pure Functions**: Stateless, environment-agnostic game logic
- **Time Processing**: Minute-by-minute game time advancement
- **Action System**: Plant, harvest, adventure, upgrade, mining actions
- **Resource Management**: Energy, gold, materials, water systems

### Web Worker System (`/src/utils/workerManager.js`)
- **Background Processing**: Non-blocking simulation execution
- **Parallel Execution**: Multiple workers for Monte Carlo analysis
- **Message Protocol**: Standardized communication between threads
- **Performance Optimization**: Efficient memory management and task distribution

### Analysis Framework (`/src/utils/monteCarloManager.js`)
- **Statistical Rigor**: Confidence intervals, significance testing, effect sizes
- **Monte Carlo Engine**: Variance modeling and large-scale simulation
- **A/B Testing**: Experimental design with statistical validation
- **Bottleneck Detection**: Automated pattern recognition for progression issues

## File Structure
```
time-hero-simulator/
├── src/
│   ├── components/          # Vue UI components
│   ├── stores/             # Pinia state management
│   ├── utils/              # Core utilities and engines
│   ├── workers/            # Web worker implementations
│   └── App.vue             # Main application
├── data/                   # CSV configuration files
├── docs/                   # User documentation
└── Docs/                   # Development documentation
```

## Development Context

### Completed Phases (0-10)
- **Phase 0-2**: Foundation, core game state, simulation engine
- **Phase 3-5**: Player behavior, actions, adventure system
- **Phase 6-7**: Visualization, UI, event logging
- **Phase 8-9**: Web workers, advanced analysis features
- **Phase 10**: Production polish, documentation, deployment

### Key Integrations
- **Chart.js**: Professional data visualization
- **CSV Parser**: Configuration data import
- **Web Workers**: Background processing
- **Pinia**: Reactive state management
- **Vite**: Build system and development server

## Usage Workflows

### Basic Simulation
1. Load simulator → Configure player archetype → Start simulation → Monitor progress → Export results

### Monte Carlo Analysis
1. Configure runs (50-1000) → Set variance parameters → Execute parallel simulations → Review statistical results

### A/B Testing
1. Define baseline configuration → Create variant configuration → Run parallel experiments → Compare with significance testing

### Bottleneck Detection
1. Run simulation → Analyze progression patterns → Identify obstacles → Generate recommendations

## Data Sources

### Primary Configuration (`/data/`)
- **crops.csv**: Crop definitions, energy costs, growth times, rewards
- **adventures.csv**: Adventure definitions, difficulty, costs, rewards
- **upgrades.csv**: Upgrade definitions, requirements, effects, costs

### Generated Data
- **Simulation Results**: Game state progression, events, metrics
- **Analysis Results**: Statistical summaries, confidence intervals, comparisons
- **Performance Metrics**: Execution timing, memory usage, throughput

## Key Metrics Tracked

### Game Balance Metrics
- **Completion Time**: Time to reach each game phase
- **Resource Efficiency**: Energy utilization and gold generation rates
- **Progression Smoothness**: Bottleneck frequency and severity
- **Player Satisfaction**: Estimated engagement based on wait times

### Statistical Measures
- **Confidence Intervals**: 95% confidence bounds for key metrics
- **Effect Sizes**: Magnitude of differences in A/B testing
- **Significance Levels**: P-values for statistical tests
- **Variance Analysis**: Player behavior impact on outcomes

## Common Issues & Solutions

### Performance
- **Large Simulations**: Use web workers for background processing
- **Memory Usage**: Implement data streaming and cleanup
- **UI Responsiveness**: Batch updates and throttle refresh rates

### Data Management
- **CSV Errors**: Check validation messages and fix data format
- **Missing Data**: Ensure all required CSV files are present
- **Hot Reload**: Refresh browser if automatic reload fails

### Analysis
- **Statistical Power**: Use sufficient simulation runs (50+ for Monte Carlo)
- **Variance Tuning**: Adjust player behavior variance for realistic results
- **Interpretation**: Focus on confidence intervals, not just point estimates

## Future Roadmap

### Immediate Enhancements
- **Real Player Data**: Integration with live game analytics
- **Advanced Statistics**: Bayesian analysis, time series forecasting
- **Cloud Deployment**: Scalable analysis using cloud resources

### Long-term Vision
- **Machine Learning**: AI-powered balance optimization
- **Real-time Monitoring**: Live game balance tracking
- **Collaborative Features**: Multi-user analysis and sharing

## Quick Start Guide

1. **Navigate** to the simulator URL
2. **Wait** for CSV data loading (automatic)
3. **Configure** player archetype in Control Panel
4. **Start** simulation and monitor in Game Visualizer
5. **Run Analysis** using Monte Carlo or A/B Testing panels
6. **Export Results** for external analysis and reporting

## Support Resources

- **User Guide**: `/docs/user-guide.md` - Complete feature walkthrough
- **API Reference**: `/docs/api-reference.md` - Technical documentation
- **Troubleshooting**: `/docs/troubleshooting.md` - Common issues and solutions
- **As-Built Docs**: `/Docs/as-built/` - Comprehensive system documentation

---

**This simulator transforms game balance from guesswork into data-driven science, ensuring Time Hero provides optimal player experience through rigorous analysis and validation.**
