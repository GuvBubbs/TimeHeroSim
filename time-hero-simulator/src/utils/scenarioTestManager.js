// Scenario Testing System
// Automated regression testing for game balance scenarios

export class ScenarioTestManager {
  constructor() {
    this.testSuites = new Map()
    this.testResults = []
    this.isRunning = false
    this.currentTest = null
    
    // Initialize default test scenarios
    this.initializeDefaultScenarios()
  }

  initializeDefaultScenarios() {
    // Player archetype scenarios
    this.addTestSuite('player-archetypes', {
      name: 'Player Archetype Validation',
      description: 'Test game progression for different player types',
      tests: [
        {
          id: 'speedrunner',
          name: 'Speedrunner Progression',
          description: 'Optimal play, minimal idle time, perfect efficiency',
          config: {
            playerBehavior: {
              efficiency: 0.95,
              idleTime: 0.05,
              actionOptimization: 0.9,
              upgradeDelay: 0.1
            },
            expectations: {
              maxDays: 25,
              minHelpers: 3,
              minUpgrades: 15,
              phaseTiming: {
                tutorial: { max: 1 },
                early: { max: 5 },
                mid: { max: 15 },
                late: { max: 25 }
              }
            }
          }
        },
        {
          id: 'casual-player',
          name: 'Casual Player Progression',
          description: 'Moderate efficiency, some idle time',
          config: {
            playerBehavior: {
              efficiency: 0.7,
              idleTime: 0.2,
              actionOptimization: 0.6,
              upgradeDelay: 0.3
            },
            expectations: {
              maxDays: 35,
              minHelpers: 2,
              minUpgrades: 10,
              phaseTiming: {
                tutorial: { max: 3 },
                early: { max: 8 },
                mid: { max: 20 },
                late: { max: 35 }
              }
            }
          }
        },
        {
          id: 'weekend-warrior',
          name: 'Weekend Warrior Progression',
          description: 'Intermittent play, higher idle periods',
          config: {
            playerBehavior: {
              efficiency: 0.6,
              idleTime: 0.4,
              actionOptimization: 0.5,
              upgradeDelay: 0.5
            },
            expectations: {
              maxDays: 50,
              minHelpers: 1,
              minUpgrades: 8,
              phaseTiming: {
                tutorial: { max: 5 },
                early: { max: 12 },
                mid: { max: 30 },
                late: { max: 50 }
              }
            }
          }
        }
      ]
    })

    // Balance validation scenarios
    this.addTestSuite('balance-validation', {
      name: 'Game Balance Validation',
      description: 'Validate core game balance metrics',
      tests: [
        {
          id: 'energy-balance',
          name: 'Energy System Balance',
          description: 'Ensure energy generation supports progression',
          config: {
            focus: 'energy',
            validations: [
              {
                metric: 'energy_shortage_time',
                operator: 'less_than',
                value: 0.15, // Less than 15% of time in energy shortage
                description: 'Energy shortages should not dominate gameplay'
              },
              {
                metric: 'energy_cap_utilization',
                operator: 'greater_than',
                value: 0.6, // At least 60% energy cap utilization
                description: 'Energy capacity should be meaningful'
              }
            ]
          }
        },
        {
          id: 'progression-pacing',
          name: 'Progression Pacing',
          description: 'Validate phase transition timing',
          config: {
            focus: 'progression',
            validations: [
              {
                metric: 'phase_variance',
                operator: 'less_than',
                value: 0.5, // Phase timing variance less than 50%
                description: 'Phase progression should be consistent'
              },
              {
                metric: 'upgrade_gaps',
                operator: 'less_than',
                value: 5, // No more than 5 days between upgrades
                description: 'Regular upgrade progression'
              }
            ]
          }
        },
        {
          id: 'helper-automation',
          name: 'Helper Automation Balance',
          description: 'Validate helper discovery and efficiency',
          config: {
            focus: 'helpers',
            validations: [
              {
                metric: 'helper_discovery_timing',
                operator: 'within_range',
                value: [5, 15], // Helpers discovered between days 5-15
                description: 'Helpers should be discovered in mid-game'
              },
              {
                metric: 'automation_efficiency',
                operator: 'greater_than',
                value: 0.7, // At least 70% automation efficiency
                description: 'Helpers should be worthwhile'
              }
            ]
          }
        }
      ]
    })

    // Regression scenarios
    this.addTestSuite('regression-tests', {
      name: 'Regression Testing',
      description: 'Detect changes that break existing balance',
      tests: [
        {
          id: 'baseline-speedrun',
          name: 'Baseline Speedrun Regression',
          description: 'Ensure optimal play still completes in expected time',
          config: {
            baseline: true,
            playerBehavior: {
              efficiency: 1.0,
              idleTime: 0.0,
              actionOptimization: 1.0,
              upgradeDelay: 0.0
            },
            tolerances: {
              completion_time: 0.1, // 10% variance allowed
              resource_efficiency: 0.05, // 5% variance allowed
              phase_timing: 0.15 // 15% variance allowed
            }
          }
        }
      ]
    })
  }

