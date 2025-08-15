# Time Hero Simulator - Comprehensive Development Plan

## Phase 0: Foundation (Days 1-2) ✅ COMPLETED
*Set up the project structure and core architecture*

### Setup Tasks
- [x] Initialize Vue 3 project with Vite
- [x] Install core dependencies (Pinia, PapaParse, Chart.js, localForage)
- [x] Set up folder structure as specified
- [x] Configure GitHub repository
- [ ] Set up GitHub Pages deployment workflow
- [ ] Create basic README with project goals

### Data Architecture
- [ ] Create TypeScript interfaces for all game objects (if using TS)
- [x] Define immutable game value structures
- [x] Set up Pinia stores skeleton (gameValues, simulation, results)
- [x] Implement Object.freeze() wrappers for imported data
- [x] Create data validation layer

### Import System
- [x] Build CSV parser using PapaParse
- [ ] Create JSON import functionality
- [x] Implement data validation for imported values
- [x] Build error reporting for invalid data
- [x] Create sample data files for testing
- [ ] Set up localForage for persistence

**Milestone: Can import and validate game data** ✅

---

## Phase 1: Core Game State (Days 3-5) ✅ COMPLETED
*Build the fundamental game state representation*

### Resource System
- [x] Implement energy generation/storage/consumption
- [x] Create gold tracking system
- [x] Add all material types (stone, copper, iron, etc.)
- [x] Implement storage caps and overflow detection
- [x] Build resource flow rate calculations

### Farm State
- [x] Create plot system with growth stages
- [x] Implement crop planting/growing/harvesting logic
- [x] Add water system (tank, consumption, watering)
- [x] Build plot state management (empty, growing, ready)
- [x] Implement carrying capacity limits

### Time System
- [x] Create game clock (days, hours, minutes)
- [x] Implement tick system (1-minute increments)
- [x] Add offline time calculation
- [x] Build time acceleration controls (1x, 10x, 100x, max)
- [x] Create pause/resume functionality

**Milestone: Can track basic farm state over time** ✅

---

## Phase 2: Core Simulation Engine (Days 6-10) ✅ COMPLETED
*Build the actual simulation logic*

### Basic Game Loop
- [x] Implement main simulation tick function
- [x] Create crop growth progression
- [x] Add automatic harvesting logic
- [x] Implement energy generation from harvests
- [x] Add storage overflow handling

### Player Decision Simulator
- [x] Create decision priority system
- [x] Implement "when to plant" logic
- [x] Add "when to water" decisions
- [x] Build "when to harvest" triggers
- [x] Create efficiency parameter (casual vs optimal)

### Phase Detection
- [x] Implement phase transition triggers
- [x] Create phase state tracking
- [x] Add unlock system for features
- [x] Build progression milestone detection
- [x] Log phase transitions

### Console Testing
- [x] Create command-line interface for testing
- [x] Build simulation runner without UI
- [x] Add basic logging output
- [x] Implement state snapshots
- [x] Verify 28-day progression works

**Milestone: Can run full progression simulation in console** ✅

---

## Phase 3: Adventure & Mining Systems (Days 11-15) ✅ COMPLETED
*Add energy consumption systems*

### Adventure System
- [x] Create adventure route definitions
- [x] Implement energy cost calculations
- [x] Add duration timers
- [x] Build reward generation (gold, materials)
- [x] Implement short/medium/long route choices
- [x] Add boss encounters and guaranteed drops

### Mining System
- [x] Create depth-based mining structure
- [x] Implement exponential energy drain
- [x] Add material drop tables by depth
- [x] Build helper discovery chances
- [x] Create depth progression logic
- [x] Add mining session duration limits

### Combat Triangle
- [x] Implement weapon types
- [x] Add enemy family types
- [x] Create effectiveness matrix
- [x] Build damage calculations
- [x] Add weapon selection logic

**Milestone: Complete resource generation and consumption loops** ✅

---

