# Time Hero Simulator - Key Changes Summary

## Quick Reference: Old vs New Game Design

### Fundamental Change: Time System
- **OLD**: Game days (Day 1, Day 2, etc.) with accelerated time
- **NEW**: Real-time minutes/hours - all timers use real-world time
  - 6 minute crop = 6 real minutes
  - 30 minute adventure = 30 real minutes
  - Offline progression continues in real-time

### Phase Progression
- **OLD**: Time-based (Tutorial Day 1, Early Days 2-3, etc.)
- **NEW**: Achievement-based via Land Deeds
  - Tutorial: 3→8 plots
  - Early: 8→20 plots  
  - Mid: 20→40 plots (Homestead Deed)
  - Late: 40→65 plots (Manor Grounds Deed)
  - Endgame: 65→90 plots (Great Estate Deed)

### Screen Navigation
- **OLD**: Single screen with all systems
- **NEW**: 6 distinct screens in T-shape layout
  ```
         [Tower]
            |
  [Town]—[Home]—[Sign]—[Adventure]
            |
         [Forge]
            |
          [Mine]
  ```

### Combat System
- **OLD**: Simple energy cost → reward
- **NEW**: Full combat mechanics
  - Hero HP separate from Energy
  - 5 weapon types with combat pentagon
  - Armor system with defense and special effects
  - Enemy types with advantages/disadvantages
  - Boss fights with unique mechanics

### Helper System
- **OLD**: Generic helpers with basic automation
- **NEW**: 5 named Gnomes with specific roles
  - Rescued from adventure bosses (one-time)
  - 10 different roles (Waterer, Harvester, Fighter, etc.)
  - Level 1-10 progression per gnome
  - Housing requirements from Carpenter
  - Role can be changed anytime

### Material System
- **OLD**: Direct use of materials
- **NEW**: Raw → Refined process
  - Mining produces Raw materials
  - Forge refines Raw → Refined
  - Crafting uses Refined materials
  - Boss materials from adventures

### Tower System (Seed Catching)
- **OLD**: Tower floors with automatic seed generation
- **NEW**: Active catching minigame with wind levels
  - 11 Reach levels (Ground to Low Orbit)
  - Seed Levels 0-9 tied to wind bands
  - Nets improve active catch rate
  - Auto-Catchers for passive collection

### Vendor System (Town)
- **OLD**: Single upgrade shop
- **NEW**: 6 specialized vendors
  - **Blacksmith**: Tools, weapons, forge upgrades
  - **Agronomist**: Farm infrastructure
  - **Land Steward**: Land deeds
  - **Carpenter**: Tower, gnome housing
  - **Skills Trainer**: Hero abilities
  - **Material Trader**: Resource exchange

### Tool Progression
- **OLD**: Single tool version
- **NEW**: Three tiers per tool
  - Base: Enable mechanic
  - Plus (+): 2x efficiency, need boss materials
  - Master: 3-4x efficiency, special abilities, epic names

### Upgrade Prerequisites
- **OLD**: Mostly day-based unlocks
- **NEW**: Complex prerequisite chains
  - Previous upgrade requirements
  - Farm stage requirements (🏡 icons)
  - Tool/building requirements
  - Boss material requirements

### Mining System
- **OLD**: Simple energy → materials
- **NEW**: Depth-based with exponential drain
  - 10 depth levels (Surface to Abyss)
  - Energy drain doubles each level (2→4→8→16...)
  - Pickaxe efficiency reduces drain
  - Shortcuts to start at cleared depths

### Crafting/Forge
- **OLD**: Instant crafting
- **NEW**: Time-based with heat mechanics
  - Bellows control heat bands
  - Success rates based on heat
  - Batch crafting unlocks
  - Material refinement required

### Crop System
- **OLD**: Unlock by day (Day 1, Day 3, etc.)
- **NEW**: Seed Levels 0-9
  - Tied to Tower reach levels
  - 30 total crops (was ~20)
  - Longer growth times for late crops (up to 50 min)

### Adventure Routes
- **OLD**: 8 routes with simple scaling
- **NEW**: 7 main routes with complex mechanics
  - Enemy composition affects strategy
  - Boss fights with weaknesses
  - Armor drops from bosses
  - First clear bonuses (gnome rescues)

### Resource Caps
- **OLD**: Simple energy/gold caps
- **NEW**: Multiple storage systems
  - Energy: 50→100,000
  - Water: 20→10,000
  - Seeds: 50→2,000
  - Materials: 50→1,000 per type
  - Gold: No cap

### Player Decisions
- **OLD**: Simple priority system
- **NEW**: Complex decision tree
  - Screen navigation choices
  - Combat loadout selection
  - Helper role assignments
  - Mining depth targets
  - Forge queue management

---

## Critical Implementation Notes

### Data Structure Philosophy
1. **Immutable Game Values**: Never modify imported CSVs
2. **Simulation Rules**: Separate from game values, can be tweaked
3. **Player Behavior**: Configurable per archetype

### New Metrics to Track
- Screen time distribution (% per screen)
- Combat success rates by loadout
- Helper efficiency by role
- Material bottlenecks by phase
- Offline vs active progression ratio

### Validation Priorities
1. **Phase Timing**: Must match design targets
2. **Helper Discovery**: Day 4-5 first gnome
3. **Resource Balance**: No infinite loops
4. **Combat Viability**: All routes completable
5. **Offline Fairness**: Meaningful but not overpowered

### Key Paradigm Shifts to Model
1. **Day 4-5**: First gnome transforms farming
2. **Day 10-12**: Multiple helpers enable 40+ plots
3. **Day 18-20**: Full automation achieved
4. **Day 25-30**: Optimization and perfection

---

## Testing Focus Areas

### Phase 1 (Data)
- CSV structure validation
- Prerequisite chain integrity
- Cost progression curves
- Material availability timing

### Phase 2 (UI)
- Vendor categorization clarity
- Prerequisite visualization
- Multi-currency display
- Farm stage indicators

### Phase 3 (Engine)
- Real-time progression accuracy
- Combat formula correctness
- Helper automation logic
- Offline calculation fairness

### Phase 4 (UI)
- Screen time tracking
- Combat panel functionality
- Helper management interface
- Mining depth visualization

### Phase 5 (Reports)
- Metric calculation accuracy
- Report generation speed
- Export format completeness
- Bottleneck identification

---

## Common Pitfalls to Avoid

1. **Don't use game days** - Everything is real-time minutes
2. **Don't unlock by time** - Use prerequisites and achievements
3. **Don't skip refinement** - Raw materials can't be used directly
4. **Don't ignore housing** - Gnomes need homes to work
5. **Don't simplify combat** - Full weapon triangle matters
6. **Don't flatten progression** - Paradigm shifts are critical
7. **Don't merge screens** - Each has distinct purpose
8. **Don't rush offline** - Cap at 24 hours, balance carefully

---

## Success Metrics

The simulator succeeds when it can:
1. Predict phase timing within ±10%
2. Identify helper discovery as paradigm shift
3. Show screen time distribution accurately
4. Calculate combat outcomes deterministically
5. Model offline progression fairly
6. Generate actionable balance recommendations
7. Export data for further analysis
8. Run 1000 Monte Carlo simulations efficiently

---