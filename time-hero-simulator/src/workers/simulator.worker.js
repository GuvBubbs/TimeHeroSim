/**
 * Time Hero Simulator Web Worker
 * 
 * This worker runs the simulation engine in a background thread to prevent
 * UI blocking during intensive simulations. It maintains its own copy of
 * the game state and communicates with the main thread via messages.
 */

// Import simulation logic (we'll need to extract the core engine)
// Note: These imports need to be relative to the worker file location
// For now, we'll implement a basic simulation engine directly in the worker

// Worker state
let gameState = null
let gameValues = null
let isRunning = false
let simulationSpeed = 1
let workerTick = 0
let lastReportTime = 0

// Basic simulation engine implementation (simplified for Phase 8)
function initializeGameState(gameValues) {
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

function simulateGameTick(gameState, gameValues) {
  try {
    const result = {
      error: null,
      phaseChanged: false,
      majorEvent: null,
      events: []
    }

    // Advance time
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

    // Simple simulation logic for Phase 8 testing
    // TODO: Implement full simulation logic
    
    // Update resource history every hour
    if (gameState.currentTick % 60 === 0) {
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

// Message handlers
const messageHandlers = {
  // Initialize worker with game data
  INIT: ({ gameValues: values, gameState: state }) => {
    gameValues = values
    gameState = state ? JSON.parse(JSON.stringify(state)) : initializeGameState(values)
    postMessage({
      type: 'INIT_COMPLETE',
      payload: { success: true }
    })
  },

  // Start simulation
  START: ({ speed = 1 }) => {
    isRunning = true
    simulationSpeed = speed
    runSimulation()
    postMessage({
      type: 'SIMULATION_STARTED',
      payload: { speed }
    })
  },

  // Pause simulation
  PAUSE: () => {
    isRunning = false
    postMessage({
      type: 'SIMULATION_PAUSED',
      payload: { tick: workerTick }
    })
  },

  // Resume simulation
  RESUME: ({ speed = simulationSpeed }) => {
    simulationSpeed = speed
    isRunning = true
    runSimulation()
    postMessage({
      type: 'SIMULATION_RESUMED',
      payload: { speed, tick: workerTick }
    })
  },

  // Reset simulation
  RESET: ({ gameValues: values }) => {
    isRunning = false
    gameValues = values
    gameState = initializeGameState(values)
    workerTick = 0
    lastReportTime = 0
    postMessage({
      type: 'SIMULATION_RESET',
      payload: { gameState }
    })
  },

  // Change simulation speed
  SET_SPEED: ({ speed }) => {
    simulationSpeed = speed
    postMessage({
      type: 'SPEED_CHANGED',
      payload: { speed }
    })
  },

  // Get current state snapshot
  GET_STATE: () => {
    postMessage({
      type: 'STATE_SNAPSHOT',
      payload: { 
        gameState: JSON.parse(JSON.stringify(gameState)),
        tick: workerTick,
        isRunning
      }
    })
  },

  // Update player profile
  UPDATE_PROFILE: ({ playerProfile }) => {
    if (gameState) {
      gameState.playerProfile = playerProfile
      postMessage({
        type: 'PROFILE_UPDATED',
        payload: { success: true }
      })
    }
  }
}

// Main simulation loop
async function runSimulation() {
  if (!isRunning || !gameState || !gameValues) return

  const startTime = performance.now()
  let ticksThisFrame = 0
  const maxTicksPerFrame = simulationSpeed === 'max' ? 1000 : Math.min(simulationSpeed * 10, 100)

  while (isRunning && ticksThisFrame < maxTicksPerFrame) {
    // Run simulation tick
    const tickResult = simulateGameTick(gameState, gameValues)
    
    if (tickResult.error) {
      postMessage({
        type: 'SIMULATION_ERROR',
        payload: { error: tickResult.error, tick: workerTick }
      })
      isRunning = false
      return
    }

    workerTick++
    ticksThisFrame++

    // Check for phase transitions or important events
    if (tickResult.phaseChanged || tickResult.majorEvent) {
      postMessage({
        type: 'MAJOR_EVENT',
        payload: {
          type: tickResult.phaseChanged ? 'PHASE_CHANGE' : 'MAJOR_EVENT',
          data: tickResult,
          gameState: createStateDiff(gameState),
          tick: workerTick
        }
      })
    }

    // Regular state updates (every 100 ticks or every second, whichever is less frequent)
    const now = performance.now()
    if (workerTick % 100 === 0 || now - lastReportTime > 1000) {
      postMessage({
        type: 'STATE_UPDATE',
        payload: {
          gameState: createStateDiff(gameState),
          tick: workerTick,
          performance: {
            ticksPerSecond: ticksThisFrame / ((now - startTime + 1) / 1000),
            totalTicks: workerTick
          }
        }
      })
      lastReportTime = now
    }

    // Break if we've been running too long this frame
    if (performance.now() - startTime > 16) { // ~60fps
      break
    }
  }

  // Schedule next frame
  if (isRunning) {
    setTimeout(runSimulation, simulationSpeed === 'max' ? 0 : Math.max(1, 100 / simulationSpeed))
  }
}

// Create optimized state diff for UI updates
function createStateDiff(fullState) {
  // For now, send key parts of state that UI needs
  // TODO: Implement proper diffing to reduce message size
  return {
    time: fullState.time,
    resources: fullState.resources,
    farm: {
      plots: fullState.farm.plots,
      waterTank: fullState.farm.waterTank
    },
    heroes: {
      currentLocation: fullState.heroes.currentLocation,
      currentAction: fullState.heroes.currentAction
    },
    helpers: fullState.helpers.map(h => ({
      id: h.id,
      type: h.type,
      isWorking: h.isWorking || false,
      efficiency: h.efficiency || 1.0
    })),
    currentPhase: fullState.currentPhase,
    currentTick: workerTick,
    day: fullState.day
  }
}

// Message listener
self.addEventListener('message', (event) => {
  const { type, payload } = event.data
  
  if (messageHandlers[type]) {
    try {
      messageHandlers[type](payload || {})
    } catch (error) {
      postMessage({
        type: 'ERROR',
        payload: {
          error: error.message,
          stack: error.stack,
          originalMessage: type
        }
      })
    }
  } else {
    postMessage({
      type: 'ERROR',
      payload: {
        error: `Unknown message type: ${type}`,
        originalMessage: type
      }
    })
  }
})

// Worker ready signal
postMessage({
  type: 'WORKER_READY',
  payload: { timestamp: Date.now() }
})
