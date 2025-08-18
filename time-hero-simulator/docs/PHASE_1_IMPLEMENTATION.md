# Phase 1 Detailed Implementation Guide

## CSV File Specifications

This document provides the exact structure and sample data for all CSV files needed in Phase 1 of the Time Hero Simulator update.

---

## New CSV Files to Create

### 1. weapons.csv
```csv
id,name,type,level,prerequisite,goldCost,energyCost,materials,damage,attackSpeed,advantageVs,notes
spear_1,Spear,spear,1,,100,50,wood:5;stone:3,10,1.0,armored_insects,Base spear
spear_2,Spear II,spear,2,spear_1,250,100,wood:8;copper:5,15,1.0,armored_insects,
spear_3,Spear III,spear,3,spear_2,500,200,iron:10,22,1.0,armored_insects,
spear_4,Spear IV,spear,4,spear_3;anvil_1,1000,400,iron:15;silver:5,32,1.1,armored_insects,Requires Anvil I
spear_5,Spear V,spear,5,spear_4,2500,800,silver:8,45,1.1,armored_insects,
spear_6,Spear VI,spear,6,spear_5;anvil_2,5000,1600,crystal:3,60,1.2,armored_insects,Requires Anvil II
spear_7,Spear VII,spear,7,spear_6,10000,3200,crystal:5;pine_resin:1,80,1.2,armored_insects,Boss material required
spear_8,Spear VIII,spear,8,spear_7;mythril_anvil,25000,6400,mythril:2,105,1.3,armored_insects,Requires Mythril Anvil
spear_9,Spear IX,spear,9,spear_8,50000,12800,mythril:3;frozen_heart:1,135,1.3,armored_insects,
spear_10,Spear X,spear,10,spear_9,100000,25600,obsidian:1;molten_core:2,200,1.5,armored_insects,Max level
sword_1,Sword,sword,1,,100,50,wood:5;stone:3,12,0.9,predatory_beasts,Base sword
sword_2,Sword II,sword,2,sword_1,250,100,wood:8;copper:5,18,0.9,predatory_beasts,
sword_3,Sword III,sword,3,sword_2,500,200,iron:10,26,0.9,predatory_beasts,
bow_1,Bow,bow,1,,100,50,wood:8;stone:2,8,1.2,flying_predators,Base bow
bow_2,Bow II,bow,2,bow_1,250,100,wood:12;copper:5,12,1.2,flying_predators,
crossbow_1,Crossbow,crossbow,1,,150,75,wood:10;stone:5,15,0.7,venomous_crawlers,Base crossbow
wand_1,Wand,wand,1,,200,100,wood:5;copper:1,7,1.5,living_plants,Base wand
```

### 2. armor.csv
```csv
id,name,baseDefense,upgradePotential,specialEffect,effectValue,dropRoute,dropWeight
minimal_leather,Leather Armor,5,poor,none,0,meadow_path,0.35
minimal_studded,Studded Leather,5,average,gold_magnet,25,meadow_path,0.30
low_chain,Chainmail,10,poor,none,0,pine_vale,0.30
low_regen,Regenerating Hide,10,average,regeneration,3,pine_vale,0.20
medium_plate,Iron Plate,15,average,none,0,dark_forest,0.25
medium_reflect,Mirror Mail,15,good,reflection,15,dark_forest,0.15
high_crystal,Crystal Armor,20,good,evasion,10,mountain_pass,0.10
high_vampire,Vampiric Plate,20,excellent,vampiric,1,crystal_caves,0.05
extreme_mythril,Mythril Armor,25,excellent,critical_shield,1,frozen_tundra,0.05
```