  addTestSuite(id, suite) {
    this.testSuites.set(id, {
      id,
      ...suite,
      created: Date.now(),
      lastRun: null,
      results: []
    })
  }

  async runTestSuite(suiteId, options = {}) {
    const suite = this.testSuites.get(suiteId)
    if (!suite) {
      throw new Error(`Test suite ${suiteId} not found`)
    }

    if (this.isRunning) {
      throw new Error('Another test suite is already running')
    }

    this.isRunning = true
    const runId = `${suiteId}_${Date.now()}`
    
    console.log(`🧪 Starting test suite: ${suite.name}`)
    
    const suiteResult = {
      runId,
      suiteId,
      suiteName: suite.name,
      startTime: Date.now(),
      endTime: null,
      tests: [],
      summary: {
        total: suite.tests.length,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      status: 'running'
    }

    try {
      for (const test of suite.tests) {
        this.currentTest = test
        console.log(`  🔬 Running test: ${test.name}`)
        
        const testResult = await this.runSingleTest(test, options)
        suiteResult.tests.push(testResult)
        
        if (testResult.status === 'passed') {
          suiteResult.summary.passed++
        } else if (testResult.status === 'failed') {
          suiteResult.summary.failed++
        } else if (testResult.status === 'warning') {
          suiteResult.summary.warnings++
        }
      }

      suiteResult.status = suiteResult.summary.failed > 0 ? 'failed' : 'passed'
      suiteResult.endTime = Date.now()
      suiteResult.duration = suiteResult.endTime - suiteResult.startTime

      // Update suite's last run info
      suite.lastRun = suiteResult.endTime
      suite.results.push(suiteResult)

      // Keep only last 10 results per suite
      if (suite.results.length > 10) {
        suite.results = suite.results.slice(-10)
      }

      console.log(`✅ Test suite completed: ${suiteResult.summary.passed}/${suiteResult.summary.total} passed`)
      
      return suiteResult

    } catch (error) {
      suiteResult.status = 'error'
      suiteResult.error = error.message
      suiteResult.endTime = Date.now()
      
      console.error(`❌ Test suite failed:`, error)
      throw error
      
    } finally {
      this.isRunning = false
      this.currentTest = null
      this.testResults.push(suiteResult)
    }
  }

  async runSingleTest(test, options = {}) {
    const testResult = {
      testId: test.id,
      testName: test.name,
      description: test.description,
      startTime: Date.now(),
      endTime: null,
      status: 'running',
      validationResults: [],
      metrics: {},
      issues: [],
      warnings: []
    }

    try {
      // Simulate running the test (in a real implementation, this would run the actual simulation)
      const simulationResult = await this.simulateTest(test, options)
      
      // Extract metrics from simulation
      testResult.metrics = this.extractMetrics(simulationResult, test.config)
      
      // Run validations
      if (test.config.validations) {
        for (const validation of test.config.validations) {
          const validationResult = this.validateMetric(
            testResult.metrics,
            validation,
            simulationResult
          )
          testResult.validationResults.push(validationResult)
          
          if (!validationResult.passed) {
            if (validationResult.severity === 'error') {
              testResult.issues.push(validationResult.message)
            } else {
              testResult.warnings.push(validationResult.message)
            }
          }
        }
      }

      // Run expectation checks
      if (test.config.expectations) {
        const expectationResults = this.checkExpectations(
          simulationResult,
          test.config.expectations
        )
        testResult.validationResults.push(...expectationResults)
      }

      // Determine overall test status
      const hasErrors = testResult.validationResults.some(v => !v.passed && v.severity === 'error')
      const hasWarnings = testResult.validationResults.some(v => !v.passed && v.severity === 'warning')
      
      if (hasErrors) {
        testResult.status = 'failed'
      } else if (hasWarnings) {
        testResult.status = 'warning'
      } else {
        testResult.status = 'passed'
      }

      testResult.endTime = Date.now()
      testResult.duration = testResult.endTime - testResult.startTime

      return testResult

    } catch (error) {
      testResult.status = 'error'
      testResult.error = error.message
      testResult.endTime = Date.now()
      
      console.error(`❌ Test ${test.name} failed:`, error)
      return testResult
    }
  }

  async simulateTest(test, options) {
    // Mock simulation - in real implementation, this would use the actual simulator
    // with the test configuration
    
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate delay
    
    const playerBehavior = test.config.playerBehavior || {}
    const efficiency = playerBehavior.efficiency || 0.7
    const idleTime = playerBehavior.idleTime || 0.2
    
    // Generate mock results based on player behavior
    const baseCompletionTime = 30
    const completionTime = Math.round(baseCompletionTime * (2 - efficiency) * (1 + idleTime))
    
    return {
      completionTime,
      totalDays: completionTime,
      phases: [
        { phase: 'tutorial', duration: Math.max(1, Math.round(2 * (1 - efficiency))) },
        { phase: 'early', duration: Math.max(3, Math.round(6 * (1 - efficiency + idleTime))) },
        { phase: 'mid', duration: Math.max(8, Math.round(12 * (1 - efficiency + idleTime))) },
        { phase: 'late', duration: Math.max(5, Math.round(10 * (1 - efficiency + idleTime))) }
      ],
      helpers: Math.max(1, Math.round(4 * efficiency)),
      upgrades: Math.max(5, Math.round(20 * efficiency)),
      resources: {
        energy: {
          shortageTime: idleTime * 0.5,
          capUtilization: 0.3 + (efficiency * 0.5)
        }
      },
      efficiency: {
        overall: efficiency,
        automation: Math.max(0.3, efficiency - 0.1)
      }
    }
  }

  extractMetrics(simulationResult, testConfig) {
    const metrics = {}

    // Core progression metrics
    metrics.completion_time = simulationResult.completionTime
    metrics.total_helpers = simulationResult.helpers
    metrics.total_upgrades = simulationResult.upgrades
    metrics.overall_efficiency = simulationResult.efficiency.overall

    // Energy metrics
    if (simulationResult.resources.energy) {
      metrics.energy_shortage_time = simulationResult.resources.energy.shortageTime
      metrics.energy_cap_utilization = simulationResult.resources.energy.capUtilization
    }

    // Phase timing metrics
    const phases = simulationResult.phases
    if (phases.length > 0) {
      const expectedDurations = { tutorial: 2, early: 5, mid: 10, late: 12 }
      const variance = phases.map(p => {
        const expected = expectedDurations[p.phase] || 1
        return Math.abs(p.duration - expected) / expected
      })
      metrics.phase_variance = variance.reduce((a, b) => a + b, 0) / variance.length
    }

    // Helper metrics
    if (simulationResult.helpers > 0) {
      metrics.helper_discovery_timing = 10 // Mock: day helpers were first discovered
      metrics.automation_efficiency = simulationResult.efficiency.automation
    }

    // Upgrade gap analysis
    metrics.upgrade_gaps = 3 // Mock: max days between upgrades

    return metrics
  }

  validateMetric(metrics, validation, simulationResult) {
    const value = metrics[validation.metric]
    let passed = false
    let actualValue = value
    let severity = 'error'

    switch (validation.operator) {
      case 'less_than':
        passed = value < validation.value
        break
      case 'greater_than':
        passed = value > validation.value
        break
      case 'within_range':
        const [min, max] = validation.value
        passed = value >= min && value <= max
        actualValue = `${value} (range: ${min}-${max})`
        break
      case 'equals':
        passed = Math.abs(value - validation.value) < 0.01
        break
    }

    return {
      metric: validation.metric,
      description: validation.description,
      expected: validation.value,
      actual: actualValue,
      passed,
      severity: validation.severity || severity,
      message: passed 
        ? `✅ ${validation.description}`
        : `❌ ${validation.description}: expected ${validation.operator} ${validation.value}, got ${actualValue}`
    }
  }

  checkExpectations(simulationResult, expectations) {
    const results = []

    // Check completion time
    if (expectations.maxDays) {
      results.push({
        metric: 'max_completion_time',
        description: 'Completion within expected timeframe',
        expected: `≤ ${expectations.maxDays} days`,
        actual: `${simulationResult.completionTime} days`,
        passed: simulationResult.completionTime <= expectations.maxDays,
        severity: 'error',
        message: simulationResult.completionTime <= expectations.maxDays
          ? `✅ Completed in ${simulationResult.completionTime} days (≤ ${expectations.maxDays})`
          : `❌ Took ${simulationResult.completionTime} days (expected ≤ ${expectations.maxDays})`
      })
    }

    // Check helper count
    if (expectations.minHelpers) {
      results.push({
        metric: 'min_helpers',
        description: 'Minimum helper discovery',
        expected: `≥ ${expectations.minHelpers}`,
        actual: simulationResult.helpers,
        passed: simulationResult.helpers >= expectations.minHelpers,
        severity: 'warning',
        message: simulationResult.helpers >= expectations.minHelpers
          ? `✅ Discovered ${simulationResult.helpers} helpers (≥ ${expectations.minHelpers})`
          : `⚠️ Only discovered ${simulationResult.helpers} helpers (expected ≥ ${expectations.minHelpers})`
      })
    }

    // Check phase timing
    if (expectations.phaseTiming) {
      simulationResult.phases.forEach(phase => {
        const expectation = expectations.phaseTiming[phase.phase]
        if (expectation && expectation.max) {
          results.push({
            metric: `${phase.phase}_phase_timing`,
            description: `${phase.phase} phase duration`,
            expected: `≤ ${expectation.max} days`,
            actual: `${phase.duration} days`,
            passed: phase.duration <= expectation.max,
            severity: 'warning',
            message: phase.duration <= expectation.max
              ? `✅ ${phase.phase} phase: ${phase.duration} days (≤ ${expectation.max})`
              : `⚠️ ${phase.phase} phase: ${phase.duration} days (expected ≤ ${expectation.max})`
          })
        }
      })
    }

    return results
  }

  getTestSuites() {
    return Array.from(this.testSuites.values())
  }

  getTestSuite(id) {
    return this.testSuites.get(id)
  }

  getRecentResults(limit = 10) {
    return this.testResults
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit)
  }

  exportResults(format = 'json') {
    const data = {
      suites: Array.from(this.testSuites.values()),
      recentResults: this.getRecentResults(),
      exportedAt: new Date().toISOString()
    }

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      
      case 'csv':
        // Simple CSV export of recent test results
        const csvRows = ['Suite,Test,Status,Duration,Issues']
        this.getRecentResults().forEach(result => {
          result.tests.forEach(test => {
            csvRows.push([
              result.suiteName,
              test.testName,
              test.status,
              test.duration || 0,
              test.issues.length + test.warnings.length
            ].join(','))
          })
        })
        return csvRows.join('\n')
      
      default:
        return JSON.stringify(data, null, 2)
    }
  }
}

// Singleton instance
export const scenarioTestManager = new ScenarioTestManager()
