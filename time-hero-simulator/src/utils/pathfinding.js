/**
 * Pathfinding Utility
 * 
 * Advanced algorithms for critical path analysis, optimal progression,
 * and upgrade path optimization in the vendor-based upgrade system.
 */

import { buildDependencyGraph, parsePrerequisites, checkPrerequisites } from './upgradePrerequisites.js'
import { parseUpgradeCosts, calculateTimeToAfford, calculatePathCost } from './upgradeCalculator.js'

/**
 * Find the critical path to a target upgrade
 * 
 * @param {string} targetId - Target upgrade ID
 * @param {Object} allUpgrades - All available upgrades
 * @param {Object} gameState - Current game state
 * @returns {Object} Critical path analysis
 */
export function findCriticalPath(targetId, allUpgrades, gameState) {
  const graph = buildDependencyGraph(allUpgrades)
  const visited = new Set()
  const path = []

  function buildPath(nodeId) {
    if (visited.has(nodeId) || gameState.ownedUpgrades?.includes(nodeId)) {
      return
    }

    visited.add(nodeId)
    const node = graph.nodes[nodeId]
    
    if (!node) return

    // First add all upgrade prerequisites
    node.prerequisites.upgrades.forEach(prereqId => {
      if (!gameState.ownedUpgrades?.includes(prereqId)) {
        buildPath(prereqId)
      }
    })

    // Then add this upgrade if not owned
    if (!gameState.ownedUpgrades?.includes(nodeId)) {
      path.push(nodeId)
    }
  }

  buildPath(targetId)

  return {
    path,
    totalCost: calculatePathCost(path, allUpgrades),
    estimatedTime: estimatePathTime(path, allUpgrades, gameState),
    bottlenecks: findPathBottlenecks(path, allUpgrades, gameState),
    farmStageRequirements: findFarmStageRequirements(path, allUpgrades),
    alternatives: findAlternativePaths(targetId, allUpgrades, gameState, 3)
  }
}

/**
 * Find multiple alternative paths to a target
 * 
 * @param {string} targetId - Target upgrade ID
 * @param {Object} allUpgrades - All available upgrades
 * @param {Object} gameState - Current game state
 * @param {number} maxAlternatives - Maximum number of alternatives to find
 * @returns {Array} Alternative paths
 */
function findAlternativePaths(targetId, allUpgrades, gameState, maxAlternatives = 3) {
  const alternatives = []
  const graph = buildDependencyGraph(allUpgrades)
  const target = graph.nodes[targetId]
  
  if (!target) return alternatives

  // Find different valid combinations of prerequisites
  const prereqCombinations = generatePrereqCombinations(target.prerequisites.upgrades, allUpgrades)
  
  for (const combination of prereqCombinations.slice(0, maxAlternatives)) {
    const altPath = []
    const altVisited = new Set()

    combination.forEach(upgradeId => {
      buildAlternativePath(upgradeId, altPath, altVisited, allUpgrades, gameState)
    })
    
    altPath.push(targetId)

    if (altPath.length > 0) {
      alternatives.push({
        path: altPath,
        totalCost: calculatePathCost(altPath, allUpgrades),
        score: calculatePathScore(altPath, allUpgrades, gameState)
      })
    }
  }

  return alternatives.sort((a, b) => b.score - a.score)
}

/**
 * Build alternative path recursively
 */
function buildAlternativePath(nodeId, path, visited, allUpgrades, gameState) {
  if (visited.has(nodeId) || gameState.ownedUpgrades?.includes(nodeId)) {
    return
  }

  visited.add(nodeId)
  const upgrade = allUpgrades[nodeId]
  if (!upgrade) return

  const prerequisites = parsePrerequisites(upgrade.prerequisite)
  
  prerequisites.upgrades.forEach(prereqId => {
    if (!gameState.ownedUpgrades?.includes(prereqId)) {
      buildAlternativePath(prereqId, path, visited, allUpgrades, gameState)
    }
  })

  if (!gameState.ownedUpgrades?.includes(nodeId)) {
    path.push(nodeId)
  }
}

/**
 * Generate different combinations of prerequisites
 */
function generatePrereqCombinations(prerequisites, allUpgrades) {
  if (prerequisites.length <= 1) {
    return [prerequisites]
  }

  // For now, just return the original combination
  // In a more sophisticated system, you might find equivalent prerequisites
  return [prerequisites]
}

/**
 * Calculate score for a path (for ranking alternatives)
 */
function calculatePathScore(path, allUpgrades, gameState) {
  const costs = calculatePathCost(path, allUpgrades)
  let score = 1000 // Base score

  // Shorter paths are better
  score -= path.length * 10

  // Lower cost is better
  score -= costs.gold * 0.001

  // Prefer paths with fewer material requirements
  const materialTypes = Object.keys(costs.materials).length + Object.keys(costs.bossMaterials).length
  score -= materialTypes * 50

  return score
}

/**
 * Estimate total time for a path
 */