### 3. tools.csv
```csv
id,name,tier,category,prerequisite,goldCost,energyCost,materials,effect,craftTime,notes
hoe,Hoe,base,farm,,50,20,stone:5;wood:3,till_soil,5,Enables plot creation
hoe_plus,Hoe+,plus,farm,hoe;anvil_1,750,200,iron:10;wood:5;pine_resin:1,till_2x,15,2x tilling speed
terra_former,Terra Former,master,farm,hoe_plus;mythril_anvil,15000,2000,crystal:2;silver:10;mountain_stone:2,till_4x_area,45,4x speed and area
hammer,Hammer,base,farm,hoe,150,40,stone:8;wood:5,clear_rocks,8,Clear rocks
hammer_plus,Hammer+,plus,farm,hammer;anvil_1,1200,300,iron:8;stone:10;shadow_bark:1,clear_boulders,20,Break boulders
stone_breaker,Stone Breaker,master,farm,hammer_plus;mythril_anvil,25000,3000,crystal:3;mythril:1;frozen_heart:1,instant_rocks,50,Instant clearing
axe,Axe,base,farm,hammer,300,100,iron:5;wood:8,remove_stumps,10,Clear stumps
axe_plus,Axe+,plus,farm,axe;anvil_2,3000,500,silver:5;wood:10;mountain_stone:1,stumps_2x,25,2x wood yield
world_splitter,World Splitter,master,farm,axe_plus;mythril_anvil,60000,8000,crystal:3;enchanted_wood:1;frozen_heart:2,ancient_roots,50,3x yield
shovel,Shovel,base,farm,axe,600,100,copper:3;wood:5,excavate,10,Dig obstacles
shovel_plus,Shovel+,plus,farm,shovel;anvil_2,8000,500,iron:8;silver:2;shadow_bark:1,deep_excavate,20,Irrigation
earth_mover,Earth Mover,master,farm,shovel_plus;crystal_furnace,40000,5000,crystal:2;mythril:1;cave_crystal:3,reshape_land,45,Area clear
pickaxe_1,Pickaxe I,base,mining,,100,30,copper:5;wood:5,mine_depth_10,10,Basic mining
pickaxe_2,Pickaxe II,iron,mining,pickaxe_1,500,150,iron:5;stone:8,mine_efficient_15,15,-15% drain
pickaxe_3,Pickaxe III,silver,mining,pickaxe_2;anvil_2,2500,750,silver:3;iron:10,mine_efficient_30,25,-30% drain
crystal_pick,Crystal Pick,crystal,mining,pickaxe_3;mythril_anvil,12000,3000,crystal:2;silver:5;cave_crystal:2,mine_efficient_45,40,-45% drain
abyss_seeker,Abyss Seeker,mythril,mining,crystal_pick;crystal_furnace,60000,15000,mythril:1;crystal:3;molten_core:2,mine_efficient_60,60,-60% drain
watering_can_2,Watering Can II,base,farm,anvil_1,100,50,copper:5;wood:3,water_2_plots,5,Water 2 plots
sprinkler_can,Sprinkler Can,plus,farm,watering_can_2;furnace_2,750,400,silver:3;copper:10;pine_resin:1,water_4_plots,20,Water 4 plots
rain_bringer,Rain Bringer,master,farm,sprinkler_can;crystal_furnace,15000,2000,crystal:1;silver:20;frozen_heart:1,water_8_plots,30,Water 8 plots
```

### 4. helpers.csv
```csv
id,name,rescueRoute,baseHousing,roles,baseEffect,levelScaling,maxLevel,xpPerLevel,trainingTime
gnome_1,Forest Gnome,dark_forest,gnome_hut,all,varies,linear,10,100;300;600;1000;2000;4000;8000;16000;32000,0.5;1;2;4;8;12;18;24;36
gnome_2,Mountain Gnome,mountain_pass,gnome_house,all,varies,linear,10,100;300;600;1000;2000;4000;8000;16000;32000,0.5;1;2;4;8;12;18;24;36
gnome_3,Crystal Gnome,crystal_caves,gnome_lodge,all,varies,linear,10,100;300;600;1000;2000;4000;8000;16000;32000,0.5;1;2;4;8;12;18;24;36
gnome_4,Frost Gnome,frozen_tundra,gnome_hall,all,varies,linear,10,100;300;600;1000;2000;4000;8000;16000;32000,0.5;1;2;4;8;12;18;24;36
gnome_5,Lava Gnome,volcano_core,gnome_village,all,varies,linear,10,100;300;600;1000;2000;4000;8000;16000;32000,0.5;1;2;4;8;12;18;24;36
```

