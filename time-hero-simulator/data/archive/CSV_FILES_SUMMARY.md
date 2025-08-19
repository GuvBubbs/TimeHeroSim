# Time Hero Simulator - CSV Data Files Summary

## Files Created in /data/ Directory

### Core Game Data
1. **crops.csv** - All 30 crops with seed level prerequisites tied to tower reach levels
2. **adventures.csv** - 21 rows (7 routes × 3 lengths each) with proper prerequisites
3. **helpers.csv** - 5 gnomes with unlock prerequisites from adventure completions
4. **gnome_roles.csv** - 10 possible gnome roles and their effects
5. **phase_transitions.csv** - 5 phase transitions with trigger conditions
6. **farm_stages.csv** - 6 farm expansion stages with unlock conditions
7. **xp_progression.csv** - 15 levels with XP requirements and HP values
8. **mining.csv** - 10 mining depths with energy costs and materials

### Farm Systems
9. **farm_projects.csv** - 54 blueprints that need to be built on farm
10. **farm_cleanups.csv** - 32 cleanup tasks with prerequisites and yields
11. **material_refinement.csv** - 7 material refinement recipes

### Town Vendors (Split as requested)
12. **town_blacksmith.csv** - 82 items (tools, weapons, forge upgrades)
13. **town_agronomist.csv** - 37 farm system upgrades
14. **town_land_steward.csv** - 3 land deeds
15. **town_carpenter.csv** - 22 tower and gnome housing items
16. **town_skills_trainer.csv** - 9 carry capacity skill ranks
17. **town_material_trader.csv** - 13 trading options

### Crafting
18. **forge_crafting.csv** - 70 items (20 tools + 50 weapons)

## Data Structure Notes

### Prerequisites Format
- Multiple prerequisites separated by semicolons (;)
- Example: "blueprint_hoe;anvil_1"
- Empty field means no prerequisite (available from start)

### Materials Format
- Material name × quantity
- Multiple materials separated by semicolons
- Example: "Wood x10;Iron x5"

### ID Naming Convention
- All lowercase with underscores
- Format: category_name_level
- Examples: "spear_1", "blueprint_hoe_plus", "farm_stage_2"

## Key Design Decisions

1. **Adventures Expanded**: Each route now has 3 separate rows for Short/Medium/Long
2. **Advanced Tools Requirement**: Terraform requires all 4 master tools (Terra Former, Stone Breaker, World Splitter, Earth Mover)
3. **All Weapons Included**: forge_crafting.csv contains all 50 weapons (5 types × 10 levels)
4. **Vendors Split**: town_[vendor].csv format for better organization
5. **Mining Has Depths**: mining.csv contains all 10 depth levels with shortcuts

## Prerequisite Chains Validated

### Early Game Flow
- Tutorial → meadow_path_short → unlock_blacksmith
- clear_weeds_2 → farm_stage_2 → homestead_deed available

### Mid Game Gates
- homestead_deed → farm_stage_3 → many upgrades unlock
- dark_forest_long → gnome_1 → gnome housing available

### Late Game Requirements
- manor_grounds_deed → many high-tier items
- great_estate_deed → endgame content
- mythril_anvil → master tier tools

## Data Integrity

All CSV files:
- Use consistent ID formats
- Have complete prerequisite chains
- Include all items from design documents
- Are properly normalized (no duplicate data)
- Ready for simulator import

## Next Steps

The simulator can now:
1. Import these CSV files
2. Build dependency graphs
3. Validate progression paths
4. Simulate player journeys with proper gating