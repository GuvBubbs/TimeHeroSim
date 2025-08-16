/**
 * Simulation Worker Manager
 * 
 * This class manages communication with the simulation web worker and provides
 * a clean interface for the main thread to control the simulation.
 */

export class SimulationWorkerManager {
  constructor() {
    this.worker = null
    this.isInitialized = false
    this.messageHandlers = new Map()
    this.pendingMessages = []
    this.lastStateUpdate = null
    this.performanceMetrics = {
      ticksPerSecond: 0,
      totalTicks: 0,
      lastUpdateTime: 0
    }
  }

  /**
   * Initialize the worker
   */
  async initialize() {
    if (this.isInitialized) return

    return new Promise((resolve, reject) => {
      try {
        // Create worker
        this.worker = new Worker(
          new URL('../workers/simulator.worker.js', import.meta.url),
          { type: 'module' }
        )

        // Set up message handling
        this.worker.addEventListener('message', this.handleWorkerMessage.bind(this))
        this.worker.addEventListener('error', (error) => {
          console.error('Worker error:', error)
          reject(error)
        })

        // Wait for worker ready signal
        this.onMessage('WORKER_READY', () => {
          this.isInitialized = true
          resolve()
        })

        // Set timeout for initialization
        setTimeout(() => {
          if (!this.isInitialized) {
            reject(new Error('Worker initialization timeout'))
          }
        }, 5000)

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Handle messages from worker
   */
  handleWorkerMessage(event) {
    const { type, payload } = event.data

    // Update performance metrics
    if (payload?.performance) {
      this.performanceMetrics = {
        ...this.performanceMetrics,
        ...payload.performance,
        lastUpdateTime: Date.now()
      }
    }

    // Store latest state update
    if (type === 'STATE_UPDATE' && payload?.gameState) {
      this.lastStateUpdate = {
        ...payload.gameState,
        timestamp: Date.now()
      }
    }

    // Call registered handlers
    const handlers = this.messageHandlers.get(type) || []
    handlers.forEach(handler => {
      try {
        handler(payload)
      } catch (error) {
        console.error(`Error in message handler for ${type}:`, error)
      }
    })

    // Also call general message handlers
    const generalHandlers = this.messageHandlers.get('*') || []
    generalHandlers.forEach(handler => {
      try {
        handler(type, payload)
      } catch (error) {
        console.error('Error in general message handler:', error)
      }
    })
  }

  /**
   * Register a message handler
   */
  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type).push(handler)

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }
  }

  /**
   * Send message to worker
   */
  sendMessage(type, payload = {}) {
    if (!this.worker || !this.isInitialized) {
      console.warn('Worker not initialized, queuing message:', type)
      this.pendingMessages.push({ type, payload })
      return
    }

    this.worker.postMessage({ type, payload })
  }

  /**
   * Process any pending messages
   */
  processPendingMessages() {
    if (this.pendingMessages.length > 0) {
      this.pendingMessages.forEach(({ type, payload }) => {
        this.sendMessage(type, payload)
      })
      this.pendingMessages = []
    }
  }

  /**
   * Initialize simulation with game data
   */
  async initializeSimulation(gameValues, gameState = null) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Simulation initialization timeout'))
      }, 10000)

      this.onMessage('INIT_COMPLETE', (payload) => {
        clearTimeout(timeout)
        if (payload.success) {
          this.processPendingMessages()
          resolve()
        } else {
          reject(new Error('Simulation initialization failed'))
        }
      })

      this.sendMessage('INIT', { gameValues, gameState })
    })
  }

  /**
   * Start simulation
   */
  startSimulation(speed = 1) {
    this.sendMessage('START', { speed })
  }

  /**
   * Pause simulation
   */
  pauseSimulation() {
    this.sendMessage('PAUSE')
  }

  /**
   * Resume simulation
   */
  resumeSimulation(speed = 1) {
    this.sendMessage('RESUME', { speed })
  }

  /**
   * Reset simulation
   */
  resetSimulation(gameValues) {
    this.lastStateUpdate = null
    this.performanceMetrics = {
      ticksPerSecond: 0,
      totalTicks: 0,
      lastUpdateTime: 0
    }
    this.sendMessage('RESET', { gameValues })
  }

  /**
   * Change simulation speed
   */
  setSimulationSpeed(speed) {
    this.sendMessage('SET_SPEED', { speed })
  }

  /**
   * Get current state snapshot
   */
  async getCurrentState() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('State snapshot timeout'))
      }, 5000)

      this.onMessage('STATE_SNAPSHOT', (payload) => {
        clearTimeout(timeout)
        resolve(payload)
      })

      this.sendMessage('GET_STATE')
    })
  }

  /**
   * Update player profile
   */
  updatePlayerProfile(playerProfile) {
    this.sendMessage('UPDATE_PROFILE', { playerProfile })
  }

  /**
   * Get latest state update (non-blocking)
   */
  getLatestState() {
    return this.lastStateUpdate
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics }
  }

  /**
   * Check if worker is running
   */
  isRunning() {
    return this.isInitialized && this.worker !== null
  }

  /**
   * Destroy worker
   */
  destroy() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.isInitialized = false
    this.messageHandlers.clear()
    this.pendingMessages = []
    this.lastStateUpdate = null
  }

  /**
   * Subscribe to state updates
   */
  subscribeToStateUpdates(callback) {
    return this.onMessage('STATE_UPDATE', callback)
  }

  /**
   * Subscribe to major events
   */
  subscribeToMajorEvents(callback) {
    return this.onMessage('MAJOR_EVENT', callback)
  }

  /**
   * Subscribe to errors
   */
  subscribeToErrors(callback) {
    return this.onMessage('ERROR', callback)
  }

  /**
   * Subscribe to simulation lifecycle events
   */
  subscribeToLifecycle(callback) {
    const unsubscribers = [
      this.onMessage('SIMULATION_STARTED', (payload) => callback('started', payload)),
      this.onMessage('SIMULATION_PAUSED', (payload) => callback('paused', payload)),
      this.onMessage('SIMULATION_RESUMED', (payload) => callback('resumed', payload)),
      this.onMessage('SIMULATION_RESET', (payload) => callback('reset', payload)),
      this.onMessage('SPEED_CHANGED', (payload) => callback('speed_changed', payload))
    ]

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }
}
