# Time Hero - Comprehensive Balance & Scaling Guide

## Core Philosophy
Time Hero is balanced around **meaningful progression jumps** rather than smooth curves. Each phase should feel distinctly different from the previous, with paradigm shifts that fundamentally change gameplay. The game scales through **interconnected bottlenecks** where solving one problem reveals the next challenge.

---

## Universal Scaling Rules

### The 5x Phase Multiplier
**Every major phase transition multiplies key metrics by 5x:**
- Energy generation: 2/min → 10/min → 50/min → 250/min
- Storage capacity: 50 → 300 → 1,500 → 6,000 → 20,000
- Adventure costs: 10 → 50 → 250 → 1,250 → 6,250
- Material requirements: 5 → 25 → 125 → 625

**Why 5x?** This creates clear "eras" where previous content becomes trivial, forcing players to engage with new systems. It's large enough to feel meaningful but small enough to achieve in 2-3 days.

### The 1.5x Upgrade Cost Multiplier
**Within a tier, each subsequent upgrade costs 1.5x the previous:**
- Storage I: 20 gold
- Storage II: 30 gold (20 × 1.5)
- Storage III: 45 gold (30 × 1.5)
- Storage IV: 67 gold (45 × 1.5)

**Why 1.5x?** This creates natural breakpoints where players must choose between upgrading further or saving for the next tier. It prevents players from maxing one system too early.

### The 10x Tier Jump
**Moving to a new tier of anything costs 10x the last upgrade of the previous tier:**
- Iron tools: ~500 gold
- Silver tools: ~5,000 gold (10x)
- Crystal tools: ~50,000 gold (10x)
- Mythril tools: ~500,000 gold (10x)

**Why 10x?** This forces players to fully utilize each tier before moving on. It creates anticipation and makes tier transitions feel earned.

---

## Energy Economy Scaling

### Crop Energy Values
**Base Formula:** `Energy = Tier_Multiplier × Growth_Stage_Bonus × Rarity_Factor`

**Tier Multipliers:**
- Early crops: 0.5-2.5 energy
- Mid crops: 2.5-12 energy
- Late crops: 8-40 energy
- Endgame crops: 18-65 energy

**Growth Stage Bonus:**
- 3 stages: 1.0x multiplier
- 4 stages: 1.5x multiplier
- 5 stages: 2.0x multiplier

**Balancing Logic:** A 5-stage crop should provide roughly 2x the energy of a 3-stage crop in the same tier to compensate for the longer growth time and increased water management.

### Plot Scaling
**Plots per Phase:**
- Tutorial: 3-8 plots
- Early: 8-20 plots
- Mid: 20-40 plots
- Late: 40-65 plots
- Endgame: 65-90 plots
- Post-game: 90-120 plots

**Energy Generation Formula:** `Total_Energy = Plots × Average_Crop_Value × Harvest_Frequency`

**Target Energy/Minute by Phase:**
- Tutorial: 0.5-2/min (enables 3-min adventures every 30 min)
- Early: 2-15/min (enables 15-min adventures every 20 min)
- Mid: 15-75/min (enables 30-min adventures every 10 min)
- Late: 75-300/min (enables 60-min adventures every 5 min)
- Endgame: 300-1,000/min (enables continuous adventuring)

---

## Adventure Scaling

### Energy Cost Structure
**Base Formula:** `Energy_Cost = 10 × Route_Tier × Duration_Minutes × Depth_Modifier`

**Depth Modifiers:**
- Short (20% energy): 0.2x multiplier, 2.0x gold/energy efficiency
- Medium (50% energy): 0.5x multiplier, 1.5x gold/energy efficiency
- Long (100% energy): 1.0x multiplier, 1.0x gold/energy efficiency

**Why this structure?** Long runs are most energy-efficient but require commitment. Short runs allow active play. This creates meaningful choice based on playstyle.