function estimatePathTime(path, allUpgrades, gameState) {
  let totalHours = 0
  const simulatedResources = { ...gameState.resources }

  path.forEach(upgradeId => {
    const upgrade = allUpgrades[upgradeId]
    if (!upgrade) return

    const timeCalc = calculateTimeToAfford(upgrade, simulatedResources, gameState.incomeRates || {})
    totalHours += timeCalc.timeInHours

    // Simulate spending resources
    const costs = parseUpgradeCosts(upgrade)
    simulatedResources.gold = Math.max(0, (simulatedResources.gold || 0) - costs.gold)
    simulatedResources.energy = Math.max(0, (simulatedResources.energy || 0) - costs.energy)
  })

  return totalHours
}

/**
 * Find bottlenecks in a path
 */
function findPathBottlenecks(path, allUpgrades, gameState) {
  const bottlenecks = []

  path.forEach(upgradeId => {
    const upgrade = allUpgrades[upgradeId]
    if (!upgrade) return

    const timeCalc = calculateTimeToAfford(upgrade, gameState.resources || {}, gameState.incomeRates || {})
    
    if (timeCalc.timeInHours === Infinity) {
      bottlenecks.push({
        upgradeId,
        upgradeName: upgrade.name,
        type: 'resource',
        bottleneck: timeCalc.bottleneck,
        description: `Cannot afford: ${timeCalc.timeFormatted}`
      })
    }

    // Check for farm stage bottlenecks
    const prerequisites = parsePrerequisites(upgrade.prerequisite)
    prerequisites.farmStages.forEach(stage => {
      if (!gameState.farmStages?.includes(stage)) {
        bottlenecks.push({
          upgradeId,
          upgradeName: upgrade.name,
          type: 'farmStage',
          bottleneck: stage,
          description: `Requires farm stage: ${stage}`
        })
      }
    })
  })

  return bottlenecks
}

/**
 * Find farm stage requirements for a path
 */
function findFarmStageRequirements(path, allUpgrades) {
  const stages = new Set()

  path.forEach(upgradeId => {
    const upgrade = allUpgrades[upgradeId]
    if (!upgrade) return

    const prerequisites = parsePrerequisites(upgrade.prerequisite)
    prerequisites.farmStages.forEach(stage => stages.add(stage))
  })

  return Array.from(stages).sort()
}

/**
 * Find optimal next upgrades based on current situation
 * 
 * @param {Object} allUpgrades - All available upgrades
 * @param {Object} gameState - Current game state
 * @param {Object} goals - Player goals and preferences
 * @returns {Array} Recommended next upgrades
 */