## Phase 4: Crafting & Upgrades (Days 16-20) ✅ COMPLETED
*Implement progression systems*

### Forge System
- [x] Create crafting queue system
- [x] Implement crafting timers
- [x] Add material consumption
- [x] Build success rate calculations
- [x] Create tool/weapon outputs

### Tower System
- [x] Implement seed catching mechanics
- [x] Add floor-based progression
- [x] Create catch rate calculations
- [x] Build auto-catcher efficiency
- [x] Implement seed storage

### Upgrade System
- [x] Create blueprint purchase logic
- [x] Implement build requirements (energy + materials)
- [x] Add upgrade effects to game state
- [x] Build cost scaling formulas
- [x] Create upgrade priority AI

### Town Shop
- [x] Implement all blueprint types
- [x] Add purchase decisions
- [x] Create gold spending priorities
- [x] Build upgrade recommendation system

**Milestone: Full game loop functional** ✅

---

## Phase 5: Helper System (Days 21-25) ✅ COMPLETED
*Implement the paradigm shift mechanics*

### Helper Discovery
- [x] Add helper discovery to mining
- [x] Implement discovery chance calculations
- [x] Create awakening cost system
- [x] Build helper inventory

### Helper Automation
- [x] Implement gnome watering automation
- [x] Add golem harvesting automation
- [x] Create helper efficiency calculations
- [x] Build helper assignment logic
- [x] Implement helper work cycles

### Helper Progression
- [x] Create helper leveling system
- [x] Implement training costs
- [x] Add specialization paths
- [x] Build efficiency scaling
- [x] Create helper management AI

**Milestone: Paradigm shifts occur at correct times** ✅

---

## Phase 6: Basic UI (Days 26-30) ✅ COMPLETED
*Create minimal functional interface*

### Control Panel Component
- [x] Create player behavior dials (check-ins, session length)
- [x] Add simulation speed controls
- [x] Build start/pause/reset buttons
- [x] Implement parameter input fields
- [x] Add profile preset buttons

### State Display Component
- [x] Create resource display (energy, gold, materials)
- [x] Add farm overview (plots, crops, water)
- [x] Build phase indicator
- [x] Show current action/location
- [x] Display helper status

### Event Log Component
- [x] Create scrollable event list
- [x] Add granularity controls (minimal/standard/detailed/debug)
- [x] Implement filtering by event type
- [ ] Add search functionality
- [ ] Build export to file option

### Basic Metrics Display
- [x] Show time between upgrades
- [x] Display current phase duration
- [x] Add resource efficiency metrics
- [x] Create simple progress indicators

**Milestone: Playable simulator with basic UI** ✅

---

## Phase 7: Advanced Visualization (Days 31-35) 🚧 IN PROGRESS
*Add charts and visual feedback*

### Chart Implementation
- [ ] Create resource flow over time chart
- [ ] Add phase progression timeline
- [ ] Build upgrade acquisition graph
- [ ] Implement bottleneck identification chart
- [ ] Add helper efficiency visualization

### Visual Indicators
- [x] Implement location symbols (🌱⚔️⛏️⚒️)
- [x] Add animated state transitions
- [x] Create progress bars for actions
- [x] Build visual phase timeline
- [ ] Add milestone notifications

### Dashboard Component
- [x] Create comprehensive metrics view
- [x] Add KPI cards with trends
- [x] Build comparison displays
- [x] Implement recommendation panel
- [x] Add export functionality

**Milestone: Full visualization suite operational** 🚧

---

## Phase 6.5: Enhanced Testing & Reporting ✅ COMPLETED (BONUS)
*Advanced testing and analysis capabilities*

### Quick Test Scenarios
- [x] Implement speedrunner profile (optimal play)
- [x] Add casual player profile (2-4 check-ins)
- [x] Create weekend warrior profile (heavy weekend play)
- [x] Build balance test profile (standard validation)

