/**
 * Upgrade Calculator Utility
 * 
 * Handles cost calculations, resource parsing, and time-to-afford
 * calculations for the upgrade system.
 */

/**
 * Parse material cost string into structured format
 * 
 * Examples:
 * - "stone:5" -> { stone: 5 }
 * - "wood:100;iron:5" -> { wood: 100, iron: 5 }
 * - "" -> {}
 * 
 * @param {string} materialsString - Raw materials string from CSV
 * @returns {Object} Parsed materials cost
 */
export function parseMaterials(materialsString) {
  if (!materialsString || materialsString.trim() === '') {
    return {}
  }

  const materials = {}
  const parts = materialsString.split(';').map(p => p.trim()).filter(Boolean)

  parts.forEach(part => {
    const [material, amount] = part.split(':').map(s => s.trim())
    if (material && amount) {
      materials[material] = parseInt(amount, 10) || 0
    }
  })

  return materials
}

/**
 * Parse upgrade costs into structured format
 * 
 * @param {Object} upgrade - Raw upgrade data from CSV
 * @returns {Object} Structured cost information
 */
export function parseUpgradeCosts(upgrade) {
  return {
    gold: parseInt(upgrade.goldCost, 10) || 0,
    energy: parseInt(upgrade.energyCost, 10) || 0,
    materials: parseMaterials(upgrade.materials || ''),
    bossMaterials: parseMaterials(upgrade.bossMaterials || '')
  }
}

/**
 * Check if player can afford an upgrade
 * 
 * @param {Object} upgrade - The upgrade to check
 * @param {Object} resources - Current player resources
 * @returns {Object} Affordability status
 */
export function canAffordUpgrade(upgrade, resources) {
  const costs = parseUpgradeCosts(upgrade)
  const status = {
    canAfford: true,
    missingResources: {},
    totalShortfall: 0
  }

  // Check gold
  if (costs.gold > (resources.gold || 0)) {
    status.canAfford = false
    status.missingResources.gold = costs.gold - (resources.gold || 0)
    status.totalShortfall += status.missingResources.gold
  }

  // Check energy
  if (costs.energy > (resources.energy || 0)) {
    status.canAfford = false
    status.missingResources.energy = costs.energy - (resources.energy || 0)
  }

  // Check materials
  Object.entries(costs.materials).forEach(([material, required]) => {
    const available = resources.materials?.[material] || 0
    if (required > available) {
      status.canAfford = false
      if (!status.missingResources.materials) {
        status.missingResources.materials = {}
      }
      status.missingResources.materials[material] = required - available
    }
  })

  // Check boss materials
  Object.entries(costs.bossMaterials).forEach(([material, required]) => {
    const available = resources.bossMaterials?.[material] || 0
    if (required > available) {
      status.canAfford = false
      if (!status.missingResources.bossMaterials) {
        status.missingResources.bossMaterials = {}
      }
      status.missingResources.bossMaterials[material] = required - available
    }
  })

  return status
}

/**
 * Calculate time to afford an upgrade based on current income rates
 * 
 * @param {Object} upgrade - The upgrade to check
 * @param {Object} resources - Current player resources
 * @param {Object} incomeRates - Resource generation rates per hour
 * @returns {Object} Time calculation result
 */