### 5. helper_roles.csv
```csv
role,name,category,baseEffect,effectPerLevel,maxEffect,description
waterer,Waterer,farm,5,1,15,Waters plots automatically (plots/minute)
pump_operator,Pump Operator,farm,20,5,70,Generates water passively (water/hour)
sower,Sower,farm,3,1,13,Plants seeds after harvest (seeds/minute)
harvester,Harvester,farm,4,1,14,Collects crops automatically (plots/minute)
miners_friend,Miner's Friend,mining,-15,-3,-45,Reduces mining energy drain (%)
adventure_fighter,Fighter,combat,5,2,25,Assists in combat (damage/hit)
adventure_support,Support,combat,1,0.5,6,Heals during adventures (HP/30sec)
seed_catcher,Catcher,tower,10,2,30,Boosts catch rate (%)
forager,Forager,resources,5,2,25,Collects wood from stumps (wood/hour)
refiner,Refiner,forge,5,1,15,Speeds up refinement (%)
```

### 6. mining.csv
```csv
depth,name,minDepth,maxDepth,prerequisite,energyDrain,materials,dropInterval,avgRuntime,notes
1,Surface Shaft,0,500,,2,stone:8-12,30,750,Basic stone mining
2,Copper Vein,500,1000,depth_1,4,copper:6-8;stone:4-6,30,375,Copper appears
3,Iron Seam,1000,1500,depth_2,8,iron:5-7;copper:3-4,30,187,Iron mining
4,Deep Iron,1500,2000,depth_3,16,iron:8-12,30,94,Rich iron deposits
5,Silver Pocket,2000,2500,depth_4,32,silver:6-8;iron:4-6,30,47,Silver discovered
6,Silver Lode,2500,3000,depth_5,64,silver:10-15,30,23,Rich silver
7,Crystal Cave,3000,3500,depth_6,128,crystal:4-6;silver:3-5,30,12,Crystals found
8,Crystal Core,3500,4000,depth_7,256,crystal:8-12,30,6,Pure crystals
9,Mythril Vein,4000,4500,depth_8,512,mythril:3-5;crystal:2-3,30,3,Mythril appears
10,The Abyss,4500,5000,depth_9,1024,obsidian:2-3;mythril:2-3,30,1.5,Deepest level
```

### 7. tower_levels.csv
```csv
reachLevel,windLevel,seedLevel,prerequisite,goldCost,energyCost,materials,catchRate,seedPool,notes
1,Ground,0,,0,0,,1.0,0,Starting level
2,Breeze,0,tower_built,100,50,wood:10,1.2,0-1,First reach
3,Gust,1,reach_2,500,200,wood:15;copper:5,1.4,0-2,More seeds
4,Gale,2,reach_3,2000,1000,wood:20;iron:10,1.6,0-3,Better variety
5,Jet Stream,3,reach_4,10000,5000,silver:5,1.8,0-4,Mid-tier seeds
6,Cloud Layer,4,reach_5;homestead,50000,20000,crystal:3,2.0,0-5,Requires farm
7,Stratosphere,5,reach_6;manor_grounds,200000,100000,mythril:2,2.2,0-6,Late game
8,Mesosphere,6,reach_7;great_estate,1000000,400000,mythril:3,2.4,0-7,
9,Thermosphere,7,reach_8;great_estate,5000000,1500000,obsidian:1,2.6,0-8,
10,Exosphere,8,reach_9;great_estate,15000000,5000000,obsidian:2,2.8,0-9,
11,Low Orbit,9,reach_10;great_estate,50000000,15000000,obsidian:3,3.0,0-9,Max reach
```

### 8. vendors.csv
```csv
id,name,shopType,location,prerequisite,categories,description
blacksmith,Ember & Edge,equipment,town,first_adventure,tools;weapons;forge_upgrades,Tools and combat gear
agronomist,Greenwise Co-op,farm,town,,energy_storage;water_systems;seed_storage;materials,Farm infrastructure
land_steward,County Land Office,deeds,town,,land_deeds,Purchase new land
carpenter,Towerwrights Guild,tower,town,,tower_reaches;nets;auto_catchers;gnome_housing,Tower and housing
skills_trainer,Field School,skills,town,,carry_capacity;efficiency,Hero abilities
material_trader,Exchange Post,exchange,town,,material_trades;gold_conversion,Resource trading
```

