import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useGameValuesStore } from './gameValues.js'

/**
 * Simulation Store - Current simulation state
 * 
 * This store tracks the current state of the running simulation,
 * including game state, player parameters, and simulation controls.
 */
export const useSimulationStore = defineStore('simulation', () => {
  // Simulation control state
  const isRunning = ref(false)
  const isPaused = ref(false)
  const simulationSpeed = ref(1) // 1x, 10x, 100x, max
  const currentDay = ref(1)
  const currentHour = ref(8)
  const currentMinute = ref(0)
  
  // Game state - represents the actual game state at current time
  const gameState = ref({
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
      cameraWidth: 25 // tiles
    },
    heroes: {
      carryCapacity: 2,
      currentLocation: 'home', // home, adventure, mine, forge, tower, town
      currentAction: null // { type, target, timeRemaining, startedAt }
    },
    helpers: [],
    upgrades: {
      owned: [],
      blueprints: ['storage_1', 'pump_1'] // Free starter blueprints
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
    currentPhase: 'tutorial'
  })
  
  // Player behavior parameters (modifiable simulation settings)
  const playerProfile = ref({
    // Basic behavior
    dailyCheckIns: { weekday: 3, weekend: 5 },
    sessionLength: { weekday: 15, weekend: 30 }, // minutes
    sleepHours: 8,
    workHours: { start: 9, end: 17 }, // can't play during work
    timezone: 'local',
    
    // Efficiency by phase (how optimally they play)
    efficiency: {
      tutorial: 0.65,
      early: 0.70,
      mid: 0.75,
      late: 0.80,
      endgame: 0.85
    },
    
    // Play patterns
    weekdaySchedule: [
      { time: '07:00', duration: 10, probability: 0.8 },
      { time: '12:00', duration: 5, probability: 0.6 },
      { time: '18:00', duration: 20, probability: 0.9 }
    ],
    weekendSchedule: [
      { time: '09:00', duration: 30, probability: 0.7 },
      { time: '14:00', duration: 25, probability: 0.6 },
      { time: '20:00', duration: 45, probability: 0.9 }
    ],
    
    // Decision making
    upgradeStrategy: 'balanced', // balanced, storage-focused, production-focused
    adventurePreference: 'medium', // short, medium, long
    riskTolerance: 0.7, // 0-1, affects deep mining, long adventures
    optimizationLevel: 0.75 // 0-1, how often makes optimal choice
  })
  
  // Simulation settings
  const simulationSettings = ref({
    maxDays: 35,
    logLevel: 'standard', // minimal, standard, detailed, debug
    enableValidation: true,
    autoSave: true,
    exportMetrics: true
  })
  
  // Event log for tracking what happens
  const eventLog = ref([])
  const maxLogEntries = ref(10000)
  
  // Current simulation metrics
  const metrics = ref({
    totalSimulationTime: 0, // real seconds
    gameTimeElapsed: 0, // game minutes
    eventsLogged: 0,
    phaseDurations: {},
    screenTime: {
      home: 0,
      adventure: 0,
      mine: 0,
      forge: 0,
      tower: 0,
      town: 0
    },
    upgradeTimings: {},
    resourceFlows: {
      energyGenerated: 0,
      energySpent: 0,
      energyWasted: 0 // hit storage cap
    }
  })
  
  // Computed values
  const gameTime = computed(() => {
    return `Day ${currentDay.value}, ${String(currentHour.value).padStart(2, '0')}:${String(currentMinute.value).padStart(2, '0')}`
  })
  
  const currentEfficiency = computed(() => {
    return playerProfile.value.efficiency[gameState.value.currentPhase] || 0.5
  })
  
  const energyPercentage = computed(() => {
    return (gameState.value.resources.energy.current / gameState.value.resources.energy.cap) * 100
  })
  
  const isPlayerActive = computed(() => {
    // TODO: Implement schedule-based availability
    return !gameState.value.heroes.currentAction || gameState.value.heroes.currentAction.type === 'idle'
  })
  
  // Actions
  function startSimulation() {
    if (!isRunning.value) {
      isRunning.value = true
      isPaused.value = false
      startSimulationLoop()
      logEvent('SIMULATION', 'Started', {
        profile: playerProfile.value,
        settings: simulationSettings.value
      })
    }
  }
  
  function pauseSimulation() {
    if (isRunning.value && !isPaused.value) {
      isPaused.value = true
      stopSimulationLoop()
      logEvent('SIMULATION', 'Paused')
    }
  }
  
  function resumeSimulation() {
    if (isRunning.value && isPaused.value) {
      isPaused.value = false
      startSimulationLoop()
      logEvent('SIMULATION', 'Resumed')
    }
  }
  
  function stopSimulation() {
    if (isRunning.value) {
      isRunning.value = false
      isPaused.value = false
      stopSimulationLoop()
      logEvent('SIMULATION', 'Stopped')
    }
  }
  
  function resetSimulation() {
    // Reset to initial state
    currentDay.value = 1
    currentHour.value = 8
    currentMinute.value = 0
    
    gameState.value = {
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
      currentPhase: 'tutorial'
    }
    
    eventLog.value = []
    metrics.value = {
      totalSimulationTime: 0,
      gameTimeElapsed: 0,
      eventsLogged: 0,
      phaseDurations: {},
      screenTime: {
        home: 0,
        adventure: 0,
        mine: 0,
        forge: 0,
        tower: 0,
        town: 0
      },
      upgradeTimings: {},
      resourceFlows: {
        energyGenerated: 0,
        energySpent: 0,
        energyWasted: 0
      }
    }
    
    isRunning.value = false
    isPaused.value = false
    
    logEvent('SIMULATION', 'Reset to initial state')
  }
  
  function updatePlayerProfile(newProfile) {
    playerProfile.value = { ...playerProfile.value, ...newProfile }
    logEvent('CONFIG', 'Player profile updated', newProfile)
  }
  
  function updateSimulationSettings(newSettings) {
    simulationSettings.value = { ...simulationSettings.value, ...newSettings }
    logEvent('CONFIG', 'Simulation settings updated', newSettings)
  }
  
  function logEvent(category, action, details = null) {
    const event = {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      gameTime: gameTime.value,
      category,
      action,
      details
    }
    
    eventLog.value.push(event)
    metrics.value.eventsLogged++
    
    // Trim log if too long
    if (eventLog.value.length > maxLogEntries.value) {
      eventLog.value = eventLog.value.slice(-maxLogEntries.value)
    }
  }
  
  function advanceTime(minutes = 1) {
    currentMinute.value += minutes
    
    // Handle hour overflow
    while (currentMinute.value >= 60) {
      currentMinute.value -= 60
      currentHour.value++
    }
    
    // Handle day overflow
    while (currentHour.value >= 24) {
      currentHour.value -= 24
      currentDay.value++
    }
    
    // Update game state time
    gameState.value.time = {
      day: currentDay.value,
      hour: currentHour.value,
      minute: currentMinute.value
    }
    
    metrics.value.gameTimeElapsed += minutes
  }

  // === CORE GAME SYSTEMS ===

  // Game tick - advances game time by 1 minute and processes all systems
  function gameTick() {
    if (!isRunning.value || isPaused.value) return

    // Advance time by 1 minute
    advanceTime(1)

    // Process all game systems
    processFarmGrowth()
    processEnergyGeneration()
    processResourceCaps()
    processOngoingActions()
    processHelperAutomation()
    checkPhaseProgression()

    // Helper discovery check (every 5 minutes while actively farming)
    if (currentMinute.value % 5 === 0) {
      const activePlots = gameState.value.farm.plots.filter(plot => plot.crop).length
      if (activePlots > 0) {
        checkHelperDiscovery()
      }
    }

    // Player behavior simulation (check for sessions every 10 minutes)
    if (currentMinute.value % 10 === 0) {
      const sessionCheck = checkPlayerSession()
      if (sessionCheck.shouldPlay) {
        simulatePlayerSession(sessionCheck)
      }
    }

    // Log major events
    if (currentMinute.value === 0) {
      logEvent('TIME', `Hour ${currentHour.value} - Day ${currentDay.value}`)
    }
  }

  // Process crop growth for all plots
  function processFarmGrowth() {
    const gameValues = useGameValuesStore()
    let harvestsAvailable = false

    gameState.value.farm.plots.forEach(plot => {
      if (plot.crop && plot.plantedAt) {
        const cropData = gameValues.getCrop(plot.crop)
        if (!cropData) return

        const minutesSincePlanted = metrics.value.gameTimeElapsed - plot.plantedAt
        const growthProgress = minutesSincePlanted / cropData.growthTime

        // Update growth stage (0-4, where 4 = ready to harvest)
        const newStage = Math.min(4, Math.floor(growthProgress * 4))
        
        if (newStage > plot.growthStage) {
          plot.growthStage = newStage
          
          if (newStage === 4) {
            harvestsAvailable = true
            logEvent('FARM', `${cropData.name} ready to harvest on plot ${plot.id}`)
          }
        }
      }
    })

    if (harvestsAvailable) {
      logEvent('FARM', 'Crops ready for harvest!')
    }
  }

  // Generate energy from mature crops
  function processEnergyGeneration() {
    const gameValues = useGameValuesStore()
    let totalEnergyGenerated = 0

    gameState.value.farm.plots.forEach(plot => {
      if (plot.crop && plot.growthStage === 4) {
        const cropData = gameValues.getCrop(plot.crop)
        if (cropData) {
          // Generate energy per minute for mature crops
          const energyPerMinute = cropData.energyPerMinute || (cropData.energy / cropData.growthTime)
          totalEnergyGenerated += energyPerMinute
        }
      }
    })

    if (totalEnergyGenerated > 0) {
      addResource('energy', totalEnergyGenerated)
      metrics.value.resourceFlows.energyGenerated += totalEnergyGenerated
    }
  }

  // Enforce resource storage caps and track overflow
  function processResourceCaps() {
    const energyOverflow = Math.max(0, gameState.value.resources.energy.current - gameState.value.resources.energy.cap)
    
    if (energyOverflow > 0) {
      gameState.value.resources.energy.current = gameState.value.resources.energy.cap
      metrics.value.resourceFlows.energyWasted += energyOverflow
      
      if (Math.floor(currentMinute.value / 10) === currentMinute.value / 10) { // Log every 10 minutes
        logEvent('RESOURCE', `Energy overflow: ${energyOverflow.toFixed(1)} energy wasted`, 'warning')
      }
    }
  }

  // Check if player has progressed to next phase
  function checkPhaseProgression() {
    const currentPhase = gameState.value.currentPhase
    const activePlots = gameState.value.farm.plots.filter(plot => plot.crop).length
    const day = currentDay.value

    let newPhase = currentPhase

    // Phase progression logic based on Time Hero design
    if (currentPhase === 'tutorial' && (activePlots >= 3 || day >= 1)) {
      newPhase = 'early'
    } else if (currentPhase === 'early' && (activePlots >= 10 || day >= 3)) {
      newPhase = 'mid'
    } else if (currentPhase === 'mid' && (activePlots >= 25 || day >= 8)) {
      newPhase = 'late'
    } else if (currentPhase === 'late' && (activePlots >= 50 || day >= 15)) {
      newPhase = 'endgame'
    }

    if (newPhase !== currentPhase) {
      gameState.value.currentPhase = newPhase
      logEvent('PROGRESSION', `Entered ${newPhase} phase!`, 'major')
      
      // Track phase duration
      if (!metrics.value.phaseDurations[currentPhase]) {
        metrics.value.phaseDurations[currentPhase] = 0
      }
      metrics.value.phaseDurations[currentPhase] = metrics.value.gameTimeElapsed
    }
  }

  // Add resources with validation
  function addResource(type, amount) {
    if (type === 'energy') {
      gameState.value.resources.energy.current += amount
    } else if (type === 'gold') {
      gameState.value.resources.gold += amount
    } else if (gameState.value.resources.materials.hasOwnProperty(type)) {
      gameState.value.resources.materials[type] += amount
    }
  }

  // Spend resources (returns true if successful)
  function spendResource(type, amount) {
    if (type === 'energy') {
      if (gameState.value.resources.energy.current >= amount) {
        gameState.value.resources.energy.current -= amount
        metrics.value.resourceFlows.energySpent += amount
        return true
      }
    } else if (type === 'gold') {
      if (gameState.value.resources.gold >= amount) {
        gameState.value.resources.gold -= amount
        return true
      }
    } else if (gameState.value.resources.materials.hasOwnProperty(type)) {
      if (gameState.value.resources.materials[type] >= amount) {
        gameState.value.resources.materials[type] -= amount
        return true
      }
    }
    return false
  }

  // Plant a crop on a plot
  function plantCrop(plotId, cropType) {
    const gameValues = useGameValuesStore()
    const plot = gameState.value.farm.plots.find(p => p.id === plotId)
    const cropData = gameValues.getCrop(cropType)
    
    if (!plot || !cropData || plot.crop) return false

    plot.crop = cropType
    plot.growthStage = 0
    plot.watered = false
    plot.plantedAt = metrics.value.gameTimeElapsed

    logEvent('FARM', `Planted ${cropData.name} on plot ${plotId}`)
    return true
  }

  // Harvest a crop from a plot
  function harvestCrop(plotId) {
    const gameValues = useGameValuesStore()
    const plot = gameState.value.farm.plots.find(p => p.id === plotId)
    
    if (!plot || !plot.crop || plot.growthStage < 4) return false

    const cropData = gameValues.getCrop(plot.crop)
    if (cropData) {
      addResource('energy', cropData.energy)
      logEvent('FARM', `Harvested ${cropData.name} from plot ${plotId} (+${cropData.energy} energy)`)
    }

    // Clear the plot
    plot.crop = null
    plot.growthStage = 0
    plot.watered = false
    plot.plantedAt = null

    return true
  }

  // === ADVENTURE SYSTEM ===

  // Start an adventure
  function startAdventure(adventureId, duration = 'medium') {
    const gameValues = useGameValuesStore()
    const adventure = gameValues.getAdventure(adventureId)
    
    if (!adventure) {
      logEvent('ADVENTURE', `Unknown adventure: ${adventureId}`, 'error')
      return false
    }

    // Check if hero is available
    if (gameState.value.heroes.currentAction && gameState.value.heroes.currentAction.type !== 'idle') {
      logEvent('ADVENTURE', 'Hero is busy', 'warning')
      return false
    }

    // Check unlock requirements
    if (currentDay.value < adventure.unlockDay) {
      logEvent('ADVENTURE', `${adventure.name} unlocks on day ${adventure.unlockDay}`, 'warning')
      return false
    }

    // Get energy cost and duration for selected option
    const energyCost = adventure[`${duration}Energy`]
    const adventureDuration = adventure[`${duration}Duration`]
    
    if (!energyCost || !adventureDuration) {
      logEvent('ADVENTURE', `Invalid duration option: ${duration}`, 'error')
      return false
    }

    // Check energy requirement
    if (!spendResource('energy', energyCost)) {
      logEvent('ADVENTURE', `Not enough energy for ${adventure.name} (${duration}): need ${energyCost}`, 'warning')
      return false
    }

    // Start the adventure
    gameState.value.heroes.currentAction = {
      type: 'adventure',
      target: adventureId,
      duration: duration,
      timeRemaining: adventureDuration,
      startedAt: metrics.value.gameTimeElapsed,
      energyCost: energyCost
    }

    gameState.value.heroes.currentLocation = 'adventure'
    
    logEvent('ADVENTURE', `Started ${adventure.name} (${duration}, ${adventureDuration}min, ${energyCost} energy)`)
    return true
  }

  // Process adventure completion
  function completeAdventure() {
    const action = gameState.value.heroes.currentAction
    if (!action || action.type !== 'adventure') return

    const gameValues = useGameValuesStore()
    const adventure = gameValues.getAdventure(action.target)
    
    if (adventure) {
      // Give rewards
      addResource('gold', adventure.goldReward)
      
      // Add materials based on duration
      if (adventure.commonMaterial && adventure.commonAmount) {
        addResource(adventure.commonMaterial, adventure.commonAmount)
      }
      
      // Chance for rare materials (50% for medium+)
      if (action.duration !== 'short' && adventure.rareMaterial && adventure.rareAmount) {
        if (Math.random() < 0.5) {
          addResource(adventure.rareMaterial, adventure.rareAmount)
          logEvent('ADVENTURE', `Bonus: +${adventure.rareAmount} ${adventure.rareMaterial}!`)
        }
      }
      
      // Boss materials for long adventures (25% chance)
      if (action.duration === 'long' && adventure.bossMaterial && adventure.bossAmount) {
        if (Math.random() < 0.25) {
          addResource(adventure.bossMaterial, adventure.bossAmount)
          logEvent('ADVENTURE', `Rare drop: +${adventure.bossAmount} ${adventure.bossMaterial}!`, 'major')
        }
      }

      logEvent('ADVENTURE', `Completed ${adventure.name}! +${adventure.goldReward} gold`)
    }

    // Reset hero state
    gameState.value.heroes.currentAction = null
    gameState.value.heroes.currentLocation = 'home'
  }

  // === MINING SYSTEM ===

  // Start mining at a specific depth
  function startMining(depth = 1, duration = 30) {
    // Check if hero is available
    if (gameState.value.heroes.currentAction && gameState.value.heroes.currentAction.type !== 'idle') {
      logEvent('MINING', 'Hero is busy', 'warning')
      return false
    }

    // Calculate energy cost based on depth (10 * depth^1.5)
    const energyCost = Math.floor(10 * Math.pow(depth, 1.5))
    
    // Check energy requirement
    if (!spendResource('energy', energyCost)) {
      logEvent('MINING', `Not enough energy for depth ${depth}: need ${energyCost}`, 'warning')
      return false
    }

    // Start mining
    gameState.value.heroes.currentAction = {
      type: 'mining',
      target: depth,
      timeRemaining: duration,
      startedAt: metrics.value.gameTimeElapsed,
      energyCost: energyCost
    }

    gameState.value.heroes.currentLocation = 'mine'
    
    logEvent('MINING', `Started mining at depth ${depth} (${duration}min, ${energyCost} energy)`)
    return true
  }

  // Process mining completion
  function completeMining() {
    const action = gameState.value.heroes.currentAction
    if (!action || action.type !== 'mining') return

    const depth = action.target
    
    // Calculate rewards based on depth
    const goldReward = Math.floor(50 * Math.pow(depth, 1.2))
    const stoneAmount = Math.floor(2 * depth)
    
    addResource('gold', goldReward)
    addResource('stone', stoneAmount)
    
    // Chance for rare materials at deeper levels
    if (depth >= 5 && Math.random() < 0.3) {
      addResource('copper', Math.floor(depth / 2))
      logEvent('MINING', `Found copper at depth ${depth}!`)
    }
    
    if (depth >= 10 && Math.random() < 0.2) {
      addResource('iron', Math.floor(depth / 5))
      logEvent('MINING', `Found iron at depth ${depth}!`)
    }

    logEvent('MINING', `Mining complete! +${goldReward} gold, +${stoneAmount} stone`)

    // Reset hero state
    gameState.value.heroes.currentAction = null
    gameState.value.heroes.currentLocation = 'home'
  }

  // === HELPER DISCOVERY SYSTEM ===

  // Check for helper discovery during farming actions
  function checkHelperDiscovery() {
    const activePlots = gameState.value.farm.plots.filter(plot => plot.crop).length
    const helpersFound = gameState.value.helpers.length
    const daysPassed = currentDay.value - 1
    
    // Base discovery chance scales with plot count and includes pity system
    let discoveryChance = 0
    
    if (helpersFound === 0) {
      // First gnome discovery - becomes likely around 20+ plots
      const plotBonus = Math.max(0, activePlots - 15) * 0.02 // 2% per plot above 15
      const pityBonus = Math.max(0, daysPassed - 3) * 0.05 // 5% per day after day 3
      discoveryChance = Math.min(0.15, plotBonus + pityBonus) // Cap at 15%
    } else if (helpersFound === 1) {
      // Second helper (golem) - rare, needs more plots and time
      const plotBonus = Math.max(0, activePlots - 40) * 0.01 // 1% per plot above 40
      const pityBonus = Math.max(0, daysPassed - 10) * 0.02 // 2% per day after day 10
      discoveryChance = Math.min(0.08, plotBonus + pityBonus) // Cap at 8%
    } else {
      // Additional helpers - very rare endgame content
      const plotBonus = Math.max(0, activePlots - 70) * 0.005
      const pityBonus = Math.max(0, daysPassed - 20) * 0.01
      discoveryChance = Math.min(0.03, plotBonus + pityBonus) // Cap at 3%
    }
    
    if (Math.random() < discoveryChance) {
      discoverHelper()
      return true
    }
    
    return false
  }

  // Discover a new helper
  function discoverHelper() {
    const helpersFound = gameState.value.helpers.length
    let helperType = 'gnome'
    let helperName = 'Gnome'
    let abilities = ['auto_harvest']
    
    if (helpersFound === 1) {
      helperType = 'golem'
      helperName = 'Stone Golem'
      abilities = ['auto_plant', 'auto_water']
    } else if (helpersFound >= 2) {
      const types = ['sprite', 'dragon', 'phoenix']
      helperType = types[helpersFound - 2] || 'ancient'
      helperName = helperType.charAt(0).toUpperCase() + helperType.slice(1)
      abilities = ['auto_adventure', 'auto_mine']
    }
    
    const helper = {
      id: `helper_${helpersFound + 1}`,
      type: helperType,
      name: helperName,
      abilities: abilities,
      discoveredAt: metrics.value.gameTimeElapsed,
      discoveredDay: currentDay.value,
      efficiency: 0.8 + (helpersFound * 0.1), // Efficiency improves with each helper
      active: true
    }
    
    gameState.value.helpers.push(helper)
    
    logEvent('DISCOVERY', `🎉 HELPER DISCOVERED! Found ${helperName}!`, 'major')
    logEvent('DISCOVERY', `${helperName} will help with: ${abilities.join(', ')}`)
    
    // This is a major milestone
    metrics.value.screenTime.home += 120 // Player celebrates for 2 minutes
  }

  // Process helper automation
  function processHelperAutomation() {
    gameState.value.helpers.forEach(helper => {
      if (!helper.active) return
      
      helper.abilities.forEach(ability => {
        switch (ability) {
          case 'auto_harvest':
            autoHarvestCrops(helper.efficiency)
            break
          case 'auto_plant':
            autoPlantCrops(helper.efficiency)
            break
          case 'auto_water':
            autoWaterCrops(helper.efficiency)
            break
          case 'auto_adventure':
            autoAdventure(helper.efficiency)
            break
          case 'auto_mine':
            autoMine(helper.efficiency)
            break
        }
      })
    })
  }

  // Helper auto-harvest function
  function autoHarvestCrops(efficiency) {
    gameState.value.farm.plots.forEach(plot => {
      if (plot.crop && plot.growthStage >= 4 && Math.random() < efficiency) {
        harvestCrop(plot.id)
      }
    })
  }

  // Helper auto-plant function
  function autoPlantCrops(efficiency) {
    const emptyPlots = gameState.value.farm.plots.filter(p => !p.crop)
    if (emptyPlots.length === 0) return
    
    const availableCrops = getAvailableCrops()
    if (availableCrops.length === 0) return
    
    emptyPlots.forEach(plot => {
      if (Math.random() < efficiency * 0.3) { // Helpers plant less frequently than players
        const cropChoice = chooseCropForPhase(availableCrops, efficiency)
        if (cropChoice) {
          plantCrop(plot.id, cropChoice)
        }
      }
    })
  }

  // Helper auto-water function (placeholder - could be used for future water mechanics)
  function autoWaterCrops(efficiency) {
    // Could implement automatic watering if that becomes a mechanic
  }

  // Helper auto-adventure function
  function autoAdventure(efficiency) {
    if (gameState.value.heroes.currentAction) return // Don't interfere with manual actions
    if (gameState.value.resources.energy.current < 200) return // Keep energy for other activities
    
    if (Math.random() < efficiency * 0.1) { // Rare automated adventures
      const adventure = chooseAdventure(efficiency * 0.8) // Slightly less optimal choices
      if (adventure) {
        startAdventure(adventure.id, adventure.duration)
      }
    }
  }

  // Helper auto-mine function
  function autoMine(efficiency) {
    if (gameState.value.heroes.currentAction) return
    if (gameState.value.resources.energy.current < 300) return
    
    if (Math.random() < efficiency * 0.05) { // Very rare automated mining
      const depth = Math.min(3, Math.floor(currentDay.value / 5) + 1)
      startMining(depth, 20) // Shorter automated mining sessions
    }
  }

  // === UPGRADE SYSTEM ===

  // Check if an upgrade is available for purchase
  function isUpgradeAvailable(upgradeId) {
    const gameValues = useGameValuesStore()
    const upgrade = gameValues.getUpgrade(upgradeId)
    
    if (!upgrade) return false
    if (gameState.value.upgrades.owned.includes(upgradeId)) return false
    if (currentDay.value < upgrade.unlockDay) return false
    
    return true
  }

  // Check if player can afford an upgrade
  function canAffordUpgrade(upgradeId) {
    const gameValues = useGameValuesStore()
    const upgrade = gameValues.getUpgrade(upgradeId)
    
    if (!upgrade || !upgrade.cost) return false
    
    // Check all resource requirements
    if (gameState.value.resources.gold < upgrade.cost.gold) return false
    if (gameState.value.resources.energy.current < upgrade.cost.energy) return false
    
    // Check material requirements
    for (const [material, amount] of Object.entries(upgrade.cost)) {
      if (material === 'gold' || material === 'energy') continue
      if (amount > 0 && gameState.value.resources.materials[material] < amount) {
        return false
      }
    }
    
    return true
  }

  // Purchase an upgrade
  function purchaseUpgrade(upgradeId) {
    const gameValues = useGameValuesStore()
    const upgrade = gameValues.getUpgrade(upgradeId)
    
    if (!isUpgradeAvailable(upgradeId)) {
      logEvent('UPGRADE', `${upgrade?.name || upgradeId} not available`, 'warning')
      return false
    }
    
    if (!canAffordUpgrade(upgradeId)) {
      logEvent('UPGRADE', `Cannot afford ${upgrade.name}`, 'warning')
      return false
    }
    
    // Spend resources
    spendResource('gold', upgrade.cost.gold)
    spendResource('energy', upgrade.cost.energy)
    
    for (const [material, amount] of Object.entries(upgrade.cost)) {
      if (material !== 'gold' && material !== 'energy' && amount > 0) {
        spendResource(material, amount)
      }
    }
    
    // Add to owned upgrades
    gameState.value.upgrades.owned.push(upgradeId)
    
    // Apply upgrade effects
    applyUpgradeEffect(upgradeId, upgrade.effect)
    
    logEvent('UPGRADE', `Purchased ${upgrade.name}!`, 'major')
    
    // Track timing for analysis
    metrics.value.upgradeTimings[upgradeId] = {
      day: currentDay.value,
      gameTime: metrics.value.gameTimeElapsed
    }
    
    return true
  }

  // Apply upgrade effects to game state
  function applyUpgradeEffect(upgradeId, effect) {
    switch (effect) {
      case 'energy_cap_150':
        gameState.value.resources.energy.cap = 150
        break
      case 'energy_cap_500':
        gameState.value.resources.energy.cap = 500
        break
      case 'energy_cap_1500':
        gameState.value.resources.energy.cap = 1500
        break
      case 'energy_cap_6000':
        gameState.value.resources.energy.cap = 6000
        break
      case 'energy_cap_20000':
        gameState.value.resources.energy.cap = 20000
        break
      case 'energy_cap_100000':
        gameState.value.resources.energy.cap = 100000
        break
      case 'water_cap_60':
        gameState.value.farm.waterTank.max = 60
        break
      case 'water_cap_200':
        gameState.value.farm.waterTank.max = 200
        break
      case 'water_cap_600':
        gameState.value.farm.waterTank.max = 600
        break
      case 'water_cap_2000':
        gameState.value.farm.waterTank.max = 2000
        break
      case 'water_cap_10000':
        gameState.value.farm.waterTank.max = 10000
        break
      case 'carry_4_crops':
        gameState.value.heroes.carryCapacity = 4
        break
      case 'carry_8_crops':
        gameState.value.heroes.carryCapacity = 8
        break
      case 'carry_12_crops':
        gameState.value.heroes.carryCapacity = 12
        break
      case 'carry_20_crops':
        gameState.value.heroes.carryCapacity = 20
        break
      case 'carry_30_crops':
        gameState.value.heroes.carryCapacity = 30
        break
      case 'tower_floor_2':
      case 'tower_floor_3':
      case 'tower_floor_4':
      case 'tower_floor_5':
      case 'tower_floor_6':
      case 'tower_floor_7':
        const floor = parseInt(effect.split('_')[2])
        gameState.value.tower.floors = Math.max(gameState.value.tower.floors, floor)
        break
      default:
        logEvent('UPGRADE', `Unknown effect: ${effect}`, 'warning')
    }
    
    logEvent('UPGRADE', `Applied effect: ${effect}`)
  }

  // Auto-purchase upgrades based on player efficiency and strategy
  function considerUpgradePurchases(efficiency) {
    const gameValues = useGameValuesStore()
    const strategy = playerProfile.value.upgradeStrategy
    
    // Get available upgrades sorted by priority
    const availableUpgrades = Object.entries(gameValues.upgrades)
      .filter(([id, upgrade]) => isUpgradeAvailable(id) && canAffordUpgrade(id))
      .map(([id, upgrade]) => ({ id, ...upgrade }))
      .sort((a, b) => getUpgradePriority(a, strategy) - getUpgradePriority(b, strategy))
    
    // Purchase highest priority upgrade if player is efficient enough
    if (availableUpgrades.length > 0 && Math.random() < efficiency * 0.8) {
      const upgrade = availableUpgrades[0]
      purchaseUpgrade(upgrade.id)
      return true
    }
    
    return false
  }

  // Get upgrade priority based on strategy
  function getUpgradePriority(upgrade, strategy) {
    let priority = 100 // Default priority
    
    if (strategy === 'storage-focused') {
      if (upgrade.category === 'storage') priority -= 50
      if (upgrade.category === 'water') priority -= 30
    } else if (strategy === 'production-focused') {
      if (upgrade.category === 'hero') priority -= 40
      if (upgrade.category === 'tower') priority -= 30
    } else { // balanced
      if (upgrade.category === 'storage') priority -= 20
      if (upgrade.category === 'hero') priority -= 15
      if (upgrade.category === 'water') priority -= 10
    }
    
    // Factor in cost (cheaper upgrades get higher priority)
    priority += Math.log10(upgrade.cost.gold + 1) * 5
    
    return priority
  }

  // === BOTTLENECK DETECTION ===

  // Analyze current simulation state for bottlenecks
  function detectBottlenecks() {
    const bottlenecks = []
    const energyPercent = (gameState.value.resources.energy.current / gameState.value.resources.energy.cap) * 100
    const wasteRatio = metrics.value.resourceFlows.energyWasted / (metrics.value.resourceFlows.energyGenerated + 1)
    const activePlots = gameState.value.farm.plots.filter(plot => plot.crop).length
    
    // Energy storage bottleneck
    if (wasteRatio > 0.2) {
      bottlenecks.push({
        type: 'energy_storage',
        severity: 'high',
        description: `Energy waste: ${(wasteRatio * 100).toFixed(1)}% of generated energy wasted`,
        suggestion: 'Upgrade energy storage or spend more energy on adventures/mining',
        metric: wasteRatio
      })
    }
    
    // Energy generation bottleneck
    if (energyPercent < 10 && activePlots < gameState.value.farm.plots.length * 0.8) {
      bottlenecks.push({
        type: 'energy_generation',
        severity: 'medium',
        description: `Low energy (${energyPercent.toFixed(1)}%) with unused plots available`,
        suggestion: 'Plant more crops to increase energy generation',
        metric: energyPercent
      })
    }
    
    // Plot expansion bottleneck
    if (activePlots >= gameState.value.farm.plots.length * 0.9 && gameState.value.resources.gold > 1000) {
      bottlenecks.push({
        type: 'plot_expansion',
        severity: 'medium',
        description: 'Farm at capacity but gold available for expansion',
        suggestion: 'Expand farm to add more plots',
        metric: activePlots / gameState.value.farm.plots.length
      })
    }
    
    // Material shortage bottleneck
    const materialCounts = Object.values(gameState.value.resources.materials)
    const lowMaterials = Object.entries(gameState.value.resources.materials)
      .filter(([material, amount]) => amount < 5 && currentDay.value > 7)
    
    if (lowMaterials.length > 2) {
      bottlenecks.push({
        type: 'material_shortage',
        severity: 'low',
        description: `Low on ${lowMaterials.length} material types`,
        suggestion: 'Focus on mining or adventures that provide materials',
        metric: lowMaterials.length
      })
    }
    
    // Helper discovery bottleneck
    if (gameState.value.helpers.length === 0 && activePlots > 15 && currentDay.value > 5) {
      bottlenecks.push({
        type: 'helper_discovery',
        severity: 'high',
        description: 'No helpers found despite having sufficient plots and time',
        suggestion: 'Continue farming - helper discovery is based on active plots and time',
        metric: activePlots
      })
    }
    
    // Phase progression bottleneck
    const expectedPhase = getExpectedPhase(currentDay.value)
    if (getPhaseIndex(gameState.value.currentPhase) < getPhaseIndex(expectedPhase)) {
      bottlenecks.push({
        type: 'phase_progression',
        severity: 'medium',
        description: `Behind expected progression: ${gameState.value.currentPhase} vs expected ${expectedPhase}`,
        suggestion: 'Focus on plot expansion and helper discovery to advance phases',
        metric: getPhaseIndex(expectedPhase) - getPhaseIndex(gameState.value.currentPhase)
      })
    }
    
    return bottlenecks
  }

  // Get expected phase based on day
  function getExpectedPhase(day) {
    if (day <= 1) return 'tutorial'
    if (day <= 5) return 'early'
    if (day <= 12) return 'mid'
    if (day <= 20) return 'late'
    return 'endgame'
  }

  // Get phase index for comparison
  function getPhaseIndex(phase) {
    const phases = ['tutorial', 'early', 'mid', 'late', 'endgame']
    return phases.indexOf(phase)
  }

  // Generate comprehensive simulation report
  function generateSimulationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      gameState: {
        day: currentDay.value,
        phase: gameState.value.currentPhase,
        totalGameTime: metrics.value.gameTimeElapsed,
        activePlots: gameState.value.farm.plots.filter(plot => plot.crop).length,
        helpers: gameState.value.helpers.length,
        upgrades: gameState.value.upgrades.owned.length
      },
      resources: {
        energy: {
          current: gameState.value.resources.energy.current,
          cap: gameState.value.resources.energy.cap,
          generated: metrics.value.resourceFlows.energyGenerated,
          spent: metrics.value.resourceFlows.energySpent,
          wasted: metrics.value.resourceFlows.energyWasted,
          efficiency: (metrics.value.resourceFlows.energySpent / (metrics.value.resourceFlows.energyGenerated + 1)) * 100
        },
        gold: gameState.value.resources.gold,
        materials: { ...gameState.value.resources.materials }
      },
      progression: {
        phaseDurations: { ...metrics.value.phaseDurations },
        upgradeTimings: { ...metrics.value.upgradeTimings },
        helperDiscoveries: gameState.value.helpers.map(h => ({
          name: h.name,
          day: h.discoveredDay,
          abilities: h.abilities
        }))
      },
      bottlenecks: detectBottlenecks(),
      recommendations: generateRecommendations()
    }
    
    return report
  }

  // Generate recommendations based on current state
  function generateRecommendations() {
    const recommendations = []
    const bottlenecks = detectBottlenecks()
    
    // Prioritize high severity bottlenecks
    const highSeverity = bottlenecks.filter(b => b.severity === 'high')
    if (highSeverity.length > 0) {
      recommendations.push(`HIGH PRIORITY: ${highSeverity[0].suggestion}`)
    }
    
    // General recommendations based on phase
    const phase = gameState.value.currentPhase
    if (phase === 'tutorial') {
      recommendations.push('Focus on planting your first 3 plots and learning the basics')
    } else if (phase === 'early') {
      recommendations.push('Expand to 10+ plots and prepare for first helper discovery')
    } else if (phase === 'mid') {
      recommendations.push('Scale to 25+ plots and discover your first helper')
    } else if (phase === 'late') {
      recommendations.push('Optimize with helpers and reach 50+ plots')
    } else {
      recommendations.push('Master the endgame with multiple helpers and 90+ plots')
    }
    
    return recommendations
  }

  // === PLAYER BEHAVIOR SIMULATION ===

  // Check if it's time for a player session
  function checkPlayerSession() {
    const now = new Date()
    const currentHourReal = now.getHours()
    const isWeekend = now.getDay() === 0 || now.getDay() === 6
    
    const schedule = isWeekend ? 
      playerProfile.value.weekendSchedule : 
      playerProfile.value.weekdaySchedule

    // Check if current time matches any scheduled session
    for (const session of schedule) {
      const sessionHour = parseInt(session.time.split(':')[0])
      
      if (Math.abs(currentHourReal - sessionHour) <= 1 && Math.random() < session.probability) {
        return {
          shouldPlay: true,
          duration: session.duration,
          isWeekend: isWeekend
        }
      }
    }
    
    return { shouldPlay: false }
  }

  // Simulate player decision making during a session
  function simulatePlayerSession(sessionInfo) {
    const efficiency = currentEfficiency.value
    const sessionStartTime = metrics.value.gameTimeElapsed
    const sessionEndTime = sessionStartTime + sessionInfo.duration
    
    logEvent('PLAYER', `Player session started (${sessionInfo.duration}min, ${(efficiency * 100).toFixed(0)}% efficiency)`)
    
    // Session actions based on current game state and efficiency
    while (metrics.value.gameTimeElapsed < sessionEndTime && (isRunning.value && !isPaused.value)) {
      const actionsPerformed = performSessionActions(efficiency)
      
      if (!actionsPerformed) {
        // No more useful actions, end session early
        break
      }
      
      // Advance time (simulating player thinking/UI navigation)
      advanceTime(Math.ceil(1 / efficiency)) // Less efficient players take longer
    }
    
    logEvent('PLAYER', `Player session ended`)
  }

  // Perform actions during a player session
  function performSessionActions(efficiency) {
    let actionsPerformed = false
    
    // 1. Harvest ready crops (highest priority)
    gameState.value.farm.plots.forEach(plot => {
      if (plot.crop && plot.growthStage >= 4) {
        if (Math.random() < efficiency) {
          harvestCrop(plot.id)
          actionsPerformed = true
        }
      }
    })
    
    // 2. Plant new crops on empty plots
    const emptyPlots = gameState.value.farm.plots.filter(p => !p.crop)
    if (emptyPlots.length > 0 && Math.random() < efficiency * 0.8) {
      const plot = emptyPlots[0]
      const availableCrops = getAvailableCrops()
      
      if (availableCrops.length > 0) {
        const cropChoice = chooseCropForPhase(availableCrops, efficiency)
        if (cropChoice && plantCrop(plot.id, cropChoice)) {
          actionsPerformed = true
        }
      }
    }
    
    // 3. Go on adventures if energy is available
    if (gameState.value.resources.energy.current > 50 && !gameState.value.heroes.currentAction) {
      if (Math.random() < efficiency * 0.6) {
        const adventure = chooseAdventure(efficiency)
        if (adventure) {
          startAdventure(adventure.id, adventure.duration)
          actionsPerformed = true
        }
      }
    }
    
    // 4. Go mining if energy is high and no better options
    if (gameState.value.resources.energy.current > 100 && !gameState.value.heroes.currentAction) {
      if (Math.random() < efficiency * 0.4) {
        const miningDepth = Math.min(5, Math.floor(currentDay.value / 3) + 1) // Deeper over time
        if (startMining(miningDepth)) {
          actionsPerformed = true
        }
      }
    }
    
    // 5. Consider upgrade purchases
    if (Math.random() < efficiency * 0.3) {
      if (considerUpgradePurchases(efficiency)) {
        actionsPerformed = true
      }
    }
    
    return actionsPerformed
  }

  // Get crops available for current phase
  function getAvailableCrops() {
    const gameValues = useGameValuesStore()
    const currentPhase = gameState.value.currentPhase
    
    return Object.values(gameValues.crops).filter(crop => {
      // Simple tier mapping to phases
      if (currentPhase === 'tutorial' || currentPhase === 'early') return crop.tier === 'early'
      if (currentPhase === 'mid') return crop.tier === 'early' || crop.tier === 'mid' 
      if (currentPhase === 'late') return crop.tier !== 'endgame'
      return true // endgame phase - all crops available
    })
  }

  // Choose optimal crop for current phase and efficiency
  function chooseCropForPhase(availableCrops, efficiency) {
    if (availableCrops.length === 0) return null
    
    // Higher efficiency players choose better crops
    if (Math.random() < efficiency) {
      // Choose best energy/time ratio crop
      const sortedCrops = availableCrops.sort((a, b) => b.energyPerMinute - a.energyPerMinute)
      return sortedCrops[0].id
    } else {
      // Random choice for lower efficiency
      return availableCrops[Math.floor(Math.random() * availableCrops.length)].id
    }
  }

  // Choose adventure based on efficiency and available energy
  function chooseAdventure(efficiency) {
    const gameValues = useGameValuesStore()
    const availableAdventures = Object.values(gameValues.adventures).filter(adv => 
      currentDay.value >= adv.unlockDay
    )
    
    if (availableAdventures.length === 0) return null
    
    const currentEnergy = gameState.value.resources.energy.current
    const preference = playerProfile.value.adventurePreference
    
    // Choose adventure and duration based on preference and efficiency
    for (const adventure of availableAdventures.reverse()) { // Try highest level first
      let duration = 'short'
      
      if (preference === 'medium' && currentEnergy >= adventure.mediumEnergy) {
        duration = 'medium'
      } else if (preference === 'long' && currentEnergy >= adventure.longEnergy) {
        duration = 'long'
      } else if (currentEnergy < adventure.shortEnergy) {
        continue // Can't afford this adventure
      }
      
      // Higher efficiency players more likely to choose optimal adventures
      if (Math.random() < efficiency) {
        return { id: adventure.id, duration }
      }
    }
    
    return null
  }

  // Process ongoing actions
  function processOngoingActions() {
    const action = gameState.value.heroes.currentAction
    if (!action) return
    
    // Reduce time remaining
    action.timeRemaining--
    
    if (action.timeRemaining <= 0) {
      if (action.type === 'adventure') {
        completeAdventure()
      } else if (action.type === 'mining') {
        completeMining()
      }
      // Add other action types here
    }
  }

  // Simulation loop management
  let tickInterval = null

  function startSimulationLoop() {
    if (tickInterval) return

    const getTickDelay = () => {
      switch (simulationSpeed.value) {
        case 1: return 1000 // 1 second = 1 minute
        case 10: return 100 // 0.1 second = 1 minute  
        case 100: return 10 // 0.01 second = 1 minute
        case 'max': return 1 // As fast as possible
        default: return 1000
      }
    }

    const tick = () => {
      gameTick()
      if (isRunning.value && !isPaused.value) {
        tickInterval = setTimeout(tick, getTickDelay())
      }
    }

    tick()
  }

  function stopSimulationLoop() {
    if (tickInterval) {
      clearTimeout(tickInterval)
      tickInterval = null
    }
  }
  
  return {
    // State
    isRunning,
    isPaused,
    simulationSpeed,
    currentDay,
    currentHour,
    currentMinute,
    gameState,
    playerProfile,
    simulationSettings,
    eventLog,
    metrics,
    
    // Computed
    gameTime,
    currentEfficiency,
    energyPercentage,
    isPlayerActive,
    
    // Actions
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulation,
    updatePlayerProfile,
    updateSimulationSettings,
    logEvent,
    advanceTime,
    
    // Game Systems
    gameTick,
    processFarmGrowth,
    processEnergyGeneration,
    processResourceCaps,
    checkPhaseProgression,
    addResource,
    spendResource,
    plantCrop,
    harvestCrop,
    
    // Adventure System
    startAdventure,
    completeAdventure,
    
    // Mining System
    startMining,
    completeMining,
    
    // Helper Discovery System
    checkHelperDiscovery,
    discoverHelper,
    processHelperAutomation,
    
    // Upgrade System
    isUpgradeAvailable,
    canAffordUpgrade,
    purchaseUpgrade,
    applyUpgradeEffect,
    considerUpgradePurchases,
    
    // Bottleneck Detection
    detectBottlenecks,
    generateSimulationReport,
    generateRecommendations,
    
    // Player Behavior
    checkPlayerSession,
    simulatePlayerSession,
    performSessionActions,
    processOngoingActions
  }
})
