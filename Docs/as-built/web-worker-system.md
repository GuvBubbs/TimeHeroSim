# Web Worker System - As Built Documentation

## System Overview

The Web Worker System provides high-performance background processing capabilities for the Time Hero Simulator. It enables the application to run complex simulations, statistical analyses, and Monte Carlo experiments without blocking the user interface. This system manages worker lifecycle, message passing, data serialization, and parallel execution coordination across multiple worker threads.

In simple terms: Think of this as having multiple "background assistants" that can run simulations while you continue using the app. Instead of the app freezing up when running a 1000-simulation Monte Carlo analysis, these workers do the heavy lifting in the background while the user interface stays smooth and responsive. It's like having a team of calculators working behind the scenes.

## System Connections

### Inputs
- **Simulation Requests**: Commands to start/stop/configure simulations
- **Game State Data**: Current game state for simulation initialization
- **Configuration Parameters**: Player profiles, simulation settings, analysis parameters
- **Analysis Requests**: Monte Carlo runs, A/B tests, bottleneck analyses
- **Control Commands**: Pause, resume, terminate, speed adjustments

### Outputs
- **Simulation Results**: Complete simulation outcomes and game state progression
- **Progress Updates**: Real-time progress reporting during long-running operations
- **Performance Metrics**: Execution timing, memory usage, and throughput statistics
- **Error Notifications**: Worker errors, crashes, and recovery status
- **Analysis Data**: Statistical results, confidence intervals, comparative analyses

## Technical Implementation

### Architecture Overview

The Web Worker System uses a manager-worker pattern with sophisticated message passing and state synchronization:

#### Core Components

1. **WorkerManager Class** - Central coordinator for all worker operations
2. **Simulation Workers** - Individual worker threads running game simulations  
3. **Message Protocol** - Standardized communication format between threads
4. **State Synchronization** - Ensures workers have current game data
5. **Resource Pool** - Manages worker allocation and cleanup

### Worker Manager Implementation

#### Core Manager Structure
```javascript
class SimulationWorkerManager {
  constructor() {
    this.workers = new Map() // Active worker instances
    this.messageQueue = [] // Pending messages
    this.activeJobs = new Map() // Running simulation jobs
    this.maxWorkers = Math.min(navigator.hardwareConcurrency || 4, 8)
    this.messageId = 0
    this.callbacks = new Map() // Response callbacks
  }
  
  async initializeWorker() {
    try {
      const worker = new Worker('/src/workers/simulationWorker.js', { type: 'module' })
      const workerId = this.generateWorkerId()
      
      // Set up message handling
      worker.onmessage = (event) => this.handleWorkerMessage(workerId, event)
      worker.onerror = (error) => this.handleWorkerError(workerId, error)
      
      this.workers.set(workerId, {
        instance: worker,
        status: 'initializing',
        currentJob: null,
        lastActivity: Date.now()
      })
      
      // Initialize worker with current game data
      await this.syncWorkerState(workerId)
      
      return workerId
    } catch (error) {
      console.error('Failed to initialize worker:', error)
      throw error
    }
  }
}
```

#### Message Protocol Implementation
```javascript
// Standardized message format
const MESSAGE_TYPES = {
  // Control messages
  INITIALIZE: 'initialize',
  STATE_UPDATE: 'state_update',
  START_SIMULATION: 'start_simulation',
  STOP_SIMULATION: 'stop_simulation',
  PAUSE_SIMULATION: 'pause_simulation',
  
  // Response messages
  SIMULATION_RESULT: 'simulation_result',
  PROGRESS_UPDATE: 'progress_update',
  ERROR: 'error',
  WORKER_READY: 'worker_ready'
}

function createMessage(type, payload, options = {}) {
  return {
    id: generateMessageId(),
    type,
    payload,
    timestamp: Date.now(),
    workerId: options.workerId,
    priority: options.priority || 'normal'
  }
}
```