export function calculateTimeToAfford(upgrade, resources, incomeRates) {
  const affordability = canAffordUpgrade(upgrade, resources)
  
  if (affordability.canAfford) {
    return {
      canAffordNow: true,
      timeInHours: 0,
      timeFormatted: 'Available now',
      bottleneck: null
    }
  }

  let maxTimeHours = 0
  let bottleneck = null

  // Calculate time for gold
  if (affordability.missingResources.gold) {
    const goldRate = incomeRates.goldPerHour || 0
    if (goldRate <= 0) {
      return {
        canAffordNow: false,
        timeInHours: Infinity,
        timeFormatted: 'Never (no gold income)',
        bottleneck: 'gold'
      }
    }
    const goldTime = affordability.missingResources.gold / goldRate
    if (goldTime > maxTimeHours) {
      maxTimeHours = goldTime
      bottleneck = 'gold'
    }
  }

  // Calculate time for energy (assuming energy regenerates)
  if (affordability.missingResources.energy) {
    const energyRate = incomeRates.energyPerHour || 0
    if (energyRate <= 0) {
      return {
        canAffordNow: false,
        timeInHours: Infinity,
        timeFormatted: 'Never (no energy regen)',
        bottleneck: 'energy'
      }
    }
    const energyTime = affordability.missingResources.energy / energyRate
    if (energyTime > maxTimeHours) {
      maxTimeHours = energyTime
      bottleneck = 'energy'
    }
  }

  // Materials generally can't be automatically generated
  if (affordability.missingResources.materials) {
    return {
      canAffordNow: false,
      timeInHours: Infinity,
      timeFormatted: 'Manual materials needed',
      bottleneck: 'materials'
    }
  }

  // Boss materials definitely can't be automatically generated
  if (affordability.missingResources.bossMaterials) {
    return {
      canAffordNow: false,
      timeInHours: Infinity,
      timeFormatted: 'Boss materials needed',
      bottleneck: 'bossMaterials'
    }
  }

  return {
    canAffordNow: false,
    timeInHours: maxTimeHours,
    timeFormatted: formatTime(maxTimeHours),
    bottleneck
  }
}

/**
 * Format time duration into human-readable string
 * 
 * @param {number} hours - Time in hours
 * @returns {string} Formatted time string
 */
export function formatTime(hours) {
  if (hours === Infinity) return 'Never'
  if (hours === 0) return 'Now'
  
  if (hours < 1) {
    const minutes = Math.ceil(hours * 60)
    return `${minutes}m`
  }
  
  if (hours < 24) {
    const wholeHours = Math.floor(hours)
    const minutes = Math.ceil((hours - wholeHours) * 60)
    if (minutes === 0) {
      return `${wholeHours}h`
    }
    return `${wholeHours}h ${minutes}m`
  }
  
  const days = Math.floor(hours / 24)
  const remainingHours = Math.floor(hours % 24)
  if (remainingHours === 0) {
    return `${days}d`
  }
  return `${days}d ${remainingHours}h`
}

/**
 * Format upgrade cost for display
 * 
 * @param {Object} upgrade - The upgrade to format
 * @param {boolean} compact - Whether to use compact format
 * @returns {string} Formatted cost string
 */
export function formatUpgradeCost(upgrade, compact = true) {
  const costs = parseUpgradeCosts(upgrade)
  const parts = []

  if (costs.gold > 0) {
    parts.push(compact ? `💰${costs.gold}` : `${costs.gold} gold`)
  }

  if (costs.energy > 0) {
    parts.push(compact ? `⚡${costs.energy}` : `${costs.energy} energy`)
  }

  Object.entries(costs.materials).forEach(([material, amount]) => {
    const icon = getMaterialIcon(material)
    parts.push(compact ? `${icon}${amount}` : `${amount} ${material}`)
  })

  Object.entries(costs.bossMaterials).forEach(([material, amount]) => {
    const icon = getMaterialIcon(material)
    parts.push(compact ? `${icon}${amount}⭐` : `${amount} ${material} (boss)`)
  })

  return parts.join(compact ? ' ' : ', ')
}

/**
 * Get icon for material type
 * 
 * @param {string} material - Material name
 * @returns {string} Unicode icon
 */
function getMaterialIcon(material) {
  const icons = {
    wood: '🪵',
    stone: '🪨',
    copper: '🔶',
    iron: '⚫',
    silver: '⚪',
    crystal: '💎',
    mythril: '✨',
    obsidian: '⬛',
    cave_crystal: '🔮',
    frozen_heart: '❄️',
    molten_core: '🔥',
    void_essence: '🌌'
  }
  return icons[material] || '📦'
}

/**
 * Calculate total cost for a path of upgrades
 * 
 * @param {Array} upgradePath - Array of upgrade IDs
 * @param {Object} allUpgrades - All available upgrades
 * @returns {Object} Total cost breakdown
 */
