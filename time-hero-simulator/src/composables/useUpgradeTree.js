/**
 * useUpgradeTree Composable
 * 
 * Main composable for managing upgrade tree state, layout, and interactions
 * in the source-based upgrade system.
 */

import { ref, computed, watch } from 'vue'
import { useGameValuesStore } from '@/stores/gameValues.js'
import { useSimulationStore } from '@/stores/simulation.js'
import { calculateSourceTreeLayout } from '@/utils/treeLayoutEngine.js'
import { buildDependencyGraph } from '@/utils/upgradePrerequisites.js'

export function useUpgradeTree() {
  // Stores
  const gameValues = useGameValuesStore()
  const simulation = useSimulationStore()

  // Filter state
  const filters = ref({
    sources: {},  // enabled source filters
    areas: {},    // enabled area filters 
    search: '',
    status: 'all', // all, available, locked, owned
    dependencies: 'all' // all, direct, critical, none
  })

  // Selection state
  const selectedNode = ref(null)
  const hoveredNode = ref(null)
  const highlightedPath = ref([])

  // Loading state
  const isLoading = ref(false)
  const error = ref(null)

  // View state
  const viewState = ref({
    zoom: 1.0,
    panX: 0,
    panY: 0,
    autoFit: true
  })

  // Layout state
  const layout = ref(null)
  const filteredLayout = ref(null)

  /**
   * All unified nodes from the game values store
   */
  const upgrades = computed(() => {
    const unifiedNodes = gameValues.unifiedNodes || []
    console.log('🔍 useUpgradeTree - unified nodes computed:', {
      totalNodes: unifiedNodes.length,
      sampleNode: unifiedNodes[0],
      sourceBreakdown: unifiedNodes.reduce((acc, node) => {
        acc[node.source] = (acc[node.source] || 0) + 1
        return acc
      }, {}),
      areaBreakdown: unifiedNodes.reduce((acc, node) => {
        acc[node.area] = (acc[node.area] || 0) + 1
        return acc
      }, {})
    })
    
    // Add detailed logging to track where nodes might be filtered
    console.log('🔍 TRACKING: Raw unified nodes before processing:', {
      count: unifiedNodes.length,
      firstFew: unifiedNodes.slice(0, 3).map(n => ({ id: n.id, source: n.source, area: n.area }))
    })
    
    // Convert array to keyed object for backward compatibility
    const keyedNodes = {}
    const duplicateIds = []
    const seenIds = new Set()
    
    unifiedNodes.forEach((node, index) => {
      if (seenIds.has(node.id)) {
        duplicateIds.push({ id: node.id, index, csvSource: node.csvSource })
      } else {
        seenIds.add(node.id)
      }
      keyedNodes[node.id] = node
    })
    
    if (duplicateIds.length > 0) {
      console.warn('🚨 DUPLICATE IDs found:', {
        count: duplicateIds.length,
        examples: duplicateIds.slice(0, 10),
        totalOriginal: unifiedNodes.length,
        totalAfterDedup: Object.keys(keyedNodes).length
      })
    }
    
    console.log('🔍 TRACKING: Keyed nodes after conversion:', {
      count: Object.keys(keyedNodes).length,
      firstFewKeys: Object.keys(keyedNodes).slice(0, 3),
      duplicatesFound: duplicateIds.length
    })
    
    return keyedNodes
  })

  /**
   * Current game state for calculations
   */
  const gameState = computed(() => {
    return {
      ownedUpgrades: simulation.state?.ownedUpgrades || [],
      resources: simulation.state?.resources || {},
      incomeRates: simulation.state?.incomeRates || {},
      farmStages: simulation.state?.farmStages || [],
      ownedTools: simulation.state?.ownedTools || [],
      buildings: simulation.state?.buildings || []
    }
  })

  /**
   * Source statistics for legend display
   */
  const sourceStats = computed(() => {
    const stats = {}
    const nodesBySource = groupUpgradesBySource()
    
    Object.entries(nodesBySource).forEach(([sourceId, nodes]) => {
      const owned = nodes.filter(node => gameState.value.ownedUpgrades.includes(node.id)).length
      stats[sourceId] = {
        name: sourceId,
        icon: '📋', // Default icon
        color: '#6b7280', // Default color
        total: nodes.length,
        owned
      }
    })
    
    return stats
  })

  /**
   * Group upgrades by source
   */
  function groupUpgradesBySource() {
    const upgradesObj = upgrades.value
    const grouped = {}
    
    Object.values(upgradesObj).forEach(upgrade => {
      const source = upgrade.source || 'unknown'
      if (!grouped[source]) {
        grouped[source] = []
      }
      grouped[source].push(upgrade)
    })
    
    return grouped
  }

  /**
   * Calculate layout for the upgrade tree
   */
  async function calculateLayout() {
    console.log('🔍 calculateLayout called - starting...')
    isLoading.value = true
    error.value = null
    
    try {
      const upgradesObj = upgrades.value
      console.log('🔍 TRACKING: Upgrades passed to layout engine:', {
        count: Object.keys(upgradesObj).length,
        firstFewKeys: Object.keys(upgradesObj).slice(0, 3),
        sampleUpgrade: Object.values(upgradesObj)[0]
      })
      
      // Calculate the layout using the layout engine
      const newLayout = await calculateSourceTreeLayout(upgradesObj, gameState.value)
      layout.value = newLayout
      
      // Apply filters to create filtered layout
      updateFilteredLayout()
      
      console.log('🔍 Layout calculation complete:', {
        hasLayout: !!layout.value,
        nodeCount: layout.value ? Object.keys(layout.value.nodes || {}).length : 0
      })
    } catch (err) {
      console.error('❌ Error calculating layout:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update filtered layout based on current filters
   */
  function updateFilteredLayout() {
    if (!layout.value) {
      filteredLayout.value = null
      return
    }
    
    // For now, just pass through the layout
    // TODO: Apply actual filtering based on filters.value
    filteredLayout.value = layout.value
    
    console.log('🔍 Filtered layout updated:', {
      hasFilteredLayout: !!filteredLayout.value,
      nodeCount: filteredLayout.value ? Object.keys(filteredLayout.value.nodes || {}).length : 0
    })
  }

  /**
   * Select a node
   */
  function selectNode(node) {
    selectedNode.value = node
    console.log('🔍 Node selected:', node?.id)
  }

  /**
   * Hover a node
   */
  function hoverNode(node) {
    hoveredNode.value = node
  }

  /**
   * Clear hover state
   */
  function clearHover() {
    hoveredNode.value = null
  }

  /**
   * Filter methods
   */
  function setSourceFilter(sourceId, enabled) {
    filters.value.sources[sourceId] = enabled
    updateFilteredLayout()
  }

  function toggleSourceFilter(sourceId) {
    const current = filters.value.sources[sourceId] || false
    setSourceFilter(sourceId, !current)
  }

  function toggleAreaFilter(areaId) {
    const current = filters.value.areas[areaId] || false
    filters.value.areas[areaId] = !current
    updateFilteredLayout()
  }

  /**
   * Find path to a specific node
   */
  function findPathTo(targetNodeId) {
    // TODO: Implement pathfinding
    return []
  }

  // Watch for changes that require layout recalculation
  watch(() => upgrades.value, () => {
    console.log('🔍 Upgrades changed, triggering layout recalculation')
    calculateLayout()
  }, { deep: true })

  watch(() => gameState.value, () => {
    console.log('🔍 Game state changed, updating filtered layout')
    updateFilteredLayout()
  }, { deep: true })

  return {
    // State
    filters,
    selectedNode,
    hoveredNode,
    highlightedPath,
    isLoading,
    error,
    viewState,
    
    // Computed
    upgrades,
    layout,
    filteredLayout,
    gameState,
    sourceStats,
    
    // Methods
    calculateLayout,
    selectNode,
    hoverNode,
    clearHover,
    setSourceFilter,
    toggleSourceFilter,
    toggleAreaFilter,
    findPathTo
  }
}
