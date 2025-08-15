# Additional Reference Documents for Time Hero Simulator

## Essential Reference Documents Needed

### 1. Player Behavior Profiles
Create profiles representing different player types to test against:

```json
{
  "profiles": {
    "hardcore": {
      "check_ins_per_day": 8,
      "session_length_minutes": 45,
      "optimization_efficiency": 0.95,
      "sleep_hours": 6,
      "reaction_to_caps": "immediate",
      "upgrade_strategy": "optimal_path",
      "adventure_preference": "long_runs"
    },
    "casual": {
      "check_ins_per_day": 2,
      "session_length_minutes": 10,
      "optimization_efficiency": 0.70,
      "sleep_hours": 8,
      "reaction_to_caps": "next_session",
      "upgrade_strategy": "balanced",
      "adventure_preference": "short_runs"
    },
    "irregular": {
      "check_ins_per_day": "1-5",
      "session_length_minutes": "5-30",
      "optimization_efficiency": 0.60,
      "sleep_hours": "7-9",
      "reaction_to_caps": "sometimes_missed",
      "upgrade_strategy": "random_valid",
      "adventure_preference": "medium_runs"
    }
  }
}
```

### 2. Phase Transition Triggers Document
Exact conditions that trigger phase changes:

```yaml
phase_transitions:
  tutorial_to_early:
    - plots >= 8
    - first_adventure_completed: true
    - hoe_crafted: true
    - day >= 1
    
  early_to_mid:
    - plots >= 20
    - total_energy_earned >= 1000
    - adventures_completed >= 5
    - OR helper_discovered: true
    - day >= 3
    
  mid_to_late:
    - farm_expansion_completed >= 1
    - helpers_active >= 2
    - mine_depth_reached >= 5
    - crystal_obtained: true
    - day >= 7
    
  late_to_endgame:
    - farm_expansion_completed >= 2
    - helpers_active >= 5
    - mythril_obtained: true
    - total_gold_earned >= 100000
    - day >= 14
```

### 3. Decision Priority Matrix
How players prioritize actions when multiple options are available:

```csv
situation,energy_available,priority_1,priority_2,priority_3,priority_4
"storage_nearly_full",">50","spend_on_adventure","upgrade_storage","mine","craft"
"new_blueprint_available",">30","build_immediately","save_for_build","continue_routine","ignore"
"helper_discovered",">100","activate_immediately","save_for_activation","continue_farming","delay"
"multiple_crops_ready","any","harvest_highest_value","harvest_oldest","harvest_all","water_first"
"adventure_complete","<20","rest","short_adventure","farm","mine"
```

### 4. Resource Flow Rates
Detailed rates for all resource generation and consumption:

```json
{
  "energy_flow": {
    "tutorial": {
      "generation_per_minute": 0.5,
      "consumption_per_minute": 0.3,
      "storage_turnover_hours": 2
    },
    "early": {
      "generation_per_minute": 5,
      "consumption_per_minute": 3,
      "storage_turnover_hours": 1
    }
  },
  "gold_flow": {
    "adventures_per_hour": 2,
    "gold_per_adventure_average": 50,
    "gold_spent_per_hour": 80
  }
}
```

### 5. Bottleneck Thresholds
When systems should create friction:

```yaml
bottlenecks:
  water_crisis:
    trigger: plots > 15 AND water_capacity < 60
    impact: growth_speed * 0.3
    solution: water_tank_upgrade
    
  energy_overflow:
    trigger: generation_rate > storage_cap / 30
    impact: energy_waste > 20%
    solution: storage_upgrade OR more_adventures
    
  helper_overwhelm:
    trigger: plots > helpers * 15
    impact: efficiency < 50%
    solution: discover_more_helpers
```

### 6. Combat Triangle Matrix
Complete weapon vs enemy effectiveness:

```csv
weapon,armored_insects,predatory_beasts,flying_predators,venomous_crawlers,living_plants,slimes
spear,1.5,0.75,1.0,1.0,1.0,1.0
sword,0.75,1.5,1.0,1.0,1.0,1.0
bow,1.0,0.75,1.5,1.0,1.0,1.0
crossbow,1.0,1.0,0.75,1.5,1.0,1.0
wand,1.0,1.0,1.0,0.75,1.5,1.0
```

### 7. Time Investment Expectations
Target time requirements by phase:

