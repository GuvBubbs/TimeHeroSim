# Time Hero Simulator Update Documentation

## Overview
This directory contains comprehensive documentation for updating the Time Hero Simulator to match the new game design (2025 version). The update represents a major overhaul of game systems, moving from a time-based progression to an achievement-based system with real-time mechanics.

## Document Guide

### 📋 Planning Documents

#### UPDATE_PLAN_2025.md
**Purpose**: Master planning document for the entire update process  
**Contents**:
- 5-phase implementation plan over 6-8 weeks
- System architecture updates
- Risk mitigation strategies
- Success criteria
- Testing requirements

**Use this when**: You need the big picture or are planning sprint work

#### KEY_CHANGES_SUMMARY.md
**Purpose**: Quick reference comparing old vs new game design  
**Contents**:
- Side-by-side comparison of all major systems
- Critical implementation notes
- Common pitfalls to avoid
- Success metrics

**Use this when**: You need to quickly understand what's changing

#### PHASE_1_IMPLEMENTATION.md
**Purpose**: Detailed specifications for Phase 1 (Data Configuration)  
**Contents**:
- Complete CSV structures with sample data
- Field descriptions and formats
- Implementation checklist
- Data validation requirements

**Use this when**: You're implementing the CSV files and data layer

---

## Implementation Phases

### Phase 1: Data Configuration (Week 1)
**Status**: Ready to implement  
**Documentation**: PHASE_1_IMPLEMENTATION.md
- Create 10 new CSV files
- Update 3 existing CSV files  
- Implement data validation
- Update configuration UI

### Phase 2: Upgrade Trees (Week 2)
**Status**: Planned
**Key Changes**:
- Vendor-based categorization
- Complex prerequisite chains
- Multi-currency costs
- Visual dependency graph

### Phase 3: Simulation Engine (Weeks 3-4)
**Status**: Planned
**Key Changes**:
- Real-time progression
- Screen-based navigation
- Combat system
- Helper automation
- Offline progression

### Phase 4: UI Updates (Week 5)
**Status**: Planned
**Key Changes**:
- T-shaped screen layout
- Helper management panel
- Combat simulator
- Mining tracker

### Phase 5: Reports & Analysis (Week 6)
**Status**: Planned
**Key Changes**:
- New metrics (screen time, combat, helpers)
- Phase progression reports
- Bottleneck analysis
- Export formats

---

## Quick Start Guide

### For Developers

1. **Read first**: KEY_CHANGES_SUMMARY.md - Understand what's changing
2. **Review plan**: UPDATE_PLAN_2025.md - See the full scope
3. **Start Phase 1**: PHASE_1_IMPLEMENTATION.md - Begin with data layer

### For Project Managers

1. **Timeline**: 6-8 weeks total, structured in 5 phases
2. **Priority**: Phase 1-3 are critical, Phase 4-5 enhance visualization
3. **Testing**: Each phase has specific validation requirements
4. **Risk**: Main risks are data migration and simulation accuracy

### For QA/Testing

1. **Validation tests**: See "Testing Strategy" in UPDATE_PLAN_2025.md
2. **Phase milestones**: Each phase has specific success criteria
3. **Reference docs**: Original game design documents in project root

---

## Key Concepts to Understand

### Real-Time Progression
- **OLD**: Accelerated game days
- **NEW**: Real-world minutes/hours
- **Impact**: All timers and calculations must use real time

### Screen-Based Navigation
- **OLD**: Single page application
- **NEW**: 6 distinct game screens
- **Impact**: Must track screen time and transitions

### Helper (Gnome) System
- **OLD**: Generic automation
- **NEW**: 5 named gnomes with 10 roles
- **Impact**: Complex role assignment and leveling

### Combat Pentagon
- **Weapons**: Spear, Sword, Bow, Crossbow, Wand
- **Enemies**: 5 types with advantages
- **Impact**: Deterministic combat simulation

### Material Refinement
- **Raw**: From mining/adventures
- **Refined**: Processed at forge
- **Boss**: Special materials from bosses
- **Impact**: Two-step crafting process

---

## File Structure

```
/time-hero-simulator/
├── /data/                    # CSV configuration files
│   ├── crops.csv            # [UPDATE] Add seedLevel
│   ├── adventures.csv       # [UPDATE] Add combat data
│   ├── upgrades.csv         # [UPDATE] Reorganize by vendor
│   ├── weapons.csv          # [NEW] 5 types, 10 levels each
│   ├── armor.csv            # [NEW] Defense and effects
│   ├── tools.csv            # [NEW] Base/Plus/Master tiers
│   ├── helpers.csv          # [NEW] 5 gnomes
│   ├── helper_roles.csv     # [NEW] 10 roles
│   ├── mining.csv           # [NEW] 10 depth levels
│   ├── tower_levels.csv     # [NEW] 11 reach levels
│   ├── vendors.csv          # [NEW] 6 vendors
│   ├── cleanups.csv         # [NEW] Farm cleanups
│   └── boss_materials.csv   # [NEW] Special materials
│
├── /src/
│   ├── /stores/
│   │   └── gameValues.js    # [UPDATE] Add new data structures
│   ├── /utils/
│   │   ├── simulationEngine.js  # [REWRITE] Real-time engine
│   │   ├── combatEngine.js      # [NEW] Combat mechanics
│   │   ├── helperEngine.js      # [NEW] Gnome automation
│   │   └── offlineEngine.js     # [NEW] Offline progression
│   └── /pages/
│       └── GameConfiguration.vue # [UPDATE] New data tabs
│
└── /docs/
    ├── UPDATE_PLAN_2025.md        # This plan
    ├── KEY_CHANGES_SUMMARY.md     # Quick reference
    └── PHASE_1_IMPLEMENTATION.md   # CSV specifications
```

---

## Version Control Strategy

### Branching
```bash
main
├── feature/phase-1-data-config
├── feature/phase-2-upgrade-trees  
├── feature/phase-3-simulation-engine
├── feature/phase-4-ui-updates
└── feature/phase-5-reports
```

### Commit Messages
```
feat(data): Add weapons.csv with 10 levels per type
fix(engine): Correct real-time progression calculation
docs(phase1): Update implementation checklist
test(combat): Add combat formula validation tests
```

---

## Questions & Support

### Common Questions

**Q: Why real-time instead of game days?**  
A: Matches the actual Playdate game experience where players play in short real-world sessions.

**Q: Why 6 screens instead of one?**  
A: Each screen represents a distinct location in the game world with specific activities.

**Q: Why separate raw and refined materials?**  
A: Adds depth to the crafting system and creates meaningful forge gameplay.

**Q: How do helpers differ from the old system?**  
A: Helpers are now unique characters (gnomes) with names, roles, and progression systems.

### Need Help?

1. Check the game design documents in the project root
2. Review the validation tests for expected behavior
3. Reference the original progression guide for balance targets
4. Use the simulator validation tests as acceptance criteria

---

## Next Steps

1. ✅ Review this documentation
2. ⬜ Set up feature branches
3. ⬜ Begin Phase 1 implementation
4. ⬜ Create test data sets
5. ⬜ Schedule weekly reviews

---

*Last Updated: January 2025*  
*Documentation Version: 1.0*  
*Game Design Version: 2025 Real-Time*