### 9. cleanups.csv
```csv
id,name,stage,plotsAdded,totalPlots,energyCost,toolRequired,materials,cooldown,repeatable
weeds_1,Clear Weeds #1,1,2,5,5,,,,false
weeds_2,Clear Weeds #2,1,3,8,10,,,,false
gather_sticks,Gather Sticks,1,0,0,5,,,0,true
break_branches,Break Branches,1,0,0,10,,,0,true
dead_trees,Collect Dead Trees,2,2,10,15,,wood:8,,false
till_1,Till Soil #1,2,3,13,20,hoe,,,false
rocks_1,Clear Rocks #1,2,3,16,30,,stone:8,,false
till_2,Till Soil #2,2,4,20,40,hoe,,,false
gather_branches,Gather Branches,2,0,0,15,,,0,true
chop_saplings,Chop Saplings,2,0,0,25,,,0,true
fell_tree,Fell Small Tree,2,0,0,50,axe,wood:5,0,true
boulders_1,Clear Boulders #1,3,4,24,100,hammer_plus,stone:12,,false
stumps_1,Remove Stumps #1,3,4,28,150,axe,wood:20,,false
boulders_2,Clear Boulders #2,3,4,32,200,hammer_plus,stone:18,,false
stumps_2,Remove Stumps #2,3,4,36,300,axe,wood:30,,false
till_3,Till New Land,3,4,40,400,hoe_plus,,,false
chop_trees,Chop Trees,3,0,0,100,axe,wood:10,0,true
clear_grove,Clear Grove,3,0,0,200,axe_plus,wood:25,0,true
excavate_1,Excavate Rocks #1,4,5,45,500,shovel,stone:24,,false
thickets_1,Clear Thickets #1,4,5,50,600,earth_mover,wood:36,,false
excavate_2,Excavate Rocks #2,4,5,55,800,shovel_plus,stone:32,,false
thickets_2,Clear Thickets #2,4,5,60,1000,earth_mover,wood:48,,false
terraform,Terraform,4,5,65,1500,terra_former,,,false
harvest_forest,Harvest Forest,4,0,0,400,shovel_plus,wood:40,0,true
clear_old_growth,Clear Old Growth,4,0,0,800,earth_mover,wood:100,0,true
monoliths_1,Stone Monoliths #1,5,5,70,2000,stone_breaker,stone:50,,false
roots_1,Ancient Roots #1,5,5,75,2500,world_splitter,wood:100,,false
monoliths_2,Stone Monoliths #2,5,5,80,3000,stone_breaker,stone:75,,false
sacred,Sacred Clearing,5,10,90,5000,world_splitter;stone_breaker,,,false
mystic_grove,Mystic Grove,5,0,0,1500,world_splitter,wood:200,0,true
enchanted_forest,Enchanted Forest,5,0,0,3000,world_splitter;stone_breaker,wood:500;enchanted_wood:1,0,true
```

### 10. boss_materials.csv
```csv
id,name,dropFrom,dropChance,category,uses,description
pine_resin,Pine Resin,pine_vale,1.0,boss,tools;weapons,Sticky resin from Beetle Lord
shadow_bark,Shadow Bark,dark_forest,1.0,boss,tools;weapons,Dark bark from Alpha Wolf
mountain_stone,Mountain Stone,mountain_pass,1.0,boss,tools;weapons,Sky stone from Sky Serpent
cave_crystal,Cave Crystal,crystal_caves,1.0,boss,tools;weapons,Web crystal from Crystal Spider
frozen_heart,Frozen Heart,frozen_tundra,1.0,boss,tools;weapons,Ice core from Frost Wyrm
molten_core,Molten Core,volcano_core,1.0,boss,tools;weapons,Lava essence from Lava Titan
enchanted_wood,Enchanted Wood,frozen_tundra,0.05,special,master_tools,Rare magical wood
temporal_shard,Temporal Shard,time_rift,0.1,special,endgame,Time fragment
```

---

## Updated Existing CSV Files