export function calculatePathCost(upgradePath, allUpgrades) {
  const totalCost = {
    gold: 0,
    energy: 0,
    materials: {},
    bossMaterials: {}
  }

  upgradePath.forEach(upgradeId => {
    const upgrade = allUpgrades[upgradeId]
    if (!upgrade) return

    const costs = parseUpgradeCosts(upgrade)
    
    totalCost.gold += costs.gold
    totalCost.energy += costs.energy

    Object.entries(costs.materials).forEach(([material, amount]) => {
      totalCost.materials[material] = (totalCost.materials[material] || 0) + amount
    })

    Object.entries(costs.bossMaterials).forEach(([material, amount]) => {
      totalCost.bossMaterials[material] = (totalCost.bossMaterials[material] || 0) + amount
    })
  })

  return totalCost
}

/**
 * Calculate resource efficiency score for an upgrade
 * 
 * @param {Object} upgrade - The upgrade to analyze
 * @param {Object} effects - The effects this upgrade provides
 * @returns {number} Efficiency score (higher is better)
 */
export function calculateEfficiencyScore(upgrade, effects) {
  const costs = parseUpgradeCosts(upgrade)
  const totalGoldValue = costs.gold + (costs.energy * 0.1) // Rough energy-to-gold conversion
  
  // This is a simplified efficiency calculation
  // In a real game, you'd want more sophisticated effect valuation
  let effectValue = 0
  
  if (effects.energyCap) {
    effectValue += (effects.energyCap.to - effects.energyCap.from) * 0.01
  }
  
  if (effects.waterCap) {
    effectValue += (effects.waterCap.to - effects.waterCap.from) * 0.1
  }
  
  // Percentage improvements are highly valuable
  if (effects.percentageBonus) {
    effectValue += effects.percentageBonus * 100
  }

  return totalGoldValue > 0 ? effectValue / totalGoldValue : 0
}

/**
 * Get upgrade recommendations based on current state
 * 
 * @param {Object} allUpgrades - All available upgrades
 * @param {Object} gameState - Current game state
 * @param {Object} resources - Current resources
 * @param {Object} incomeRates - Resource income rates
 * @returns {Array} Recommended upgrades with reasoning
 */
export function getUpgradeRecommendations(allUpgrades, gameState, resources, incomeRates) {
  const availableUpgrades = Object.values(allUpgrades).filter(upgrade => {
    return !gameState.ownedUpgrades?.includes(upgrade.id)
  })

  const recommendations = availableUpgrades.map(upgrade => {
    const timeToAfford = calculateTimeToAfford(upgrade, resources, incomeRates)
    const affordability = canAffordUpgrade(upgrade, resources)
    
    return {
      upgrade,
      timeToAfford,
      affordability,
      priority: calculateUpgradePriority(upgrade, gameState, timeToAfford)
    }
  }).filter(rec => rec.timeToAfford.timeInHours < Infinity)
    .sort((a, b) => b.priority - a.priority)

  return recommendations.slice(0, 10) // Top 10 recommendations
}

/**
 * Calculate priority score for upgrade recommendations
 * 
 * @param {Object} upgrade - The upgrade to score
 * @param {Object} gameState - Current game state
 * @param {Object} timeToAfford - Time calculation result
 * @returns {number} Priority score
 */
function calculateUpgradePriority(upgrade, gameState, timeToAfford) {
  let score = 0

  // Prefer affordable upgrades
  if (timeToAfford.canAffordNow) {
    score += 100
  } else if (timeToAfford.timeInHours < 1) {
    score += 50
  } else if (timeToAfford.timeInHours < 24) {
    score += 25
  }

  // Prefer paradigm-shifting upgrades
  if (upgrade.category === 'deeds' || upgrade.name.includes('Auto')) {
    score += 75
  }

  // Prefer storage and infrastructure early
  if (['storage', 'water', 'energy'].includes(upgrade.category)) {
    score += 50
  }

  // Lower tier upgrades have higher priority (easier progression)
  if (upgrade.tier) {
    score += Math.max(0, 20 - parseInt(upgrade.tier, 10) * 2)
  }

  return score
}