export function findOptimalNextUpgrades(allUpgrades, gameState, goals = {}) {
  const availableUpgrades = Object.values(allUpgrades).filter(upgrade => {
    if (gameState.ownedUpgrades?.includes(upgrade.id)) return false
    
    const prereqStatus = checkPrerequisites(upgrade, gameState, allUpgrades)
    return prereqStatus.canPurchase
  })

  const recommendations = availableUpgrades.map(upgrade => {
    const timeToAfford = calculateTimeToAfford(
      upgrade, 
      gameState.resources || {}, 
      gameState.incomeRates || {}
    )
    
    const score = calculateUpgradeScore(upgrade, gameState, goals, timeToAfford)
    const impact = calculateUpgradeImpact(upgrade, allUpgrades, gameState)

    return {
      upgrade,
      score,
      impact,
      timeToAfford,
      reasoning: generateRecommendationReasoning(upgrade, score, impact, timeToAfford)
    }
  })

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

/**
 * Calculate upgrade score for recommendations
 */
function calculateUpgradeScore(upgrade, gameState, goals, timeToAfford) {
  let score = 0

  // Affordability bonus
  if (timeToAfford.canAffordNow) {
    score += 100
  } else if (timeToAfford.timeInHours < 1) {
    score += 80
  } else if (timeToAfford.timeInHours < 24) {
    score += 40
  } else if (timeToAfford.timeInHours < Infinity) {
    score += 20
  }

  // Category priorities
  const categoryScores = {
    deeds: 90,      // Farm expansion is always high priority
    energy: 70,     // Energy storage is crucial
    water: 60,      // Water infrastructure important
    storage: 50,    // General storage helpful
    tools: 40,      // Tools provide efficiency
    tower: 30,      // Tower progression
    forge: 30,      // Crafting capabilities
    housing: 20,    // Helper housing
    hero: 15        // Carry capacity
  }
  score += categoryScores[upgrade.category] || 10

  // Goal-based adjustments
  if (goals.focus === 'automation' && upgrade.name.includes('Auto')) {
    score += 50
  }
  if (goals.focus === 'storage' && ['energy', 'water', 'storage'].includes(upgrade.category)) {
    score += 30
  }
  if (goals.focus === 'progression' && upgrade.category === 'deeds') {
    score += 60
  }

  // Tier bonus (earlier tiers are more accessible)
  const tier = parseInt(upgrade.tier, 10) || 1
  score += Math.max(0, 30 - tier * 3)

  return score
}

/**
 * Calculate the impact of purchasing an upgrade
 */
function calculateUpgradeImpact(upgrade, allUpgrades, gameState) {
  const dependents = Object.values(allUpgrades).filter(other => {
    const prerequisites = parsePrerequisites(other.prerequisite)
    return prerequisites.upgrades.includes(upgrade.id)
  })

  return {
    unlocksCount: dependents.length,
    unlocks: dependents.map(dep => ({ id: dep.id, name: dep.name })),
    categoryImpact: upgrade.category,
    isParadigmShift: isParadigmShift(upgrade),
    efficiency: calculateEfficiencyBonus(upgrade)
  }
}

/**
 * Check if upgrade is a paradigm shift (game-changing)
 */
function isParadigmShift(upgrade) {
  const paradigmKeywords = ['Auto', 'Deed', 'Forge', 'Tower']
  return paradigmKeywords.some(keyword => upgrade.name.includes(keyword)) ||
         upgrade.category === 'deeds'
}

/**
 * Calculate efficiency bonus from upgrade
 */
function calculateEfficiencyBonus(upgrade) {
  if (upgrade.effect?.includes('cap')) return 'storage'
  if (upgrade.effect?.includes('speed')) return 'speed'
  if (upgrade.effect?.includes('auto')) return 'automation'
  if (upgrade.effect?.includes('%')) return 'percentage'
  return 'other'
}

/**
 * Generate human-readable reasoning for recommendation
 */
function generateRecommendationReasoning(upgrade, score, impact, timeToAfford) {
  const reasons = []

  if (timeToAfford.canAffordNow) {
    reasons.push('Can afford now')
  } else if (timeToAfford.timeInHours < 1) {
    reasons.push('Affordable within 1 hour')
  }

  if (impact.isParadigmShift) {
    reasons.push('Game-changing upgrade')
  }

  if (impact.unlocksCount > 0) {
    reasons.push(`Unlocks ${impact.unlocksCount} upgrades`)
  }

  if (upgrade.category === 'deeds') {
    reasons.push('Expands available plots')
  }

  if (upgrade.category === 'energy') {
    reasons.push('Increases energy capacity')
  }

  if (upgrade.name.includes('Auto')) {
    reasons.push('Provides automation')
  }

  return reasons.length > 0 ? reasons.join(', ') : 'Useful progression upgrade'
}

/**
 * Analyze upgrade tree completeness for different areas
 * 
 * @param {Object} allUpgrades - All available upgrades
 * @param {Object} gameState - Current game state
 * @returns {Object} Completeness analysis
 */
export function analyzeTreeCompleteness(allUpgrades, gameState) {
  const owned = gameState.ownedUpgrades || []
  const analysis = {}

  // Analyze by vendor
  Object.values(allUpgrades).forEach(upgrade => {
    const vendor = upgrade.vendor
    if (!analysis[vendor]) {
      analysis[vendor] = { total: 0, owned: 0, available: 0, locked: 0 }
    }
    
    analysis[vendor].total++
    
    if (owned.includes(upgrade.id)) {
      analysis[vendor].owned++
    } else {
      const prereqStatus = checkPrerequisites(upgrade, gameState, allUpgrades)
      if (prereqStatus.canPurchase) {
        analysis[vendor].available++
      } else {
        analysis[vendor].locked++
      }
    }
  })

  // Calculate percentages
  Object.values(analysis).forEach(vendorStats => {
    vendorStats.completionPercentage = (vendorStats.owned / vendorStats.total) * 100
    vendorStats.availablePercentage = (vendorStats.available / vendorStats.total) * 100
  })

  return analysis
}

/**
 * Find upgrade gaps - missing upgrades that block progression
 * 
 * @param {Object} allUpgrades - All available upgrades
 * @param {Object} gameState - Current game state
 * @returns {Array} List of critical gaps
 */
export function findUpgradeGaps(allUpgrades, gameState) {
  const gaps = []
  const owned = gameState.ownedUpgrades || []

  Object.values(allUpgrades).forEach(upgrade => {
    if (owned.includes(upgrade.id)) return

    const prereqStatus = checkPrerequisites(upgrade, gameState, allUpgrades)
    
    if (!prereqStatus.canPurchase && prereqStatus.missingUpgrades.length > 0) {
      // Find the earliest missing prerequisite
      const earliestMissing = prereqStatus.missingUpgrades.find(prereqId => {
        const prereqUpgrade = allUpgrades[prereqId]
        if (!prereqUpgrade) return false
        
        const prereqCheck = checkPrerequisites(prereqUpgrade, gameState, allUpgrades)
        return prereqCheck.canPurchase
      })

      if (earliestMissing) {
        gaps.push({
          blockedUpgrade: upgrade,
          missingPrerequisite: earliestMissing,
          impact: calculateGapImpact(upgrade.id, allUpgrades, gameState)
        })
      }
    }
  })

  return gaps.sort((a, b) => b.impact - a.impact)
}

/**
 * Calculate impact of closing a gap
 */
function calculateGapImpact(upgradeId, allUpgrades, gameState) {
  // This is a simplified calculation - in reality you'd want more sophisticated analysis
  const dependents = Object.values(allUpgrades).filter(upgrade => {
    const prerequisites = parsePrerequisites(upgrade.prerequisite)
    return prerequisites.upgrades.includes(upgradeId)
  })

  return dependents.length * 10 // Simple scoring based on unlock count
}
