/**
 * useUpgradeFilters Composable
 * 
 * Specialized composable for managing complex filtering logic
 * in the upgrade tree system.
 */

import { ref, computed, watch } from 'vue'
import { VENDORS } from '@/utils/treeLayoutEngine.js'
import { getUpgradeStatus } from '@/utils/upgradePrerequisites.js'
import { canAffordUpgrade } from '@/utils/upgradeCalculator.js'

export function useUpgradeFilters() {
  // Filter state - template-friendly structure
  const activeFilters = ref({
    vendors: new Set(['all']),
    categories: new Set(['all']),
    status: new Set(['all']),
    search: '',
    affordability: 'all', // Simple string value for template
    dependencies: 'all',   // Simple string value for template
    special: {
      criticalPath: false,
      paradigmShifts: false,
      bossMaterials: false,
      automationUpgrades: false
    },
    phases: new Set(['all']),
    timeframes: {
      immediate: false,   // < 1 hour
      shortTerm: false,   // 1-24 hours  
      longTerm: false,    // > 24 hours
      infinite: false     // Never affordable
    }
  })

  // Filter presets
  const filterPresets = ref({
    default: {
      name: 'All Upgrades',
      icon: '🔍',
      filters: {
        vendors: new Set(['all']),
        categories: new Set(['all']),
        status: new Set(['all'])
      }
    },
    immediate: {
      name: 'Immediate Goals',
      icon: '⚡',
      filters: {
        status: new Set(['available']),
        affordability: { affordableNow: true }
      }
    },
    progression: {
      name: 'Progression Path',
      icon: '🎯',
      filters: {
        special: { criticalPath: true }
      }
    },
    paradigm: {
      name: 'Game Changers',
      icon: '🚀',
      filters: {
        special: { paradigmShifts: true }
      }
    },
    automation: {
      name: 'Automation',
      icon: '🤖',
      filters: {
        special: { automationUpgrades: true }
      }
    },
    storage: {
      name: 'Storage & Infrastructure',
      icon: '🏗️',
      filters: {
        categories: new Set(['energy', 'water', 'storage'])
      }
    }
  })

  // Available filter options
  const availableVendors = computed(() => {
    return Object.entries(VENDORS).map(([id, config]) => ({
      id,
      name: config.name,
      icon: config.icon,
      color: config.color
    }))
  })

  const availableCategories = computed(() => {
    const categories = new Set()
    Object.values(VENDORS).forEach(vendor => {
      vendor.categories.forEach(cat => categories.add(cat))
    })
    
    return Array.from(categories).map(category => ({
      id: category,
      name: formatCategoryName(category),
      icon: getCategoryIcon(category)
    }))
  })

  const availableStatuses = computed(() => [
    { id: 'owned', name: 'Owned', icon: '✅', color: '#10b981' },
    { id: 'available', name: 'Available', icon: '🟡', color: '#f59e0b' },
    { id: 'prerequisite_missing', name: 'Prerequisites Missing', icon: '🔒', color: '#ef4444' },
    { id: 'farm_locked', name: 'Farm Stage Locked', icon: '🏡', color: '#8b5cf6' },
    { id: 'tool_locked', name: 'Tool Required', icon: '🔨', color: '#ec4899' }
  ])

  /**
   * Check if a node passes all active filters
   */
  const passesFilters = (node, gameState) => {
    const upgrade = node.upgrade
    
    // Vendor filter
    if (!activeFilters.value.vendors.has('all') && 
        !activeFilters.value.vendors.has(upgrade.vendor)) {
      return false
    }

    // Category filter
    if (!activeFilters.value.categories.has('all') && 
        !activeFilters.value.categories.has(upgrade.category)) {
      return false
    }

    // Status filter
    const status = getUpgradeStatus(upgrade, gameState, {})
    if (!activeFilters.value.status.has('all') && 
        !activeFilters.value.status.has(status)) {
      return false
    }

    // Search filter
    if (activeFilters.value.search) {
      const searchTerm = activeFilters.value.search.toLowerCase()
      const searchableText = [
        upgrade.name,
        upgrade.description || '',
        upgrade.effect || '',
        upgrade.vendor,
        upgrade.category
      ].join(' ').toLowerCase()

      if (!searchableText.includes(searchTerm)) {
        return false
      }
    }

    // Affordability filters
    if (activeFilters.value.affordability.affordableNow) {
      const affordability = canAffordUpgrade(upgrade, gameState.resources || {})
      if (!affordability.canAfford) return false
    }

    if (activeFilters.value.affordability.affordableSoon) {
      // Check if affordable within 1 hour
      // This would need time calculation logic
    }

    // Special filters
    if (activeFilters.value.special.paradigmShifts) {
      if (!isParadigmShift(upgrade)) return false
    }

    if (activeFilters.value.special.automationUpgrades) {
      if (!upgrade.name.toLowerCase().includes('auto')) return false
    }

    if (activeFilters.value.special.bossMaterials) {
      if (!upgrade.bossMaterials) return false
    }

    return true
  }

  /**
   * Apply a filter preset
   */
  const applyPreset = (presetName) => {
    const preset = filterPresets.value[presetName]
    if (!preset) return

    // Reset to defaults first
    resetFilters()

    // Apply preset filters
    Object.entries(preset.filters).forEach(([filterType, filterValue]) => {
      if (activeFilters.value[filterType] !== undefined) {
        activeFilters.value[filterType] = filterValue
      }
    })
  }

  /**
   * Toggle vendor filter
   */
  const toggleVendor = (vendorId) => {
    if (vendorId === 'all') {
      activeFilters.value.vendors = new Set(['all'])
    } else {
      if (activeFilters.value.vendors.has('all')) {
        activeFilters.value.vendors = new Set([vendorId])
      } else if (activeFilters.value.vendors.has(vendorId)) {
        activeFilters.value.vendors.delete(vendorId)
        if (activeFilters.value.vendors.size === 0) {
          activeFilters.value.vendors.add('all')
        }
      } else {
        activeFilters.value.vendors.add(vendorId)
      }
    }
  }

  /**
   * Toggle category filter
   */
  const toggleCategory = (categoryId) => {
    if (categoryId === 'all') {
      activeFilters.value.categories = new Set(['all'])
    } else {
      if (activeFilters.value.categories.has('all')) {
        activeFilters.value.categories = new Set([categoryId])
      } else if (activeFilters.value.categories.has(categoryId)) {
        activeFilters.value.categories.delete(categoryId)
        if (activeFilters.value.categories.size === 0) {
          activeFilters.value.categories.add('all')
        }
      } else {
        activeFilters.value.categories.add(categoryId)
      }
    }
  }

  /**
   * Toggle status filter
   */
  const toggleStatus = (statusId) => {
    if (statusId === 'all') {
      activeFilters.value.status = new Set(['all'])
    } else {
      if (activeFilters.value.status.has('all')) {
        activeFilters.value.status = new Set([statusId])
      } else if (activeFilters.value.status.has(statusId)) {
        activeFilters.value.status.delete(statusId)
        if (activeFilters.value.status.size === 0) {
          activeFilters.value.status.add('all')
        }
      } else {
        activeFilters.value.status.add(statusId)
      }
    }
  }

  /**
   * Set search term
   */
  const setSearch = (searchTerm) => {
    activeFilters.value.search = searchTerm
  }

  /**
   * Toggle affordability filter
   */
  const toggleAffordability = (type) => {
    activeFilters.value.affordability[type] = !activeFilters.value.affordability[type]
  }

  /**
   * Toggle special filter
   */
  const toggleSpecial = (type) => {
    activeFilters.value.special[type] = !activeFilters.value.special[type]
  }

  /**
   * Reset all filters to defaults
   */
  const resetFilters = () => {
    activeFilters.value = {
      vendors: new Set(['all']),
      categories: new Set(['all']),
      status: new Set(['all']),
      search: '',
      affordability: {
        affordableNow: false,
        affordableSoon: false,
        neverAffordable: false
      },
      special: {
        criticalPath: false,
        paradigmShifts: false,
        bossMaterials: false,
        automationUpgrades: false
      },
      phases: new Set(['all']),
      timeframes: {
        immediate: false,
        shortTerm: false,
        longTerm: false,
        infinite: false
      }
    }
  }

  /**
   * Get filter summary for display
   */
  const getFilterSummary = computed(() => {
    const summary = []

    if (!activeFilters.value.vendors.has('all')) {
      const vendorNames = Array.from(activeFilters.value.vendors)
        .map(id => VENDORS[id]?.name || id)
      summary.push(`Vendors: ${vendorNames.join(', ')}`)
    }

    if (!activeFilters.value.categories.has('all')) {
      const categoryNames = Array.from(activeFilters.value.categories)
        .map(formatCategoryName)
      summary.push(`Categories: ${categoryNames.join(', ')}`)
    }

    if (!activeFilters.value.status.has('all')) {
      const statusNames = Array.from(activeFilters.value.status)
        .map(s => availableStatuses.value.find(status => status.id === s)?.name || s)
      summary.push(`Status: ${statusNames.join(', ')}`)
    }

    if (activeFilters.value.search) {
      summary.push(`Search: "${activeFilters.value.search}"`)
    }

    const activeSpecial = Object.entries(activeFilters.value.special)
      .filter(([, active]) => active)
      .map(([key]) => formatSpecialFilterName(key))
    
    if (activeSpecial.length > 0) {
      summary.push(`Special: ${activeSpecial.join(', ')}`)
    }

    return summary.length > 0 ? summary.join(' | ') : 'No filters applied'
  })

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => {
    return !activeFilters.value.vendors.has('all') ||
           !activeFilters.value.categories.has('all') ||
           !activeFilters.value.status.has('all') ||
           activeFilters.value.search.length > 0 ||
           Object.values(activeFilters.value.affordability).some(Boolean) ||
           Object.values(activeFilters.value.special).some(Boolean)
  })

  /**
   * Export filter configuration
   */
  const exportFilters = () => {
    return {
      vendors: Array.from(activeFilters.value.vendors),
      categories: Array.from(activeFilters.value.categories),
      status: Array.from(activeFilters.value.status),
      search: activeFilters.value.search,
      affordability: { ...activeFilters.value.affordability },
      special: { ...activeFilters.value.special }
    }
  }

  /**
   * Import filter configuration
   */
  const importFilters = (filterConfig) => {
    if (filterConfig.vendors) {
      activeFilters.value.vendors = new Set(filterConfig.vendors)
    }
    if (filterConfig.categories) {
      activeFilters.value.categories = new Set(filterConfig.categories)
    }
    if (filterConfig.status) {
      activeFilters.value.status = new Set(filterConfig.status)
    }
    if (filterConfig.search !== undefined) {
      activeFilters.value.search = filterConfig.search
    }
    if (filterConfig.affordability) {
      activeFilters.value.affordability = { ...filterConfig.affordability }
    }
    if (filterConfig.special) {
      activeFilters.value.special = { ...filterConfig.special }
    }
  }

  return {
    // State
    activeFilters,
    filterPresets,

    // Computed
    availableVendors,
    availableCategories,
    availableStatuses,
    getFilterSummary,
    hasActiveFilters,

    // Methods
    passesFilters,
    applyPreset,
    toggleVendor,
    toggleCategory,
    toggleStatus,
    setSearch,
    toggleAffordability,
    toggleSpecial,
    resetFilters,
    exportFilters,
    importFilters
  }
}