### Adventure Duration Progression
- Phase 1: 2-10 minutes (testing waters)
- Phase 2: 10-30 minutes (establishing routine)
- Phase 3: 30-60 minutes (commitment required)
- Phase 4: 60-120 minutes (true idle gameplay)
- Phase 5: 120-180 minutes (empire management)

**Gold Rewards:** `Gold = Energy_Cost × 2 × (1 + Route_Tier × 0.5)`

This ensures later routes are more gold-efficient, pulling players forward.

### Material Drop Rates
**Common Materials (60% chance):** Tier-appropriate basics
**Uncommon Materials (30% chance):** Next-tier materials
**Rare Materials (10% chance):** Tier+2 materials or special items

**Boss Guarantees:** Always drop 5-10x normal materials to make boss routes special.

---

## Mining Depth Scaling

### Energy Drain Progression
**Formula:** `Energy_per_Minute = 2^(Depth-1)`
- Depth 1: 1/min (sustainable)
- Depth 5: 16/min (strategic runs)
- Depth 10: 512/min (burst mining only)

**Why exponential?** This creates natural depth limits based on energy generation. Players can always push deeper but for shorter periods. Early depths remain useful for specific materials.

### Material Value Scaling
**Drop Quantity Formula:** `Base_Quantity × (1 + Depth × 0.2)`

**Material Rarity by Depth:**
- Depths 1-2: Stone, Copper
- Depths 3-4: Copper, Iron
- Depths 5-6: Iron, Silver
- Depths 7-8: Silver, Crystal
- Depths 9-10: Crystal, Mythril, Obsidian

**Helper Discovery Rates:**
- Depths 3-4: 5-10% for Gnomes
- Depths 5-6: 5-10% for Stone Golems
- Depths 7-8: 5-10% for Crystal Golems
- Depths 9-10: 5-10% for Ancient Golems

---

## Tower Seed Progression

### Catch Rate Scaling
**Base rates:** 1 seed/min → 2 → 3 → 4 → 5 → 6 → 8
**With upgrades:** +20% → +40% → +60% → +80% per tier

### Floor Cost Progression
**Formula:** `Cost = Base_Cost × 10^(Floor-1)`
- Floor 2: 100 gold + 50 energy
- Floor 3: 500 gold + 200 energy
- Floor 4: 2,000 gold + 1,000 energy
- Floor 5: 10,000 gold + 5,000 energy

**Seed Tier Gating:** Each floor unlocks seeds for the next crop tier. This creates parallel progression - you need the tower to get seeds for better crops.

### Auto-Catcher Efficiency
- Tier 1: 25% efficiency (barely helpful)
- Tier 2: 50% efficiency (meaningful automation)
- Tier 3: 75% efficiency (near-full automation)

**Why not 100%?** Maintains advantage for active play while enabling idle progress.

---

## Farm Expansion - Tick/Tock System

### Tick Upgrades (Cleanup)
**Energy Cost Formula:** `Energy = Base_Cost × 1.5^Tick_Number × Phase_Multiplier`

**Cleanup Progression per Phase:**
- Tutorial: 5-10 energy per weed
- Early: 20-50 energy per rock
- Mid: 100-400 energy per boulder/stump
- Late: 500-1,500 energy per excavation
- Endgame: 2,000-5,000 energy per magical obstacle

**Plots Unlocked:** 2-5 plots per tick cleanup

**Why this works:** Players spend accumulated energy between major expansions, creating a satisfying drain/build cycle.

### Tock Upgrades (Major Expansion)
**Cost Formula:** `Energy = Previous_Tock × 5`
- First expansion: 1,500 energy
- Second expansion: 6,000 energy
- Third expansion: 20,000 energy
- Fourth expansion: 100,000 energy

**Camera Expansion:** +50 tiles (2 screens) per tock

**Design Intent:** Major expansions are celebration moments that fundamentally change the farm's scale.

---

## Helper System Scaling