### Updated crops.csv
```csv
name,tier,seedLevel,stages,growthTime,energy,seedCost,waterConsumption,notes
Carrot,early,0,3,6,1,0,1,Tutorial crop
Radish,early,0,3,5,1,0,1,Quick turnover
Potato,early,1,3,8,2,0,1,Reliable crop
Cabbage,early,1,4,10,3,1,1,First multi-stage
Turnip,early,1,3,7,2,1,1,Common vegetable
Corn,early,2,5,15,5,2,1,Good mid-tier
Tomato,early,2,5,12,4,2,1,Recurring harvest
Strawberry,mid,3,5,20,8,5,1,Popular fruit
Spinach,mid,3,3,10,5,3,1,Quick mid-tier
Onion,mid,3,3,12,6,4,1,Solid seller
Garlic,mid,4,3,15,8,5,1,High value
Cucumber,mid,4,5,25,12,6,1,Long grow
Leek,mid,5,3,18,10,5,1,Versatile
Wheat,mid,5,4,22,12,7,1,Bread ingredient
Asparagus,late,6,4,30,20,12,1,Premium crop
Cauliflower,late,6,4,28,18,10,1,High tier
Caisim,late,6,3,25,15,8,1,Asian vegetable
Pumpkin,late,6,5,35,25,15,1,Seasonal
Watermelon,late,7,5,40,35,20,1,Summer crop
Honeydew,late,7,5,38,30,18,1,Melon variety
Pineapple,endgame,8,5,45,40,25,1,Tropical
Beetroot,endgame,8,4,35,35,20,1,Root vegetable
Eggplant,endgame,8,3,30,30,15,1,Purple produce
Soybean,endgame,8,5,42,45,30,1,Protein crop
Yam,endgame,9,5,50,50,35,1,Starchy root
Bell Pepper Green,endgame,9,5,48,45,30,1,Green variant
Bell Pepper Red,endgame,9,5,48,55,35,1,Red variant
Bell Pepper Yellow,endgame,9,5,48,65,40,1,Yellow variant
Shallot,endgame,9,3,40,60,35,1,Premium onion
```

### Updated adventures.csv
```csv
id,name,prerequisite,shortEnergy,shortDuration,shortGold,mediumEnergy,mediumDuration,mediumGold,longEnergy,longDuration,longGold,enemyTypes,boss,bossWeakness,commonMat,rareMat,bossMat,firstClearBonus
meadow_path,,10,3,25,25,8,75,50,15,150,slimes:100,Giant Slime,none,wood:5-10,,copper:2,
pine_vale,meadow_path_long,20,5,60,50,15,150,100,30,300,armored_insects:100,Beetle Lord,spear,wood:20-30,,iron:3;pine_resin:1,
dark_forest,pine_vale_long,40,8,150,100,20,375,200,45,750,beasts:60;slimes:40,Alpha Wolf,sword,wood:40-60,,iron:5;shadow_bark:1,gnome_rescued
mountain_pass,dark_forest_long,100,10,400,250,30,1000,500,60,2000,flying:50;insects:50,Sky Serpent,bow,stone:30-50,silver:3,mountain_stone:1,gnome_rescued
crystal_caves,mountain_pass_long,200,15,1000,500,40,2500,1000,90,5000,crawlers:50;plants:50,Crystal Spider,crossbow,crystal:1-2,crystal:2,cave_crystal:1,gnome_rescued
frozen_tundra,crystal_caves_long,400,20,2500,1000,50,6250,2000,120,12500,flying:40;beasts:40;plants:20,Frost Wyrm,wand,wood:80-120,mythril:1,frozen_heart:1;enchanted_wood:1,gnome_rescued
volcano_core,frozen_tundra_long,800,25,6000,2000,65,15000,4000,150,30000,mixed:100,Lava Titan,rotating,obsidian:1,obsidian:2,molten_core:1,gnome_rescued
```

