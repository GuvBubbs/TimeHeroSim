/**
 * Core Simulation Engine
 * 
 * This file contains the pure simulation logic that can be run in any context
 * (main thread, web worker, or Node.js). It has no dependencies on Vue,
 * Pinia, or browser APIs.
 */

/**
 * Initialize a fresh game state
 */
export function initializeGameState(gameValues) {
  return {
    time: { day: 1, hour: 8, minute: 0 },
    resources: {
      energy: { current: 0, cap: 50 },
      gold: 0,
      materials: { stone: 0, copper: 0, iron: 0, silver: 0, crystal: 0, mythril: 0, obsidian: 0 }
    },
    farm: {
      plots: [
        { id: 1, crop: null, growthStage: 0, watered: false, plantedAt: null },
        { id: 2, crop: null, growthStage: 0, watered: false, plantedAt: null },
        { id: 3, crop: null, growthStage: 0, watered: false, plantedAt: null }
      ],
      waterTank: { current: 20, max: 20 },
      expansionsCompleted: 0,
      cameraWidth: 25
    },
    heroes: {
      carryCapacity: 2,
      currentLocation: 'home',
      currentAction: null
    },
    helpers: [],
    upgrades: {
      owned: [],
      blueprints: ['storage_1', 'pump_1']
    },
    tools: {
      owned: ['watering_can_1'],
      equipped: { weapon: null, tool: 'watering_can_1' }
    },
    tower: {
      floors: 1,
      autoMode: false,
      seedInventory: { carrot: 10, radish: 10, potato: 10 }
    },
    currentPhase: 'tutorial',
    resourceHistory: [],
    phaseHistory: [{ phase: 'tutorial', startDay: 1, duration: null }],
    upgradeHistory: [],
    discoveredHelpers: [],
    purchasedUpgrades: [],
    unlockedFeatures: ['farming'],
    currentTick: 0,
    day: 1
  }
}

/**
 * Process a single simulation tick (1 minute game time)
 */
export function simulateGameTick(gameState, gameValues) {
  try {
    const result = {
      error: null,
      phaseChanged: false,
      majorEvent: null,
      events: []
    }

    // Advance time
    advanceTime(gameState)

    // Process current action
    if (gameState.heroes.currentAction) {
      processCurrentAction(gameState, gameValues, result)
    }

    // Process helpers
    processHelpers(gameState, gameValues, result)

    // Process farm automation
    processFarmAutomation(gameState, gameValues, result)

    // Check for phase transitions
    const phaseChange = checkPhaseTransition(gameState, gameValues)
    if (phaseChange) {
      result.phaseChanged = true
      result.majorEvent = phaseChange
      gameState.currentPhase = phaseChange.newPhase
      
      // Update phase history
      if (gameState.phaseHistory.length > 0) {
        const lastPhase = gameState.phaseHistory[gameState.phaseHistory.length - 1]
        lastPhase.duration = gameState.day - lastPhase.startDay
      }
      gameState.phaseHistory.push({
        phase: phaseChange.newPhase,
        startDay: gameState.day,
        duration: null
      })
    }

    // AI decision making
    if (!gameState.heroes.currentAction) {
      makeAIDecision(gameState, gameValues, result)
    }

    // Update resource history periodically
    if (gameState.currentTick % 60 === 0) { // Every hour
      gameState.resourceHistory.push({
        timestamp: Date.now(),
        gameDay: gameState.day,
        hour: gameState.time.hour,
        resources: JSON.parse(JSON.stringify(gameState.resources))
      })

      // Limit history size
      if (gameState.resourceHistory.length > 672) { // 28 days * 24 hours
        gameState.resourceHistory = gameState.resourceHistory.slice(-672)
      }
    }

    gameState.currentTick++
    
    return result
  } catch (error) {
    return {
      error: error.message,
      phaseChanged: false,
      majorEvent: null,
      events: []
    }
  }
}

/**
 * Advance game time by 1 minute
 */