### Helper Efficiency Progression
**Base Efficiency:**
- Gnomes: Handle 5 plots → 10 → 15 with upgrades
- Stone Golems: Handle 10 plots → 20 → 30
- Crystal Golems: Handle 15 plots → 30 → 45
- Ancient Golems: Handle 20 plots → 40 → 60

### Helper Training Costs
**XP Formula:** `XP_Required = 100 × 3^(Level-1)`
**Food Formula:** `Food_Cost = 50 × Level^2 × Crop_Tier`
**Time Formula:** `Hours = 2^(Level-1)` (30 min → 1h → 2h → 4h → 8h)

**Why exponential?** Makes each level feel significant. Level 10 helpers are true achievements requiring weeks of investment.

### Paradigm Shift Thresholds
- **20 plots:** Hero overwhelmed, first gnome essential
- **40 plots:** Multiple helpers required
- **65 plots:** Full automation necessary
- **90 plots:** Helper kingdom management

---

## Tool & Weapon Crafting

### Material Requirements
**Base Formula:** `Materials = Tier_Base × (1 + Tool_Complexity)`

**Tier Bases:**
- Wood/Stone: 5-10 units
- Copper: 5-8 units
- Iron: 3-5 units
- Silver: 2-3 units
- Crystal: 1-2 units
- Mythril: 1 unit

### Crafting Time
**Formula:** `Time = 5 × Tier × Complexity_Factor`
- Basic tools: 5-10 minutes
- Advanced tools: 15-30 minutes
- Elite tools: 45-90 minutes

### Success Rates
- Basic tier: 95-100%
- Iron tier: 90-95%
- Silver tier: 85-90%
- Crystal tier: 80-85%
- Mythril tier: 75-80%

**Failed Craft Returns:** Always 50% materials to prevent total loss frustration.

---

## Storage Scaling

### Capacity Progression
**Formula:** `Next_Capacity = Current × 3` (early) or `Current × 4` (late)

**Storage Philosophy:** Should hold 4-8 hours of production at current rates. This allows overnight idle play without waste.

**Critical Ratios:**
- Energy storage = 30-60 minutes of production
- Water storage = 2-4 hours of watering needs
- Seed storage = 1 week of catching at current rate

---

## Gold Economy

### Income Sources & Ratios
- Adventures: 70% of gold income
- Mining: 20% of gold income
- Special events: 10% of gold income

### Spending Distribution
- Town blueprints: 40% of gold
- Tool blueprints: 30% of gold
- Upgrades: 20% of gold
- Helper costs: 10% of gold

### Price Anchoring
**Every phase has a "goal purchase" costing roughly 2 hours of income:**
- Early: Storage upgrade (100 gold)
- Mid: New tool blueprint (1,000 gold)
- Late: Major infrastructure (10,000 gold)
- Endgame: Ultimate upgrades (100,000 gold)

---

## Time Investment Targets

### Daily Progression Goals
- **Day 1:** Reach 10 plots, unlock mining
- **Day 2:** Craft first weapon, build tower floor 2
- **Day 3:** Find first helper, complete 5+ adventures
- **Week 1:** First farm expansion, reach mine depth 5
- **Week 2:** Full automation, crystal tools
- **Week 3:** Helper specialization, mythril access
- **Week 4:** Ready for endless optimization phase

### Session Length Targets
- **Tutorial:** 5-10 minute sessions every 30 minutes
- **Early:** 10-15 minute sessions every hour
- **Mid:** 15-30 minute sessions every 2-4 hours
- **Late:** 30-45 minute sessions twice daily
- **Endgame:** 45-60 minute sessions once daily
- **Post-game:** Weekly major sessions

---

## Bottleneck Design

### Intentional Bottlenecks by Phase

**Tutorial Bottleneck:** Energy storage
- Forces frequent returns
- Teaches core loop
- Solution: First storage upgrade

**Early Bottleneck:** Water management
- Limits plot efficiency
- Forces infrastructure investment
- Solution: Tank and pump upgrades