### Updated upgrades.csv (reorganized by vendor)
```csv
id,name,vendor,category,prerequisite,goldCost,energyCost,materials,effect,description
# Agronomist - Energy Storage
storage_1,Storage Shed I,agronomist,energy,,20,10,,energy_cap_150,Energy cap 50→150
storage_2,Storage Shed II,agronomist,energy,storage_1,100,50,stone:5,energy_cap_500,Energy cap 150→500
storage_3,Storage Shed III,agronomist,energy,storage_2;homestead,500,200,iron:10,energy_cap_1500,Energy cap 500→1500
storage_4,Storage Barn I,agronomist,energy,storage_3;homestead,3000,1000,silver:5,energy_cap_6000,Energy cap 1500→6000
storage_5,Storage Barn II,agronomist,energy,storage_4;manor_grounds,20000,5000,crystal:2,energy_cap_20000,Energy cap 6000→20000
storage_6,Storage Silo,agronomist,energy,storage_5;great_estate,100000,25000,mythril:1,energy_cap_100000,Energy cap 20000→100000

# Agronomist - Water Systems
pump_1,Well Pump I,agronomist,water,,30,20,stone:3,pump_4,2→4 water/crank
pump_2,Well Pump II,agronomist,water,pump_1,150,100,copper:5,pump_8,4→8 water/crank
pump_3,Well Pump III,agronomist,water,pump_2;homestead,750,500,iron:10,pump_15,8→15 water/crank
pump_4,Steam Pump,agronomist,water,pump_3;homestead,4000,2500,silver:3,pump_30,15→30 water/crank
pump_5,Crystal Pump,agronomist,water,pump_4;manor_grounds,25000,12000,crystal:3,pump_60,30→60 water/crank
tank_1,Water Tank I,agronomist,water,,25,15,stone:5,water_cap_60,20→60 water cap
tank_2,Water Tank II,agronomist,water,tank_1,125,75,copper:8,water_cap_200,60→200 water cap
tank_3,Water Tank III,agronomist,water,tank_2;homestead,600,400,iron:12,water_cap_600,200→600 water cap
tank_4,Reservoir,agronomist,water,tank_3;homestead,3500,2000,silver:5,water_cap_2000,600→2000 water cap
tank_5,Crystal Reservoir,agronomist,water,tank_4;manor_grounds,22000,10000,crystal:5,water_cap_10000,2000→10000 water cap
mulch_beds,Mulch Beds,agronomist,water,tank_2,300,150,wood:50,water_retention_25,Plots retain water 25% longer
irrigation,Irrigation Channels,agronomist,water,mulch_beds;homestead,1500,750,wood:100;iron:5,water_retention_50,Plots retain water 50% longer
crystal_irrigation,Crystal Irrigation,agronomist,water,irrigation;manor_grounds,8000,4000,wood:200;crystal:3,water_retention_75,Plots retain water 75% longer
auto_pump_1,Auto-Pump I,agronomist,water,tank_2,200,100,copper:5,offline_water_10,+10% water/hour offline
auto_pump_2,Auto-Pump II,agronomist,water,auto_pump_1;tank_3,1000,500,iron:10,offline_water_20,+20% water/hour offline
auto_pump_3,Auto-Pump III,agronomist,water,auto_pump_2;tank_4,5000,2500,silver:5,offline_water_35,+35% water/hour offline
crystal_auto_pump,Crystal Auto-Pump,agronomist,water,auto_pump_3;tank_5,25000,12000,crystal:3,offline_water_50,+50% water/hour offline

# Agronomist - Storage
seed_storage_1,Seed Storage I,agronomist,storage,,50,40,stone:5,seed_cap_150,50→150 seed cap
seed_storage_2,Seed Storage II,agronomist,storage,seed_storage_1,250,200,copper:10,seed_cap_500,150→500 seed cap
seed_vault,Seed Vault,agronomist,storage,seed_storage_2;homestead,1500,1000,iron:5,seed_cap_2000,500→2000 seed cap
material_crate_1,Material Crate I,agronomist,storage,,75,50,wood:10,material_cap_50,Max 50 per material
material_crate_2,Material Crate II,agronomist,storage,material_crate_1,400,250,wood:20;iron:5,material_cap_100,Max 100 per material
material_warehouse,Material Warehouse,agronomist,storage,material_crate_2;homestead,2000,1000,iron:10;silver:2,material_cap_250,Max 250 per material
material_depot,Material Depot,agronomist,storage,material_warehouse;manor_grounds,10000,5000,silver:5;crystal:2,material_cap_500,Max 500 per material
material_silo,Material Silo,agronomist,storage,material_depot;great_estate,50000,20000,crystal:3;mythril:1,material_cap_1000,Max 1000 per material

# Agronomist - Emergency Wood
wood_bundle_small,Wood Bundle (Small),agronomist,materials,,50,0,,wood_10,Emergency 10 wood
wood_bundle_medium,Wood Bundle (Medium),agronomist,materials,stage_2,200,0,,wood_50,Emergency 50 wood
wood_bundle_large,Wood Bundle (Large),agronomist,materials,stage_3,800,0,,wood_250,Emergency 250 wood

# Land Steward - Deeds
homestead_deed,Homestead Deed,land_steward,deeds,stage_2_complete,1500,250,,plots_40,Expand to 40 plots
manor_grounds_deed,Manor Grounds Deed,land_steward,deeds,stage_3_complete,6000,750,,plots_65,Expand to 65 plots
great_estate_deed,Great Estate Deed,land_steward,deeds,stage_4_complete,20000,1500,,plots_90,Expand to 90 plots

# Blacksmith - Forge Upgrades
bellows_1,Bellows I,blacksmith,forge,forge_built,80,60,stone:8,heat_band_wide,Wider heat band
bellows_2,Bellows II,blacksmith,forge,bellows_1,400,300,copper:10,heat_band_wider,Much wider heat band
auto_bellows,Auto-Bellows,blacksmith,forge,bellows_2,2000,1500,iron:8,heat_auto,Auto maintains heat
furnace_1,Furnace Upgrade I,blacksmith,forge,forge_built,200,150,stone:12,craft_speed_20,+20% craft speed
furnace_2,Furnace Upgrade II,blacksmith,forge,furnace_1,1000,750,iron:15,craft_speed_40,+40% craft speed
crystal_furnace,Crystal Furnace,blacksmith,forge,furnace_2;manor_grounds,10000,6000,crystal:5,craft_speed_60,+60% craft speed
anvil_1,Anvil I,blacksmith,forge,forge_built,150,100,copper:10,unlock_iron_recipes,Unlock iron recipes
anvil_2,Anvil II,blacksmith,forge,anvil_1,1500,1000,silver:5,unlock_silver_recipes,Unlock silver recipes
mythril_anvil,Mythril Anvil,blacksmith,forge,anvil_2;great_estate,15000,10000,crystal:3,unlock_mythril_recipes,Unlock mythril recipes
batch_craft,Batch Craft,blacksmith,forge,anvil_1,500,0,,craft_batch_5,Craft 5 at once
master_craft,Master Craft,blacksmith,forge,batch_craft;furnace_2,5000,0,,craft_proc_10,10% double output

# Carpenter - Tower
reach_2,Reach Level 2,carpenter,tower,tower_built,100,50,wood:10,wind_breeze,Access Breeze band
reach_3,Reach Level 3,carpenter,tower,reach_2,500,200,wood:15;copper:5,wind_gust,Access Gust band
reach_4,Reach Level 4,carpenter,tower,reach_3,2000,1000,wood:20;iron:10,wind_gale,Access Gale band
reach_5,Reach Level 5,carpenter,tower,reach_4,10000,5000,silver:5,wind_jet,Access Jet Stream
reach_6,Reach Level 6,carpenter,tower,reach_5;homestead,50000,20000,crystal:3,wind_cloud,Access Cloud Layer
reach_7,Reach Level 7,carpenter,tower,reach_6;manor_grounds,200000,100000,mythril:2,wind_strato,Access Stratosphere
reach_8,Reach Level 8,carpenter,tower,reach_7;great_estate,1000000,400000,mythril:3,wind_meso,Access Mesosphere
reach_9,Reach Level 9,carpenter,tower,reach_8;great_estate,5000000,1500000,obsidian:1,wind_thermo,Access Thermosphere
reach_10,Reach Level 10,carpenter,tower,reach_9;great_estate,15000000,5000000,obsidian:2,wind_exo,Access Exosphere
reach_11,Reach Level 11,carpenter,tower,reach_10;great_estate,50000000,15000000,obsidian:3,wind_orbit,Access Low Orbit
net_1,Net I,carpenter,tower,tower_built,75,60,copper:5,catch_rate_20,+20% catch rate
net_2,Net II,carpenter,tower,net_1,400,300,iron:8,catch_rate_40,+40% catch rate
golden_net,Golden Net,carpenter,tower,net_2;reach_4,2500,1500,silver:3,catch_rate_60,+60% catch rate
crystal_net,Crystal Net,carpenter,tower,golden_net;reach_5,15000,8000,crystal:2,catch_rate_80,+80% catch rate
auto_catcher_1,Auto-Catcher I,carpenter,tower,tower_built,1000,500,iron:10,auto_seeds_10min,1 seed/10 min
auto_catcher_2,Auto-Catcher II,carpenter,tower,auto_catcher_1,5000,2500,silver:5,auto_seeds_5min,1 seed/5 min
auto_catcher_3,Auto-Catcher III,carpenter,tower,auto_catcher_2;reach_5,30000,15000,crystal:3,auto_seeds_2min,1 seed/2 min

# Carpenter - Gnome Housing
gnome_hut,Gnome Hut,carpenter,housing,gnome_rescued,500,250,wood:20;stone:10,gnome_cap_1,House 1 gnome
gnome_house,Gnome House,carpenter,housing,gnome_hut;homestead,2000,1000,wood:50;iron:20,gnome_cap_2,House 2 gnomes
gnome_lodge,Gnome Lodge,carpenter,housing,gnome_house;manor_grounds,10000,5000,wood:100;silver:10,gnome_cap_3,House 3 gnomes
gnome_hall,Gnome Hall,carpenter,housing,gnome_lodge;great_estate,50000,25000,wood:200;crystal:5,gnome_cap_4,House 4 gnomes
gnome_village,Gnome Village,carpenter,housing,gnome_hall,250000,100000,wood:500;mythril:2,gnome_cap_5,House 5 gnomes
training_grounds,Training Grounds,carpenter,housing,gnome_lodge;manor_grounds,25000,10000,wood:200;silver:10;cave_crystal:2,training_speed_25,Train 25% faster
master_academy,Master Academy,carpenter,housing,training_grounds;great_estate,100000,50000,wood:500;crystal:5;frozen_heart:1,dual_role_gnomes,Gnomes can dual-role

# Skills Trainer - Carry Capacity
carry_2,Carry Capacity 2,skills,hero,,25,10,,carry_2,Carry 2 crops
carry_3,Carry Capacity 3,skills,hero,carry_2,50,15,,carry_3,Carry 3 crops
carry_4,Carry Capacity 4,skills,hero,carry_3,100,20,,carry_4,Carry 4 crops
carry_5,Carry Capacity 5,skills,hero,carry_4;homestead,200,30,,carry_5,Carry 5 crops
carry_6,Carry Capacity 6,skills,hero,carry_5,400,40,,carry_6,Carry 6 crops
carry_7,Carry Capacity 7,skills,hero,carry_6;manor_grounds,800,60,,carry_7,Carry 7 crops
carry_8,Carry Capacity 8,skills,hero,carry_7,1500,80,,carry_8,Carry 8 crops
carry_9,Carry Capacity 9,skills,hero,carry_8;great_estate,3000,100,,carry_9,Carry 9 crops
carry_10,Carry Capacity 10,skills,hero,carry_9,6000,125,,carry_10,Carry 10 crops
```

