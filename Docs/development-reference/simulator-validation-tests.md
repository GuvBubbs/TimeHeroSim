# Time Hero Simulator - Validation Test Suite

## Purpose
This document provides comprehensive test cases to validate that the simulator accurately predicts the player experience as designed in the progression guide. Each test includes expected outcomes, acceptable variance, and failure conditions.

---

## Phase Timing Validation

### Tutorial Phase Tests
**Test ID**: PHASE-TUT-001
**Profile**: New player, 65% efficiency
**Expected Duration**: 1-2 hours
**Key Milestones**:
- First crop planted: 0-5 minutes
- First harvest: 6-10 minutes  
- First adventure: 15-30 minutes
- 8 plots reached: 1-2 hours
- Hoe crafted: 1.5-2 hours

**Pass Criteria**: 
- Phase completes in 1-4 hours
- Player has 5-10 energy generation/min by end
- At least 1 adventure completed

**Fail Conditions**:
- Phase takes >4 hours
- Player gets stuck with <3 energy
- No adventures attempted

---

### Early Phase Tests
**Test ID**: PHASE-EARLY-001
**Profile**: Casual player, 70% efficiency, 3 check-ins/day
**Expected Duration**: 2-3 days
**Key Milestones**:
- Mining unlocked: Day 1-2
- Forge unlocked: Day 2
- First weapon crafted: Day 2-3
- 20 plots reached: Day 3
- Tower Floor 2 built: Day 2-3

**Pass Criteria**:
- Phase completes in 1-5 days
- Energy generation 10-20/min by end
- At least 2 weapon types crafted
- Mining depth 2-3 reached

**Fail Conditions**:
- Phase takes >5 days
- Player never crafts weapons
- Energy generation <5/min at day 3

---

### Mid Phase Tests  
**Test ID**: PHASE-MID-001
**Profile**: Regular player, 75% efficiency, 4 check-ins/day
**Expected Duration**: 4-5 days (Days 3-7 total)
**Key Milestones**:
- **CRITICAL**: First gnome discovered Day 4-5
- First farm expansion: Day 5-6
- 40 plots reached: Day 6-7
- Multiple helpers active: Day 6-7
- Tower Floor 3-4: Day 5-6

**Pass Criteria**:
- Helper discovered when plots 20-25
- Farm expansion completed by Day 7
- Energy generation 50-100/min
- At least 2 helpers active

**Fail Conditions**:
- No helper by Day 6
- Farm not expanded by Day 8
- Still manually managing 30+ plots

---

### Late Phase Tests
**Test ID**: PHASE-LATE-001
**Profile**: Engaged player, 85% efficiency, 5 check-ins/day
**Expected Duration**: 7 days (Week 2)
**Key Milestones**:
- Second farm expansion: Day 10-12
- Crystal materials obtained: Day 11-13
- 65 plots reached: Day 13-14
- 5+ helpers active: Day 12-14
- Deep mining (Depth 6+): Day 11-13

**Pass Criteria**:
- Automation handling 50%+ tasks
- Energy generation 200-400/min
- Adventures lasting 45-90 minutes
- Mythril discovered

**Fail Conditions**:
- Manual management still required
- Energy generation <100/min
- No crystal tier items

---

### Endgame Phase Tests
**Test ID**: PHASE-END-001
**Profile**: Optimized player, 95% efficiency, 6+ check-ins/day
**Expected Duration**: 7-14 days (Weeks 3-4)
**Key Milestones**:
- Third farm expansion: Week 3
- 90 plots reached: Week 3-4
- 10+ helpers active: Week 3
- All crops unlocked: Week 4
- Maximum depth mining: Week 4

**Pass Criteria**:
- Full automation achieved
- Energy generation 500-1000/min
- All weapon types crafted
- Can run 2-3 hour adventures

**Fail Conditions**:
- Progression stalls before 90 plots
- Energy cap prevents progress
- Helper training bottleneck

---

## Player Archetype Tests

### Speedrunner Test
**Test ID**: PLAYER-SPEED-001
**Profile**: 
- 10 check-ins/day
- 95% efficiency throughout
- Optimal decisions always
- 30-minute sessions

**Expected Results**:
- Tutorial: 45 minutes
- Early: 1.5 days
- Mid: 3 days  
- Late: 5 days
- Endgame reached: Day 14-18
- Total time: 18-21 days

**Key Behaviors**:
- Always chooses long adventures
- Prioritizes energy storage
- Rushes to helpers
- Optimizes material gathering

---

### Casual Worker Test
**Test ID**: PLAYER-CASUAL-001
**Profile**:
- 2 check-ins/day (morning, evening)
- 70% efficiency
- 10-minute weekday sessions
- 20-minute weekend sessions
- Can't play during work hours

**Expected Results**:
- Tutorial: 3-4 real days
- Early: 5-7 days
- Mid: 7-10 days
- Late: 10-14 days
- Endgame reached: Day 28-35

**Key Behaviors**:
- Prefers short adventures
- Often hits storage caps
- Misses some optimal upgrades
- Helper discovery around Day 6-8

---

### Weekend Warrior Test
**Test ID**: PLAYER-WEEKEND-001
**Profile**:
- 1 check-in on weekdays
- 5 check-ins on weekends
- 80% efficiency
- 5-minute weekday sessions
- 45-minute weekend sessions

**Expected Results**:
- Tutorial: Complete on first weekend
- Progress bursts on weekends
- Endgame reached: 4-5 weeks
- Heavy reliance on idle progression

---

## System-Specific Validation

### Farm System Tests
**Test ID**: FARM-001
**Conditions**: 20 plots, 5 different crops, 1 gnome helper
**Expected Behavior**:
- Hero focuses on harvesting
- Gnome maintains watering
- Energy generation: 15-25/min
- Water consumption: 20-30/min
- Harvest cycle: 10-15 minutes