### Comprehensive Reporting
- [x] Generate full simulation reports
- [x] Implement performance metrics tracking
- [x] Add game balance analysis
- [x] Create design goal validation
- [x] Build player engagement analysis

### Export System
- [x] JSON export for complete data
- [x] CSV export for spreadsheet analysis
- [x] Markdown export for human-readable reports
- [x] Real-time report summaries in UI

**Milestone: Advanced analysis capabilities complete** ✅

---

## Phase 5: Helper System (Days 21-25)
*Implement the paradigm shift mechanics*

### Helper Discovery
- [ ] Add helper discovery to mining
- [ ] Implement discovery chance calculations
- [ ] Create awakening cost system
- [ ] Build helper inventory

### Helper Automation
- [ ] Implement gnome watering automation
- [ ] Add golem harvesting automation
- [ ] Create helper efficiency calculations
- [ ] Build helper assignment logic
- [ ] Implement helper work cycles

### Helper Progression
- [ ] Create helper leveling system
- [ ] Implement training costs
- [ ] Add specialization paths
- [ ] Build efficiency scaling
- [ ] Create helper management AI

**Milestone: Paradigm shifts occur at correct times**

---

## Phase 6: Basic UI (Days 26-30)
*Create minimal functional interface*

### Control Panel Component
- [ ] Create player behavior dials (check-ins, session length)
- [ ] Add simulation speed controls
- [ ] Build start/pause/reset buttons
- [ ] Implement parameter input fields
- [ ] Add profile preset buttons

### State Display Component
- [ ] Create resource display (energy, gold, materials)
- [ ] Add farm overview (plots, crops, water)
- [ ] Build phase indicator
- [ ] Show current action/location
- [ ] Display helper status

### Event Log Component
- [ ] Create scrollable event list
- [ ] Add granularity controls (minimal/standard/detailed/debug)
- [ ] Implement filtering by event type
- [ ] Add search functionality
- [ ] Build export to file option

### Basic Metrics Display
- [ ] Show time between upgrades
- [ ] Display current phase duration
- [ ] Add resource efficiency metrics
- [ ] Create simple progress indicators

**Milestone: Playable simulator with basic UI**

---

## Phase 7: Advanced Visualization (Days 31-35)
*Add charts and visual feedback*

### Chart Implementation
- [ ] Create resource flow over time chart
- [ ] Add phase progression timeline
- [ ] Build upgrade acquisition graph
- [ ] Implement bottleneck identification chart
- [ ] Add helper efficiency visualization

### Visual Indicators
- [ ] Implement location symbols (🌱⚔️⛏️⚒️)
- [ ] Add animated state transitions
- [ ] Create progress bars for actions
- [ ] Build visual phase timeline
- [ ] Add milestone notifications

### Dashboard Component
- [ ] Create comprehensive metrics view
- [ ] Add KPI cards with trends
- [ ] Build comparison displays
- [ ] Implement recommendation panel
- [ ] Add export functionality

**Milestone: Full visualization suite operational**

---

## Phase 8: Web Worker Integration (Days 33-35)
*Move simulation to background thread*

### Worker Setup
- [ ] Create simulator.worker.js file
- [ ] Move simulation engine to worker
- [ ] Implement message passing with Comlink
- [ ] Handle state synchronization
- [ ] Add progress updates

### Performance Optimization
- [ ] Profile simulation performance
- [ ] Optimize hot paths
- [ ] Implement state diffing
- [ ] Add batch update system
- [ ] Reduce memory allocations

**Milestone: Smooth UI during simulation**

---

## Phase 9: Advanced Features (Days 39-45)
*Implement analysis and testing tools*

### Monte Carlo System
- [ ] Create parallel simulation runner
- [ ] Implement variance parameters
- [ ] Build result aggregation
- [ ] Generate confidence intervals
- [ ] Create statistical reports