#### State Synchronization System
```javascript
async function syncWorkerState(workerId) {
  const gameValues = useGameValuesStore()
  const simulation = useSimulationStore()
  
  const syncMessage = createMessage(MESSAGE_TYPES.STATE_UPDATE, {
    gameValues: gameValues.allGameValues,
    gameState: simulation.gameState,
    playerProfile: simulation.playerProfile,
    simulationSettings: simulation.simulationSettings
  })
  
  return this.postMessage(workerId, syncMessage)
}
```

### Worker Thread Implementation

#### Worker Initialization and Setup
```javascript
// /src/workers/simulationWorker.js
import { simulateGameTick, initializeGameState } from '../utils/simulationEngine.js'

class SimulationWorker {
  constructor() {
    this.gameValues = null
    this.currentSimulation = null
    this.isRunning = false
    this.isPaused = false
    
    // Set up message handling
    self.onmessage = (event) => this.handleMessage(event)
  }
  
  handleMessage(event) {
    const { type, payload, id } = event.data
    
    switch (type) {
      case 'initialize':
        this.initialize(payload)
        this.respond(id, { type: 'worker_ready' })
        break
        
      case 'state_update':
        this.updateState(payload)
        break
        
      case 'start_simulation':
        this.startSimulation(payload)
        break
        
      case 'stop_simulation':
        this.stopSimulation()
        break
        
      default:
        this.respondError(id, `Unknown message type: ${type}`)
    }
  }
}

// Initialize worker instance
const worker = new SimulationWorker()
```

#### Simulation Execution Loop
```javascript
async function runSimulation(config) {
  const gameState = initializeGameState(this.gameValues)
  const maxTicks = config.maxDays * 24 * 60 // Convert days to minutes
  let currentTick = 0
  
  this.isRunning = true
  
  try {
    while (this.isRunning && currentTick < maxTicks) {
      // Check for pause
      while (this.isPaused && this.isRunning) {
        await this.sleep(100)
      }
      
      if (!this.isRunning) break
      
      // Run simulation tick
      const tickResult = simulateGameTick(gameState, this.gameValues)
      
      // Apply results
      Object.assign(gameState, tickResult.gameState)
      
      // Report progress periodically
      if (currentTick % 100 === 0) {
        this.reportProgress({
          currentTick,
          maxTicks,
          gameState: this.cloneState(gameState),
          events: tickResult.events
        })
      }
      
      currentTick++
      
      // Yield control occasionally for responsiveness
      if (currentTick % 1000 === 0) {
        await this.sleep(1)
      }
    }
    
    // Send final results
    this.reportComplete({
      finalState: gameState,
      totalTicks: currentTick,
      success: currentTick >= maxTicks,
      performance: this.getPerformanceMetrics()
    })
    
  } catch (error) {
    this.reportError(error)
  } finally {
    this.isRunning = false
  }
}
```

### Parallel Processing Coordination

#### Monte Carlo Manager Integration
```javascript
class MonteCarloManager {
  constructor() {
    this.workerPool = []
    this.runningSimulations = new Map()
    this.results = []
  }
  
  async runMonteCarlo(config) {
    const { runs, maxWorkers } = config
    const runsPerWorker = Math.ceil(runs / maxWorkers)
    
    // Initialize worker pool
    for (let i = 0; i < maxWorkers; i++) {
      const workerId = await this.workerManager.initializeWorker()
      this.workerPool.push(workerId)
    }
    
    // Distribute work across workers
    const promises = this.workerPool.map(async (workerId, index) => {
      const startRun = index * runsPerWorker
      const endRun = Math.min(startRun + runsPerWorker, runs)
      
      return this.runWorkerBatch(workerId, {
        startRun,
        endRun,
        config: config.simulation
      })
    })
    
    // Wait for all workers to complete
    const results = await Promise.all(promises)
    
    // Aggregate results
    return this.aggregateResults(results)
  }
}
```