/**
 * Helper functions
 */

function formatCategoryName(category) {
  const names = {
    energy: 'Energy Storage',
    water: 'Water Systems',
    storage: 'General Storage',
    materials: 'Materials',
    deeds: 'Land Deeds',
    tools: 'Tools',
    weapons: 'Weapons',
    forge: 'Forge Upgrades',
    tower: 'Tower Systems',
    housing: 'Gnome Housing',
    hero: 'Hero Skills',
    exchanges: 'Material Exchanges'
  }
  return names[category] || category.charAt(0).toUpperCase() + category.slice(1)
}

function getCategoryIcon(category) {
  const icons = {
    energy: '⚡',
    water: '💧',
    storage: '📦',
    materials: '🧱',
    deeds: '📜',
    tools: '🔨',
    weapons: '⚔️',
    forge: '⚒️',
    tower: '🗼',
    housing: '🏠',
    hero: '🧙',
    exchanges: '💱'
  }
  return icons[category] || '📋'
}

function formatSpecialFilterName(key) {
  const names = {
    criticalPath: 'Critical Path',
    paradigmShifts: 'Paradigm Shifts',
    bossMaterials: 'Boss Materials',
    automationUpgrades: 'Automation'
  }
  return names[key] || key
}

function isParadigmShift(upgrade) {
  const paradigmKeywords = ['Auto', 'Deed', 'Forge', 'Tower']
  return paradigmKeywords.some(keyword => upgrade.name.includes(keyword)) ||
         upgrade.category === 'deeds' ||
         upgrade.description?.toLowerCase().includes('paradigm')
}