### A/B Testing Mode
- [ ] Implement dual simulation runs
- [ ] Build comparison interface
- [ ] Create diff highlighting
- [ ] Generate comparison reports
- [ ] Add statistical significance tests

### Bottleneck Analyzer
- [ ] Create automatic bottleneck detection
- [ ] Build bottleneck severity scoring
- [ ] Generate fix recommendations
- [ ] Implement what-if testing
- [ ] Create bottleneck timeline

### Scenario Testing
- [ ] Load test case definitions
- [ ] Run automated test suites
- [ ] Generate pass/fail reports
- [ ] Compare to expected outcomes
- [ ] Build regression detection

**Milestone: Advanced analysis capabilities complete**

---

## Phase 10: Polish & Documentation (Days 46-50)
*Finalize for production use*

### UI Polish
- [ ] Implement responsive design
- [ ] Add loading states
- [ ] Create error boundaries
- [ ] Build help tooltips
- [ ] Add keyboard shortcuts

### Data Management
- [ ] Create save/load simulation states
- [ ] Implement simulation history
- [ ] Build preset management
- [ ] Add batch import tools
- [ ] Create backup system

### Documentation
- [ ] Write user guide
- [ ] Create video tutorial
- [ ] Document all parameters
- [ ] Build example scenarios
- [ ] Add troubleshooting guide

### Testing
- [ ] Unit tests for core logic
- [ ] Integration tests for systems
- [ ] E2E tests for critical paths
- [ ] Performance benchmarks
- [ ] Cross-browser testing

### Deployment
- [ ] Production build optimization
- [ ] Set up GitHub Pages
- [ ] Create release workflow
- [ ] Add analytics (optional)
- [ ] Set up error reporting

**Milestone: Production-ready simulator**

---

## Development Principles

### Priority Order
1. **Core simulation accuracy** - Must predict progression correctly
2. **Data integrity** - Never modify game values
3. **Performance** - Must handle 28-day simulations smoothly
4. **Usability** - Clear interface and useful outputs
5. **Advanced features** - Nice-to-have analysis tools

### Testing Strategy
- Test each phase before moving to next
- Use console logging before UI
- Validate against expected progression times
- Run edge cases early and often

### Incremental Validation
After each phase, validate:
- Tutorial completes in 2 hours
- First helper discovered around day 4-5
- Energy generation matches targets
- Phase transitions occur correctly

### Time Estimates
- **Minimum viable simulator**: Phase 0-6 (30 days)
- **Full-featured simulator**: All phases (45-50 days)
- **Solo developer**: Add 50% to estimates
- **First-time Vue developer**: Add 100% to estimates

### Critical Path
These must be completed in order:
1. Data import system (Phase 0)
2. Core game state (Phase 1)
3. Simulation engine (Phase 2)
4. Basic UI (Phase 6)

Everything else can be reordered based on needs.

### Risk Mitigation
- **Biggest risk**: Simulation accuracy
  - Mitigation: Test early, test often
- **Second risk**: Performance with large logs
  - Mitigation: Implement pagination early
- **Third risk**: Data corruption
  - Mitigation: Immutable structures from start

---

## Success Criteria

The simulator is complete when it can:
1. ✅ Import all game values without modification
2. ✅ Simulate 28 days of gameplay in <10 seconds
3. ✅ Predict phase transitions within ±10% of targets
4. ✅ Identify bottlenecks accurately
5. ✅ Generate actionable recommendations
6. ✅ Run 100+ Monte Carlo simulations
7. ✅ Export results for further analysis
8. ✅ Work on any modern browser
9. ✅ Deploy to GitHub Pages
10. ✅ Handle edge cases gracefully

---

## Quick Start Path

If you need results fast, build in this order:
1. Phase 0 + 1: Foundation and state (Days 1-5)
2. Phase 2: Core simulation (Days 6-10)
3. Phase 6: Basic UI (Days 26-30)
4. Test and validate
5. Add other features as needed

This gives you a working simulator in ~15 days that can answer basic balance questions.