function advanceTime(gameState) {
  gameState.time.minute++
  
  if (gameState.time.minute >= 60) {
    gameState.time.minute = 0
    gameState.time.hour++
    
    if (gameState.time.hour >= 24) {
      gameState.time.hour = 0
      gameState.time.day++
      gameState.day = gameState.time.day
    }
  }
}

/**
 * Process the hero's current action
 */
function processCurrentAction(gameState, gameValues, result) {
  const action = gameState.heroes.currentAction
  if (!action) return

  action.timeRemaining--

  if (action.timeRemaining <= 0) {
    // Action completed
    const completionResult = completeAction(gameState, gameValues, action)
    if (completionResult.events) {
      result.events.push(...completionResult.events)
    }
    if (completionResult.majorEvent) {
      result.majorEvent = completionResult.majorEvent
    }
    
    gameState.heroes.currentAction = null
    
    // Return to home location after most actions
    if (action.type !== 'idle') {
      gameState.heroes.currentLocation = 'home'
    }
  }
}

/**
 * Complete an action and apply its effects
 */
function completeAction(gameState, gameValues, action) {
  const result = { events: [], majorEvent: null }

  switch (action.type) {
    case 'adventure':
      completeAdventure(gameState, gameValues, action, result)
      break
    case 'mining':
      completeMining(gameState, gameValues, action, result)
      break
    case 'crafting':
      completeCrafting(gameState, gameValues, action, result)
      break
    case 'water_crops':
      completeWatering(gameState, gameValues, action, result)
      break
    case 'harvest_crops':
      completeHarvesting(gameState, gameValues, action, result)
      break
    case 'plant_crops':
      completePlanting(gameState, gameValues, action, result)
      break
  }

  return result
}

/**
 * Complete adventure action
 */
function completeAdventure(gameState, gameValues, action, result) {
  const route = gameValues.adventures.find(a => a.id === action.target)
  if (!route) return

  // Gain gold and materials
  gameState.resources.gold += route.goldReward || 0
  
  if (route.materialRewards) {
    Object.entries(route.materialRewards).forEach(([material, amount]) => {
      gameState.resources.materials[material] = (gameState.resources.materials[material] || 0) + amount
    })
  }

  result.events.push({
    type: 'adventure_completed',
    route: route.name,
    rewards: { gold: route.goldReward, materials: route.materialRewards }
  })
}

/**
 * Complete mining action
 */
function completeMining(gameState, gameValues, action, result) {
  const depth = action.depth || 1
  
  // Calculate materials gained based on depth
  const baseStone = Math.floor(Math.random() * 3) + 1
  gameState.resources.materials.stone += baseStone

  // Chance for better materials at deeper levels
  if (depth > 5 && Math.random() < 0.3) {
    gameState.resources.materials.copper += Math.floor(Math.random() * 2) + 1
  }
  
  if (depth > 10 && Math.random() < 0.2) {
    gameState.resources.materials.iron += 1
  }

  // Helper discovery chance
  if (Math.random() < 0.05) { // 5% chance
    const helperTypes = ['gnome', 'golem', 'fairy']
    const discoveredType = helperTypes[Math.floor(Math.random() * helperTypes.length)]
    
    if (!gameState.discoveredHelpers.some(h => h.type === discoveredType)) {
      const newHelper = {
        id: `${discoveredType}_${Date.now()}`,
        type: discoveredType,
        discovered: true,
        awakened: false,
        efficiency: 1.0,
        level: 1
      }
      
      gameState.discoveredHelpers.push(newHelper)
      result.majorEvent = {
        type: 'helper_discovered',
        helper: newHelper
      }
    }
  }

  result.events.push({
    type: 'mining_completed',
    depth,
    materials: { stone: baseStone }
  })
}

/**
 * Process helpers' automatic actions
 */