```json
{
  "phase_duration_targets": {
    "tutorial": {
      "minimum_hours": 1,
      "target_hours": 2,
      "maximum_hours": 4
    },
    "early": {
      "minimum_days": 2,
      "target_days": 3,
      "maximum_days": 5
    },
    "mid": {
      "minimum_days": 3,
      "target_days": 4,
      "maximum_days": 7
    }
  },
  "upgrade_frequency_targets": {
    "tutorial": "every_20_minutes",
    "early": "every_45_minutes",
    "mid": "every_2_hours",
    "late": "every_6_hours",
    "endgame": "every_24_hours"
  }
}
```

### 8. Helper Behavior Rules
How helpers operate and scale:

```yaml
helper_rules:
  gnome:
    base_efficiency: 5_plots_per_cycle
    cycle_time: 60_seconds
    level_scaling: efficiency * (1 + level * 0.2)
    specializations:
      farming: +50% water_speed
      mining: +2 materials_per_hour
      combat: +20% adventure_rewards
      
  golem:
    base_efficiency: 10_plots_per_cycle
    cycle_time: 45_seconds
    level_scaling: efficiency * (1 + level * 0.25)
```

### 9. Seasonal Event Calendar
Optional events that affect gameplay:

```json
{
  "events": [
    {
      "name": "Rain Day",
      "frequency": "every_3_days",
      "effect": "auto_water_all_plots",
      "duration": "4_hours"
    },
    {
      "name": "Market Day",
      "frequency": "weekly",
      "effect": "gold_prices_x1.5",
      "duration": "24_hours"
    },
    {
      "name": "Meteor Shower",
      "frequency": "every_10_days",
      "effect": "rare_materials_in_adventures",
      "duration": "2_hours"
    }
  ]
}
```

### 10. Validation Test Cases
Specific scenarios to verify simulation accuracy:

```yaml
test_cases:
  case_1:
    name: "Speed Run to Mid Phase"
    profile: "hardcore"
    expected_time: "3-4 days"
    key_metrics:
      - first_helper_by: "day 2"
      - energy_cap_1500_by: "day 3"
      - plots_40_by: "day 4"
      
  case_2:
    name: "Casual Weekend Player"
    profile: "casual"
    check_pattern: "fri_evening, sat_morning, sat_evening, sun_morning"
    expected_progress: "complete_early_phase"
    
  case_3:
    name: "Storage Bottleneck Test"
    modification: "reduce_all_storage_by_50%"
    expected_result: "20%_slower_progression"
```

### 11. Error Scenarios
Edge cases and failure states to handle:

```json
{
  "error_conditions": [
    {
      "scenario": "energy_bankruptcy",
      "trigger": "energy < min_adventure_cost AND no_crops_planted",
      "recovery": "force_plant_free_seeds"
    },
    {
      "scenario": "helper_starvation",
      "trigger": "no_food_for_training > 24_hours",
      "recovery": "helper_efficiency_degrades"
    },
    {
      "scenario": "progression_deadlock",
      "trigger": "no_upgrades_purchased > 48_hours",
      "recovery": "hint_system_activates"
    }
  ]
}
```

### 12. Performance Benchmarks
Expected frame rates and calculation times:

```yaml
performance_targets:
  simulation_speed:
    - 1_game_day: < 100ms
    - 1_game_week: < 700ms
    - full_progression: < 10_seconds
    
  ui_responsiveness:
    - parameter_change: < 16ms
    - graph_update: < 50ms
    - log_filter: < 100ms
    
  memory_usage:
    - base_state: < 10MB
    - with_full_logs: < 100MB
    - 100_simulations: < 500MB
```

## How to Use These Documents

1. **Import all documents** into the simulator on initialization
2. **Reference documents** should be treated as configuration, not code
3. **Hot-reload** these documents without restarting the simulator
4. **Version control** these separately from the simulator code
5. **A/B testing** by swapping different versions of these documents

## Document Validation

Each document should be validated for:
- **Completeness**: All required fields present
- **Consistency**: Values align with master spreadsheet
- **Realistic ranges**: No impossible values
- **Cross-references**: IDs and names match across documents

## Loading Priority

1. First: Game values (crops, upgrades, costs)
2. Second: Game rules (phase triggers, combat matrix)
3. Third: Player profiles and behavior rules
4. Fourth: Test cases and validation scenarios
5. Optional: Events and error handling

These documents provide the "intelligence" for the simulator to make realistic decisions and validate that the game progression matches design intent.