#### A/B Testing Coordination
```javascript
async function runABTest(configA, configB) {
  // Run test A and B in parallel
  const [resultsA, resultsB] = await Promise.all([
    this.runMonteCarlo({ ...configA, name: 'Test A' }),
    this.runMonteCarlo({ ...configB, name: 'Test B' })
  ])
  
  // Statistical comparison
  const comparison = {
    testA: resultsA,
    testB: resultsB,
    statisticalSignificance: calculateSignificance(resultsA, resultsB),
    effect Size: calculateEffectSize(resultsA, resultsB),
    confidence: calculateConfidenceInterval(resultsA, resultsB)
  }
  
  return comparison
}
```

### Performance Optimization

#### Message Batching and Throttling
```javascript
class MessageBatcher {
  constructor(flushInterval = 100) {
    this.batchedMessages = []
    this.flushInterval = flushInterval
    this.flushTimer = null
  }
  
  addMessage(message) {
    this.batchedMessages.push(message)
    
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flush()
      }, this.flushInterval)
    }
  }
  
  flush() {
    if (this.batchedMessages.length > 0) {
      self.postMessage({
        type: 'batch',
        messages: this.batchedMessages
      })
      this.batchedMessages = []
    }
    this.flushTimer = null
  }
}
```

#### Memory Management
```javascript
function optimizeWorkerMemory() {
  // Regular cleanup of completed simulations
  const cleanupInterval = setInterval(() => {
    for (const [jobId, job] of this.activeJobs) {
      if (job.completed && Date.now() - job.completedAt > 300000) { // 5 minutes
        this.activeJobs.delete(jobId)
      }
    }
  }, 60000) // Cleanup every minute
  
  // Monitor memory usage
  const memoryCheck = setInterval(() => {
    if (performance.memory && performance.memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
      this.requestGarbageCollection()
    }
  }, 30000) // Check every 30 seconds
}
```

### Error Handling and Recovery

#### Worker Error Recovery
```javascript
function handleWorkerError(workerId, error) {
  console.error(`Worker ${workerId} error:`, error)
  
  const worker = this.workers.get(workerId)
  if (!worker) return
  
  // Mark worker as failed
  worker.status = 'error'
  worker.lastError = error
  
  // Attempt recovery
  if (worker.retryCount < 3) {
    worker.retryCount = (worker.retryCount || 0) + 1
    this.restartWorker(workerId)
  } else {
    // Give up on this worker
    this.terminateWorker(workerId)
    
    // Redistribute work to other workers
    if (worker.currentJob) {
      this.redistributeJob(worker.currentJob)
    }
  }
}
```

#### Graceful Degradation
```javascript
function handleWorkerUnavailable() {
  // Fall back to main thread processing
  console.warn('Workers unavailable, falling back to main thread')
  
  return {
    runSimulation: (config) => this.runMainThreadSimulation(config),
    runMonteCarlo: (config) => this.runSequentialMonteCarlo(config),
    supportsParallel: false
  }
}
```

### Resource Pool Management

#### Dynamic Worker Scaling
```javascript
function scaleWorkerPool(targetSize) {
  const currentSize = this.workers.size
  
  if (targetSize > currentSize) {
    // Scale up
    const newWorkers = targetSize - currentSize
    for (let i = 0; i < newWorkers; i++) {
      this.initializeWorker()
    }
  } else if (targetSize < currentSize) {
    // Scale down
    const excessWorkers = currentSize - targetSize
    const sortedWorkers = Array.from(this.workers.entries())
      .sort((a, b) => a[1].lastActivity - b[1].lastActivity)
    
    for (let i = 0; i < excessWorkers; i++) {
      const [workerId] = sortedWorkers[i]
      if (!this.workers.get(workerId).currentJob) {
        this.terminateWorker(workerId)
      }
    }
  }
}
```

