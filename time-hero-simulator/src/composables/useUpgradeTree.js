/**
 * useUpgradeTree Composable
 * 
 * Main composable for managing upgrade tree state, layout, and interactions
 * in the source-based upgrade system.
 */

import { ref, computed, watch } from 'vue'
import { useGameValuesStore } from '@/stores/gameValues.js'
import { useSimulationStore } from '@/stores/simulation.js'
import { calculateSourceTreeLayout, SOURCES, AREAS } from '@/utils/treeLayoutEngine.js'

export function useUpgradeTree() {
  // Stores
  const gameValues = useGameValuesStore()
  const simulation = useSimulationStore()

  // Filter state
  const filters = ref({
    sources: [],  // enabled source filters (array for .includes())
    areas: [],    // enabled area filters (array for .includes())
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
    
    // Ensure unifiedNodes is an array
    if (!Array.isArray(unifiedNodes)) {
      console.warn('🚨 unifiedNodes is not an array:', typeof unifiedNodes, unifiedNodes)
      return {}
    }
    
    console.log('🔍 useUpgradeTree - Processing nodes:', {
      totalNodes: unifiedNodes.length,
      firstNode: unifiedNodes[0],
      hasPrerequisites: unifiedNodes.filter(n => n.prerequisites?.length > 0).length,
      rootNodes: unifiedNodes.filter(n => !n.prerequisites || n.prerequisites.length === 0).length
    })
    
    // Convert to keyed object
    const keyedNodes = {}
    unifiedNodes.forEach(node => {
      keyedNodes[node.id] = node
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
    console.log('🔍 Current upgrades state:', {
      upgradesValue: upgrades.value,
      upgradesCount: Object.keys(upgrades.value || {}).length,
      gameStateValue: gameState.value
    })
    
    isLoading.value = true
    error.value = null
    
    try {
      const upgradesObj = upgrades.value
      console.log('🔍 TRACKING: Upgrades passed to layout engine:', {
        count: Object.keys(upgradesObj).length,
        firstFewKeys: Object.keys(upgradesObj).slice(0, 3),
        sampleUpgrade: Object.values(upgradesObj)[0]
      })
      
      // Skip if no upgrades
      if (!upgradesObj || Object.keys(upgradesObj).length === 0) {
        console.log('🚨 No upgrades available for layout calculation')
        return
      }
      
      // Calculate the layout using the layout engine
      console.log('🎯 About to call calculateSourceTreeLayout...')
      const newLayout = await calculateSourceTreeLayout(upgradesObj, gameState.value)
      console.log('✅ Layout calculation completed:', newLayout)
      layout.value = newLayout
      
      // Log missing prerequisites once
      const missingPrereqs = new Set()
      const connectedEdges = layout.value?.edges?.length || 0
      Object.values(layout.value?.nodes || {}).forEach(node => {
        if (node.prerequisites) {
          node.prerequisites.forEach(prereqId => {
            if (!layout.value.nodes[prereqId] && !missingPrereqs.has(prereqId)) {
              missingPrereqs.add(prereqId)
            }
          })
        }
      })
      
      if (missingPrereqs.size > 0) {
        console.warn(`📋 Missing prerequisites (${missingPrereqs.size} unique):`, Array.from(missingPrereqs).sort())
      }
      
      console.log(`🔗 Dependency connections: ${connectedEdges} edges created`)
      console.log(`📊 Layout summary: ${Object.keys(layout.value.nodes).length} nodes across ${Object.keys(layout.value.sourceSections).length} sources`)
      
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
    if (enabled && !filters.value.sources.includes(sourceId)) {
      filters.value.sources.push(sourceId)
    } else if (!enabled && filters.value.sources.includes(sourceId)) {
      const index = filters.value.sources.indexOf(sourceId)
      filters.value.sources.splice(index, 1)
    }
    updateFilteredLayout()
  }

  function toggleSourceFilter(sourceId) {
    const current = filters.value.sources.includes(sourceId)
    setSourceFilter(sourceId, !current)
  }

  function toggleAreaFilter(areaId) {
    const current = filters.value.areas.includes(areaId)
    if (current) {
      const index = filters.value.areas.indexOf(areaId)
      filters.value.areas.splice(index, 1)
    } else {
      filters.value.areas.push(areaId)
    }
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
  watch(() => upgrades.value, (newUpgrades, oldUpgrades) => {
    const newCount = Object.keys(newUpgrades || {}).length
    const oldCount = Object.keys(oldUpgrades || {}).length
    console.log('🔍 Upgrades changed, triggering layout recalculation', { newCount, oldCount })
    if (newCount > 0) {
      calculateLayout()
    }
  }, { deep: true, immediate: true })

  // Also watch the unifiedNodes directly for more reliable triggering
  watch(() => gameValues.unifiedNodes, (newNodes) => {
    console.log('🔍 Unified nodes changed:', newNodes?.length || 0)
    if (newNodes && newNodes.length > 0) {
      console.log('🔍 Triggering layout calculation due to unified nodes change')
      calculateLayout()
    }
  }, { immediate: true })

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
    findPathTo,
    
    // Constants
    SOURCES,
    AREAS
  }
}