**Mid Bottleneck:** Manual labor overwhelm
- Creates helper discovery moment
- Transforms gameplay
- Solution: Find gnomes in mines

**Late Bottleneck:** Material scarcity
- Forces deep mining
- Risk/reward decisions
- Solution: Helper specialization

**Endgame Bottleneck:** Time
- Everything takes hours/days
- Forces optimization focus
- Solution: Prestige or patience

---

## Balancing Framework for Changes

### If Adjusting Crop Energy
1. **Check tier placement:** Is this crop in the right phase?
2. **Apply growth stage multiplier:** 5-stage = 2x value of 3-stage
3. **Verify energy/minute:** Does this maintain phase targets?
4. **Test storage impact:** Can storage handle the generation?
5. **Adventure balance:** Can players still afford adventures?

### If Adjusting Obstacle Costs
1. **Check tick position:** Which tick in the sequence?
2. **Apply 1.5x multiplier:** Each tick costs 1.5x previous
3. **Verify energy availability:** Can players afford this after adventures?
4. **Time investment:** Does this create 5-10 minutes of work?
5. **Reward validation:** Do unlocked plots justify cost?

### If Adjusting Adventure Costs
1. **Duration check:** Cost = 10 × duration in minutes
2. **Phase verification:** Does this fit phase energy generation?
3. **Efficiency gradient:** Long runs must be most efficient
4. **Gold balance:** Returns should be 2x energy cost
5. **Material gating:** Ensure materials match phase needs

### If Adjusting Mining Depth
1. **Exponential check:** Each depth = 2x previous energy drain
2. **Runtime calculation:** Max energy ÷ drain rate = reasonable?
3. **Material progression:** Each depth advances materials
4. **Helper discovery:** Maintains 5-10% rates at key depths
5. **Return value:** Shallow depths must remain useful

### If Adjusting Helper Efficiency
1. **Plot coverage:** Can helpers manage phase-appropriate plots?
2. **Discovery timing:** When do players find this helper?
3. **Training costs:** Exponential scaling maintained?
4. **Paradigm preservation:** Does this maintain crisis → solution?
5. **Automation percentage:** Never 100% to maintain engagement

---

## Critical Balance Ratios

These ratios must be maintained for game balance:

- **Energy Generation : Adventure Cost = 10:1** (can adventure every 10 minutes)
- **Storage : Generation = 60:1** (1 hour of storage)
- **Gold Earned : Gold Spent = 1.2:1** (slight surplus for savings)
- **Material Gained : Material Used = 1.5:1** (builds stockpiles)
- **Active Time : Idle Time = 1:4** (respectful of player time)
- **Plot Count : Helper Capacity = 2:1** (at paradigm shift points)
- **Upgrade Cost : Current Resources = 2:1** (achievable goals)

---

## Change Impact Assessment

Before making any balance change, consider:

1. **Phase Impact:** Which phase does this affect most?
2. **System Ripples:** What other systems connect to this?
3. **Progression Speed:** Does this accelerate or slow the phase?
4. **Bottleneck Effect:** Does this create or remove a bottleneck?
5. **Player Psychology:** Does this feel fair and earned?
6. **Time Investment:** Does this respect player time?
7. **Paradigm Integrity:** Does this preserve the paradigm shifts?

---

## Final Balance Philosophy

Time Hero is balanced around **moments of transformation** rather than smooth progression. Each system should feel slightly overwhelming just before its solution appears. Players should always have a clear next goal that feels just out of reach. The game should respect player time while rewarding both active and idle play styles.

The interconnected systems mean changing one value affects many others. Always trace the full impact path before adjusting values. When in doubt, err on the side of being slightly too challenging rather than too easy - players enjoy overcoming obstacles more than breezing through content.

Remember: The numbers create the experience, but the experience is what matters. Every value should serve the goal of creating a satisfying 3-4 week journey from humble farmer to empire manager.