function processHelpers(gameState, gameValues, result) {
  gameState.helpers.forEach(helper => {
    if (!helper.isWorking) return

    switch (helper.type) {
      case 'gnome':
        processGnomeWatering(gameState, helper, result)
        break
      case 'golem':
        processGolemHarvesting(gameState, helper, result)
        break
      case 'fairy':
        processFairyPlanting(gameState, helper, result)
        break
    }
  })
}

/**
 * Process gnome automatic watering
 */
function processGnomeWatering(gameState, helper, result) {
  const unwateredPlots = gameState.farm.plots.filter(p => p.crop && !p.watered)
  
  if (unwateredPlots.length > 0 && gameState.farm.waterTank.current > 0) {
    const plotToWater = unwateredPlots[0]
    plotToWater.watered = true
    gameState.farm.waterTank.current--
    
    result.events.push({
      type: 'helper_watered',
      helper: helper.id,
      plot: plotToWater.id
    })
  }
}

/**
 * Process golem automatic harvesting
 */
function processGolemHarvesting(gameState, helper, result) {
  const readyPlots = gameState.farm.plots.filter(p => p.crop && p.growthStage >= 3)
  
  if (readyPlots.length > 0) {
    const plotToHarvest = readyPlots[0]
    const crop = gameValues.crops.find(c => c.id === plotToHarvest.crop)
    
    if (crop) {
      // Harvest the crop
      gameState.resources.energy.current = Math.min(
        gameState.resources.energy.cap,
        gameState.resources.energy.current + crop.energyValue
      )
      
      // Clear the plot
      plotToHarvest.crop = null
      plotToHarvest.growthStage = 0
      plotToHarvest.watered = false
      plotToHarvest.plantedAt = null
      
      result.events.push({
        type: 'helper_harvested',
        helper: helper.id,
        plot: plotToHarvest.id,
        crop: crop.name,
        energy: crop.energyValue
      })
    }
  }
}

/**
 * Process farm automation (crop growth)
 */
function processFarmAutomation(gameState, gameValues, result) {
  gameState.farm.plots.forEach(plot => {
    if (plot.crop && plot.watered) {
      // Crops grow every 30 minutes when watered
      if (gameState.currentTick % 30 === 0) {
        if (plot.growthStage < 3) {
          plot.growthStage++
          
          if (plot.growthStage === 3) {
            result.events.push({
              type: 'crop_ready',
              plot: plot.id,
              crop: plot.crop
            })
          }
        }
      }
    }
  })
}

/**
 * Check for phase transitions
 */
function checkPhaseTransition(gameState, gameValues) {
  const currentPhase = gameState.currentPhase
  
  switch (currentPhase) {
    case 'tutorial':
      // Tutorial ends when first upgrade is purchased
      if (gameState.upgrades.owned.length > 0) {
        return {
          type: 'phase_transition',
          oldPhase: 'tutorial',
          newPhase: 'early',
          trigger: 'first_upgrade_purchased'
        }
      }
      break
      
    case 'early':
      // Early phase ends when first helper is awakened
      if (gameState.helpers.length > 0) {
        return {
          type: 'phase_transition',
          oldPhase: 'early',
          newPhase: 'mid',
          trigger: 'first_helper_awakened'
        }
      }
      break
      
    case 'mid':
      // Mid phase ends when 3+ helpers are active
      if (gameState.helpers.length >= 3) {
        return {
          type: 'phase_transition',
          oldPhase: 'mid',
          newPhase: 'late',
          trigger: 'multiple_helpers_active'
        }
      }
      break
      
    case 'late':
      // Late phase ends when day 21+ with advanced upgrades
      if (gameState.day >= 21 && gameState.upgrades.owned.length >= 10) {
        return {
          type: 'phase_transition',
          oldPhase: 'late',
          newPhase: 'endgame',
          trigger: 'advanced_progression'
        }
      }
      break
  }
  
  return null
}

/**
 * AI decision making for next action
 */