---

## Implementation Checklist

### Day 1-2: Create New CSV Files
- [ ] Create `/data/weapons.csv` with all 10 levels for each weapon type
- [ ] Create `/data/armor.csv` with defense ratings and special effects
- [ ] Create `/data/tools.csv` with base/plus/master tiers
- [ ] Create `/data/helpers.csv` with 5 gnomes
- [ ] Create `/data/helper_roles.csv` with 10 roles
- [ ] Create `/data/mining.csv` with 10 depth levels
- [ ] Create `/data/tower_levels.csv` with 11 reach levels
- [ ] Create `/data/vendors.csv` with 6 vendors
- [ ] Create `/data/cleanups.csv` with all farm cleanups
- [ ] Create `/data/boss_materials.csv` with special materials

### Day 3-4: Update Existing CSVs
- [ ] Update `/data/crops.csv` with seedLevel system
- [ ] Update `/data/adventures.csv` with combat data
- [ ] Update `/data/upgrades.csv` reorganized by vendor
- [ ] Create backup of old CSV files
- [ ] Test CSV loading with new structures

### Day 5: Update Game Configuration Page
- [ ] Add new tabs for each CSV type
- [ ] Update CSV importer to handle semicolon-delimited materials
- [ ] Add validation for new fields
- [ ] Create tooltips for complex fields
- [ ] Test import/export functionality

### Weekend: Testing and Validation
- [ ] Validate all prerequisite chains
- [ ] Check material requirements balance
- [ ] Verify upgrade progression paths
- [ ] Test data integrity checks
- [ ] Document any issues found

---

## Data Format Notes

### Material Lists
Materials are stored as semicolon-delimited key:value pairs:
```
materials: "wood:5;stone:3;copper:2"
```

### Prerequisites
Prerequisites use semicolon for AND conditions:
```
prerequisite: "spear_3;anvil_1"  // Requires both
```

### Range Values
Ranges use hyphen notation:
```
materials: "stone:8-12"  // Random between 8 and 12
```

### Multiple Values
Multiple values use semicolon separation:
```
xpPerLevel: "100;300;600;1000"  // Values for each level
```

---

## Next Steps After Phase 1

Once all CSV files are created and validated:
1. Update `gameValues.js` store to load new data structures
2. Create data validation functions for new formats
3. Update simulation engine to use new data
4. Begin Phase 2: Upgrade Tree visualization

---