#### Worker Health Monitoring
```javascript
function monitorWorkerHealth() {
  setInterval(() => {
    for (const [workerId, worker] of this.workers) {
      // Check for hung workers
      const timeSinceActivity = Date.now() - worker.lastActivity
      if (timeSinceActivity > 30000 && worker.currentJob) { // 30 seconds
        console.warn(`Worker ${workerId} appears hung, restarting`)
        this.restartWorker(workerId)
      }
      
      // Ping inactive workers
      if (timeSinceActivity > 60000 && !worker.currentJob) { // 1 minute
        this.pingWorker(workerId)
      }
    }
  }, 10000) // Check every 10 seconds
}
```

### Testing and Quality Assurance

#### Worker Testing Framework
```javascript
async function testWorkerFunctionality() {
  const tests = [
    {
      name: 'Basic Simulation',
      test: () => this.runSimulation({ maxDays: 1, playerProfile: 'casual' })
    },
    {
      name: 'Monte Carlo Analysis', 
      test: () => this.runMonteCarlo({ runs: 10, maxDays: 7 })
    },
    {
      name: 'Worker Recovery',
      test: () => this.testWorkerRecovery()
    }
  ]
  
  const results = []
  for (const test of tests) {
    try {
      const startTime = performance.now()
      const result = await test.test()
      const duration = performance.now() - startTime
      
      results.push({
        name: test.name,
        success: true,
        duration,
        result
      })
    } catch (error) {
      results.push({
        name: test.name,
        success: false,
        error: error.message
      })
    }
  }
  
  return results
}
```

### Integration with UI Components

#### Progress Reporting Integration
```javascript
// In Vue components
const progress = ref({ completed: 0, total: 100, percentage: 0 })

workerManager.setProgressCallback((progressData) => {
  progress.value = progressData
  
  // Update UI reactively
  nextTick(() => {
    updateProgressBar(progressData.percentage)
  })
})
```

#### Real-time Results Display
```javascript
// Stream results as they complete
workerManager.setResultCallback((result) => {
  // Add to results store
  results.addSimulationResult(result)
  
  // Update charts
  updateCharts(result)
  
  // Show notifications for significant findings
  if (result.significance > 0.95) {
    showNotification('Significant result found!', result)
  }
})
```

## Code References

### Core Implementation Files
- `/src/utils/workerManager.js` - Main worker coordination and management
- `/src/workers/simulationWorker.js` - Individual worker thread implementation
- `/src/utils/monteCarloManager.js` - Monte Carlo analysis coordination
- `/src/utils/abTestManager.js` - A/B testing coordination

### Integration Points
- `/src/stores/simulation.js` - Worker integration with state management
- `/src/components/MonteCarloPanel.vue` - UI for Monte Carlo worker coordination
- `/src/components/ABTestingPanel.vue` - UI for A/B testing worker coordination
- `/src/components/BottleneckAnalyzer.vue` - Bottleneck analysis using workers

### Supporting Infrastructure
- `/src/utils/messageProtocol.js` - Standardized message formats
- `/src/utils/workerPool.js` - Worker resource management
- `/src/utils/performanceMonitor.js` - Worker performance tracking

### Configuration and Setup
- `/vite.config.js` - Build configuration for worker support
- `/src/main.js` - Worker manager initialization
- `/package.json` - Dependencies for worker functionality

## Future Considerations

### Advanced Features
- **SharedArrayBuffer Support**: Enable zero-copy data sharing between workers
- **GPU Acceleration**: Leverage GPU compute shaders for massive parallel simulation
- **Distributed Computing**: Extend workers across multiple machines/cloud instances

### Performance Enhancements
- **WebAssembly Integration**: Move critical simulation loops to WASM
- **Streaming Results**: Real-time streaming of results instead of batch transfers
- **Adaptive Scheduling**: Dynamic work distribution based on worker performance

### Reliability Improvements
- **Checkpoint/Resume**: Save and restore simulation state for long-running operations
- **Redundancy**: Run critical simulations on multiple workers for validation
- **Load Balancing**: Intelligent work distribution based on worker capabilities