function makeAIDecision(gameState, gameValues, result) {
  // Simple AI logic - this should be expanded based on current phase and resources
  
  // Priority 1: Harvest ready crops
  const readyPlots = gameState.farm.plots.filter(p => p.crop && p.growthStage >= 3)
  if (readyPlots.length > 0) {
    gameState.heroes.currentAction = {
      type: 'harvest_crops',
      timeRemaining: 2, // 2 minutes to harvest
      startedAt: gameState.currentTick
    }
    return
  }
  
  // Priority 2: Water unwatered crops
  const unwateredPlots = gameState.farm.plots.filter(p => p.crop && !p.watered)
  if (unwateredPlots.length > 0 && gameState.farm.waterTank.current > 0) {
    gameState.heroes.currentAction = {
      type: 'water_crops',
      timeRemaining: 1,
      startedAt: gameState.currentTick
    }
    return
  }
  
  // Priority 3: Plant empty plots
  const emptyPlots = gameState.farm.plots.filter(p => !p.crop)
  if (emptyPlots.length > 0) {
    gameState.heroes.currentAction = {
      type: 'plant_crops',
      target: 'carrot', // Default crop
      timeRemaining: 1,
      startedAt: gameState.currentTick
    }
    return
  }
  
  // Priority 4: Go on adventure if energy is low
  if (gameState.resources.energy.current < gameState.resources.energy.cap * 0.3) {
    const adventure = gameValues.adventures?.[0] // Take first available adventure
    if (adventure) {
      gameState.heroes.currentAction = {
        type: 'adventure',
        target: adventure.id,
        timeRemaining: adventure.duration || 30,
        startedAt: gameState.currentTick
      }
      gameState.heroes.currentLocation = 'adventure'
      return
    }
  }
  
  // Default: Idle
  gameState.heroes.currentAction = {
    type: 'idle',
    timeRemaining: 10, // Idle for 10 minutes before making next decision
    startedAt: gameState.currentTick
  }
}

/**
 * Complete watering action
 */
function completeWatering(gameState, gameValues, action, result) {
  const unwateredPlots = gameState.farm.plots.filter(p => p.crop && !p.watered)
  
  unwateredPlots.forEach(plot => {
    if (gameState.farm.waterTank.current > 0) {
      plot.watered = true
      gameState.farm.waterTank.current--
    }
  })
  
  result.events.push({
    type: 'crops_watered',
    count: unwateredPlots.length
  })
}

/**
 * Complete harvesting action
 */
function completeHarvesting(gameState, gameValues, action, result) {
  const readyPlots = gameState.farm.plots.filter(p => p.crop && p.growthStage >= 3)
  let totalEnergy = 0
  
  readyPlots.forEach(plot => {
    const crop = gameValues.crops.find(c => c.id === plot.crop)
    if (crop) {
      totalEnergy += crop.energyValue
      
      // Clear the plot
      plot.crop = null
      plot.growthStage = 0
      plot.watered = false
      plot.plantedAt = null
    }
  })
  
  gameState.resources.energy.current = Math.min(
    gameState.resources.energy.cap,
    gameState.resources.energy.current + totalEnergy
  )
  
  result.events.push({
    type: 'crops_harvested',
    count: readyPlots.length,
    energy: totalEnergy
  })
}

/**
 * Complete planting action
 */
function completePlanting(gameState, gameValues, action, result) {
  const emptyPlots = gameState.farm.plots.filter(p => !p.crop)
  const cropToPlant = action.target || 'carrot'
  
  emptyPlots.forEach(plot => {
    plot.crop = cropToPlant
    plot.growthStage = 0
    plot.watered = false
    plot.plantedAt = gameState.currentTick
  })
  
  result.events.push({
    type: 'crops_planted',
    count: emptyPlots.length,
    crop: cropToPlant
  })
}

/**
 * Complete crafting action
 */
function completeCrafting(gameState, gameValues, action, result) {
  // Basic crafting completion - this should be expanded
  result.events.push({
    type: 'crafting_completed',
    item: action.target
  })
}