**Validation Points**:
- [ ] Hero never waters if gnome active
- [ ] Crops never die from lack of water
- [ ] Energy generation matches formula
- [ ] Storage fills in 30-60 minutes

---

### Adventure System Tests
**Test ID**: ADV-001
**Route**: Mountain Pass (Long)
**Requirements**: 1000 energy, sword equipped
**Expected Results**:
- Duration: 60 minutes
- Gold reward: 1,500 (±10%)
- Silver materials: 3
- Success rate: 95%
- Screen time: 60 minutes on adventure screen

**Validation Points**:
- [ ] Adventure blocks all farming
- [ ] Rewards scale with route tier
- [ ] Combat triangle affects efficiency
- [ ] Boss drops guaranteed materials

---

### Mining System Tests
**Test ID**: MINE-001
**Depth**: Level 5
**Energy Drain**: 16/minute
**With Max Energy**: 1,500
**Expected Results**:
- Session duration: 93 minutes maximum
- Iron obtained: 15-25 units
- Silver obtained: 5-10 units
- Helper discovery: 5-10% chance
- Early termination if energy critical

**Validation Points**:
- [ ] Exponential energy drain working
- [ ] Material drops match tables
- [ ] Helper discovery triggers
- [ ] Pity system increases chances

---

### Helper System Tests
**Test ID**: HELPER-001
**Scenario**: First gnome discovery
**Trigger Conditions**:
- 20-25 plots active
- Day 4-5
- Mining depth 3-4
- 3-5 mining attempts

**Expected Behavior**:
- Discovery chance starts at 5%
- Increases by 2% per failed attempt
- Guaranteed by 10th attempt (pity system)
- Activation cost: 100 energy + 10 copper
- Immediate efficiency improvement

**Post-Discovery Validation**:
- [ ] Farm efficiency increases 30-40%
- [ ] Player can manage 30+ plots
- [ ] Water management automated
- [ ] Energy generation increases

---

## Screen Time Distribution Tests

### Balanced Gameplay Test
**Test ID**: SCREEN-001
**Profile**: Average player, full progression
**Expected Distribution**:
- Home/Farm: 30-40%
- Adventures: 25-35%
- Mining: 10-15%
- Tower: 5-10%
- Forge: 5-10%
- Town: 10-15%

**Warning Thresholds**:
- Any screen >50%: Overutilized
- Any screen <2%: Underutilized
- Farm <25%: Core loop broken
- Adventures >45%: Too rewarding

---

## Bottleneck Detection Tests

### Storage Bottleneck Test
**Test ID**: BOTTLE-STORAGE-001
**Setup**: Reduce all storage by 50%
**Expected Results**:
- Energy waste >30% of production
- Frequent storage cap warnings
- Progression 20-30% slower
- Storage upgrades prioritized

---

### Material Bottleneck Test  
**Test ID**: BOTTLE-MATERIAL-001
**Setup**: Reduce material drops by 30%
**Expected Results**:
- Crafting delays increase
- Tool progression slows
- More mining required
- Alternative routes sought

---

### Helper Bottleneck Test
**Test ID**: BOTTLE-HELPER-001  
**Setup**: Reduce helper efficiency by 40%
**Expected Results**:
- Farm overwhelm at 15 plots
- Earlier helper discovery attempts
- Multiple helpers required sooner
- Training prioritized

---

## Validation Reporting

### Success Criteria Summary
A simulation run passes validation if:
- [ ] 80% of phase timing tests pass
- [ ] 90% of milestone timings within ±20%
- [ ] No soft-lock conditions encountered
- [ ] Screen time distribution balanced
- [ ] Bottlenecks occur at designed points
- [ ] Helper discovery creates paradigm shift
- [ ] All player archetypes can complete game

### Failure Analysis
When a test fails, record:
1. Which specific milestone was missed
2. By how much (percentage/time)
3. What caused the deviation
4. Recommended balance adjustment
5. Retest results after adjustment

### Validation Report Format
```
VALIDATION RUN: [Date/Time]
Simulator Version: [X.X.X]
Game Values Version: [X.X.X]

PHASE TIMING: 18/20 tests passed (90%)
- Tutorial: ✓ All tests passed
- Early: ✓ All tests passed  
- Mid: ⚠️ Helper discovery delayed by 1.2 days
- Late: ✓ All tests passed
- Endgame: ✓ All tests passed

PLAYER ARCHETYPES: 3/3 passed (100%)
- Speedrunner: 19 days (✓ Within range)
- Casual: 32 days (✓ Within range)
- Weekend: 28 days (✓ Within range)

SYSTEM TESTS: 24/25 passed (96%)
- Farm: ✓ All validations passed
- Adventure: ✓ All validations passed
- Mining: ⚠️ Helper discovery rate 3% (expected 5%)
- Helpers: ✓ All validations passed

BOTTLENECKS: Correctly identified 3/3
- Storage overflow at phase transitions ✓
- Material shortage before crafting ✓
- Helper overwhelm at 20+ plots ✓

OVERALL: PASS with minor adjustments needed
```

---

## Regression Testing

After any balance change, run these core tests:
1. **Tutorial Completion** - Must finish in 1-4 hours
2. **First Helper** - Must occur Days 4-6
3. **Phase Progression** - All phases reachable
4. **Endgame Timing** - 21-35 days to complete
5. **Screen Balance** - No screen >45% of time

## Continuous Validation

The simulator should automatically run these validation tests:
- After every balance value import
- Before committing changes to repository
- As part of CI/CD pipeline
- When comparing A/B test variants

Store all validation reports in `/validation-reports/` for historical tracking and regression detection.