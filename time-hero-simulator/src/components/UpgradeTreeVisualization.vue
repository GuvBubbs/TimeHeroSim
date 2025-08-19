<template>
  <div class="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
    <!-- Interactive Container -->
    <div 
      ref="containerRef"
      class="w-full h-full relative"
      @wheel.prevent="interactions.handleWheel"
      @mousedown="interactions.handleMouseDown"
      @touchstart="interactions.handleTouchStart"
      @touchmove="interactions.handleTouchMove"
      @touchend="interactions.handleTouchEnd"
      @dblclick="interactions.handleDoubleClick"
      @keydown="interactions.handleKeyDown"
      tabindex="0"
    >
      <!-- SVG Canvas for Upgrade Tree -->
      <svg
        ref="svgCanvas"
        :width="layout?.dimensions.width || 1200"
        :height="layout?.dimensions.height || 800"
        :style="{ transform: interactions.transformStyle }"
        class="absolute top-0 left-0"
      >
        <!-- Definitions -->
        <defs>
          <!-- Grid Background Pattern -->
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="#334155"
              stroke-width="0.5"
              opacity="0.3"
            />
          </pattern>

          <!-- Arrow markers for different edge types -->
          <marker
            id="arrowhead-upgrade"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
          </marker>
          
          <marker
            id="arrowhead-farmStage"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#f59e0b" />
          </marker>

          <marker
            id="arrowhead-tool"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
          </marker>
        </defs>

        <!-- Grid Background -->
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Source Section Headers -->
        <g v-for="(section, sourceId) in layout?.sourceSections" :key="sourceId">
          <rect
            x="0"
            :y="section.y"
            :width="layout.dimensions.width"
            height="50"
            :fill="getSourceConfig(sourceId).color"
            opacity="0.1"
            stroke="#475569"
            stroke-width="1"
          />
          
          <!-- Source Header -->
          <rect
            x="0"
            :y="section.y"
            width="180"
            height="50"
            :fill="getSourceConfig(sourceId).color"
            opacity="0.8"
          />
          
          <text
            x="15"
            :y="section.y + 20"
            fill="white"
            font-size="16"
            font-weight="bold"
          >
            {{ section.icon }} {{ section.name }}
          </text>
          
          <text
            x="15"
            :y="section.y + 35"
            fill="rgba(255,255,255,0.8)"
            font-size="11"
          >
            {{ getSourceStats(sourceId) }}
          </text>

          <!-- Category Labels -->
          <g v-for="(category, categoryName) in section.categories" :key="categoryName">
            <rect
              x="180"
              :y="category.y"
              width="120"
              :height="category.height"
              fill="#1e293b"
              stroke="#475569"
              stroke-width="0.5"
              opacity="0.7"
            />
            <text
              x="240"
              :y="category.y + 25"
              fill="#e2e8f0"
              font-size="12"
              font-weight="600"
              text-anchor="middle"
            >
              {{ formatCategoryName(categoryName) }}
            </text>
          </g>
        </g>

        <!-- Connections between upgrades -->
        <g class="connections">
          <path
            v-for="edge in filteredLayout?.edges || []"
            :key="edge.id"
            :d="edge.path"
            fill="none"
            :stroke="edge.color"
            :stroke-width="edge.style.strokeWidth"
            :stroke-dasharray="edge.style.strokeDasharray"
            :opacity="getEdgeOpacity(edge)"
            :marker-end="`url(#arrowhead-${edge.type})`"
            :class="{ 'highlighted': isEdgeHighlighted(edge) }"
          />
        </g>

        <!-- Upgrade Nodes removed - now using HTML cards -->
        
        
        <!-- Tier Grid Lines for Better Visual Structure -->
        <g class="tier-grid" opacity="0.2">
          <template v-for="tier in maxTierRange" :key="tier">
            <line
              :x1="180 + (tier * 220)"
              :y1="0"
              :x2="180 + (tier * 220)"
              :y2="layout?.dimensions.height || 800"
              stroke="#475569"
              stroke-width="1"
              stroke-dasharray="5,5"
            />
            <text
              :x="180 + (tier * 220) + 110"
              :y="15"
              fill="#64748b"
              font-size="10"
              text-anchor="middle"
              font-weight="bold"
            >
              T{{ tier }}
            </text>
          </template>
        </g>
        
        <!-- Source Swim Lane Headers -->
        <g class="source-headers">
          <template v-for="(section, sourceId) in layout?.sourceSections || {}" :key="sourceId">
            <rect
              :x="0"
              :y="section.y"
              :width="160"
              :height="section.height"
              :fill="section.color"
              opacity="0.1"
              stroke="none"
            />
            <rect
              :x="10"
              :y="section.y + 5"
              :width="150"
              :height="30"
              :fill="section.color"
              opacity="0.8"
              rx="4"
            />
            <text
              :x="85"
              :y="section.y + 15"
              fill="white"
              font-size="10"
              font-weight="bold"
              text-anchor="middle"
              dominant-baseline="middle"
            >
              {{ section.icon }}
            </text>
            <text
              :x="85"
              :y="section.y + 27"
              fill="white"
              font-size="8"
              text-anchor="middle"
              dominant-baseline="middle"
            >
              {{ section.name }}
            </text>
          </template>
        </g>
        
        <!-- Debug: Show total nodes count -->
        <text x="20" y="30" fill="white" font-size="12">
          Nodes: {{ Object.keys(filteredLayout?.nodes || {}).length }} | 
          Edges: {{ (filteredLayout?.edges || []).length }} |
          Sources: {{ Object.keys(layout?.sourceSections || {}).length }}
        </text>
        <text x="20" y="50" fill="white" font-size="10">
          Root nodes: {{ Object.values(filteredLayout?.nodes || {}).filter(n => n.tier === 0).length }} |
          Max tier: {{ maxTier }}
        </text>
      </svg>

      <!-- HTML Card Nodes Layer -->
      <div 
        class="absolute top-0 left-0 pointer-events-none"
        :style="{ transform: interactions.transformStyle }"
      >
        <UpgradeNode
          v-for="node in filteredLayout?.nodes || {}"
          :key="node.id"
          :node="node.upgrade || node"
          :position="{ x: node.x || 300, y: node.y || 100 }"
          :isSelected="selectedNode?.id === node.id"
          :isHovered="hoveredNode?.id === node.id"
          :isAvailable="node.status === 'available'"
          :isLocked="node.status === 'locked'"
          :isOwned="node.isOwned || false"
          class="pointer-events-auto"
          @click="selectNode(node)"
          @mouseenter="hoverNode(node, $event)"
          @mouseleave="clearHover"
        />
      </div>
    </div>

    <!-- Tooltip -->
    <UpgradeTooltip
      v-if="hoveredNode && tooltip.visible"
      :node="hoveredNode"
      :position="tooltip.position"
      :game-state="gameState"
    />

    <!-- Zoom Controls -->
    <div class="absolute top-4 right-4 flex flex-col space-y-2 z-10">
      <button
        @click="calculateLayout"
        class="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg border border-green-500 flex items-center justify-center transition-colors text-xs"
        title="Recalculate Layout"
      >
        🔄
      </button>
      <button
        @click="interactions.zoomIn"
        class="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 flex items-center justify-center transition-colors"
        title="Zoom In"
      >
        <span class="text-lg font-bold">+</span>
      </button>
      <button
        @click="interactions.zoomOut"
        class="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 flex items-center justify-center transition-colors"
        title="Zoom Out"
      >
        <span class="text-lg font-bold">−</span>
      </button>
      <button
        @click="interactions.resetView"
        class="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 flex items-center justify-center transition-colors text-sm"
        title="Reset View"
      >
        ⌂
      </button>
      <button
        @click="fitToView"
        class="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 flex items-center justify-center transition-colors text-xs"
        title="Fit to View"
      >
        ⤢
      </button>
    </div>

    <!-- Area Legend -->
    <div class="absolute bottom-4 right-4 bg-slate-800/95 border border-slate-600 rounded-lg p-3 z-10 max-w-xs">
      <h4 class="text-xs font-medium text-white mb-2">Areas (What it Affects)</h4>
      <div class="grid grid-cols-2 gap-1 text-xs">
        <div v-for="(area, areaId) in areaConfigs" :key="areaId" class="flex items-center space-x-1">
          <div class="w-3 h-3 rounded" :style="{ backgroundColor: area.color }"></div>
          <span class="text-slate-300">{{ area.icon }} {{ area.name }}</span>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-20"
    >
      <div class="text-white text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p>Calculating upgrade tree layout...</p>
      </div>
    </div>

    <!-- Error Overlay -->
    <div
      v-if="error"
      class="absolute inset-0 bg-red-900/80 flex items-center justify-center z-20"
    >
      <div class="text-white text-center max-w-md">
        <div class="text-red-400 text-4xl mb-4">⚠️</div>
        <h3 class="text-lg font-semibold mb-2">Error Loading Upgrade Tree</h3>
        <p class="text-sm mb-4">{{ error }}</p>
        <button
          @click="calculateLayout"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useUpgradeTree } from '@/composables/useUpgradeTree.js'
import { useUpgradeInteractions } from '@/composables/useUpgradeInteractions.js'
import { useGameValuesStore } from '@/stores/gameValues.js'
import { getSourceConfig, SOURCES, AREAS } from '@/utils/treeLayoutEngine.js'
import UpgradeTooltip from './UpgradeTooltip.vue'
import UpgradeNode from './UpgradeNodeSimple.vue'

const props = defineProps({
  interactive: {
    type: Boolean,
    default: true
  },
  editMode: {
    type: Boolean,
    default: false
  },
  selectedUpgradeId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['upgradeSelected', 'upgradeHovered', 'upgradeUnhovered'])

// Refs
const containerRef = ref(null)
const svgCanvas = ref(null)

// Composables
const {
  upgrades,
  selectedNode,
  hoveredNode,
  highlightedPath,
  isLoading,
  error,
  layout,
  filteredLayout,
  gameState,
  sourceStats,
  calculateLayout,
  selectNode: selectUpgradeNode,
  hoverNode: hoverUpgradeNode,
  clearHover,
  findPathTo
} = useUpgradeTree()

const interactions = useUpgradeInteractions(containerRef)

// Configuration for areas and sources
const areaConfigs = {
  production: { name: 'Production', color: '#10b981' },
  combat: { name: 'Combat', color: '#ef4444' },
  social: { name: 'Social', color: '#3b82f6' },
  building: { name: 'Building', color: '#f59e0b' },
  exploration: { name: 'Exploration', color: '#8b5cf6' },
  research: { name: 'Research', color: '#06b6d4' },
  economic: { name: 'Economic', color: '#84cc16' },
  other: { name: 'Other', color: '#6b7280' }
}

const sourceConfigs = {
  farm: { name: 'Farm', color: '#10b981' },
  blacksmith: { name: 'Blacksmith', color: '#ef4444' },
  agronomist: { name: 'Agronomist', color: '#84cc16' },
  landSteward: { name: 'Land Steward', color: '#f59e0b' },
  carpenter: { name: 'Carpenter', color: '#8b5cf6' },
  skillsTrainer: { name: 'Skills Trainer', color: '#06b6d4' },
  vendor: { name: 'Vendor', color: '#6b7280' },
  adventure: { name: 'Adventure', color: '#3b82f6' },
  forge: { name: 'Forge', color: '#ef4444' },
  mine: { name: 'Mine', color: '#64748b' },
  tower: { name: 'Tower', color: '#8b5cf6' }
}

// Tooltip state
const tooltip = ref({
  visible: false,
  position: { x: 0, y: 0 }
})

// Computed properties for safe tier calculations
const maxTier = computed(() => {
  const nodes = Object.values(filteredLayout.value?.nodes || {})
  if (nodes.length === 0) return 0
  return Math.max(...nodes.map(n => n.tier || 0))
})

const maxTierRange = computed(() => {
  const max = maxTier.value
  if (max < 0) return []
  return Array.from({ length: max + 1 }, (_, i) => i)
})

/**
 * Select a node and emit event
 */
const selectNode = (node) => {
  selectUpgradeNode(node)
  emit('upgradeSelected', node.upgrade)
}

/**
 * Handle node hover
 */
const hoverNode = (node, event) => {
  hoverUpgradeNode(node)
  
  // Update tooltip position
  tooltip.value.visible = true
  tooltip.value.position = {
    x: event.clientX + 10,
    y: event.clientY - 10
  }
  
  emit('upgradeHovered', node.upgrade)
}

/**
 * Handle hover end
 */
const handleClearHover = () => {
  clearHover()
  tooltip.value.visible = false
  emit('upgradeUnhovered')
}



/**
 * Format category name for display
 */
const formatCategoryName = (category) => {
  const names = {
    energy: 'Energy',
    water: 'Water',
    storage: 'Storage',
    materials: 'Materials',
    deeds: 'Deeds',
    tools: 'Tools',
    weapons: 'Weapons',
    forge: 'Forge',
    tower: 'Tower',
    housing: 'Housing',
    hero: 'Hero'
  }
  return names[category] || category
}

/**
 * Get upgrade icon
 */
const getUpgradeIcon = (upgrade) => {
  if (upgrade.icon) return upgrade.icon
  
  // Default icons by category
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
    hero: '🧙'
  }
  return icons[upgrade.category] || '📋'
}

/**
 * Truncate name for display
 */
const truncateName = (name) => {
  return name.length > 15 ? name.substring(0, 12) + '...' : name
}

/**
 * Get node background color based on area (what the upgrade affects)
 */
const getNodeBackground = (node) => {
  // Get area color from the node or upgrade data
  const areaColor = node.nodeColor || getAreaColor(node.upgrade?.category) || '#6b7280'
  
  // Modify based on status
  if (node.isOwned) return '#10b981' // Green for owned
  if (node.status === 'available') {
    return node.canAfford ? areaColor : '#6b7280' // Area color if affordable, gray if not
  }
  if (node.status === 'farm_locked') return '#8b5cf6' // Purple
  if (node.status === 'prerequisite_missing') return '#ef4444' // Red
  
  // Use dimmed area color for other states
  return adjustColorOpacity(areaColor, 0.7)
}

/**
 * Get node border color
 */
const getNodeBorder = (node) => {
  if (node.isSelected) return '#fbbf24' // Gold for selected
  if (node.isHighlighted) return '#fbbf24' // Gold for highlighted
  return '#ffffff' // White default
}

/**
 * Get node border width
 */
const getNodeBorderWidth = (node) => {
  if (node.isSelected || node.isHighlighted) return 3
  return 1
}

/**
 * Get area color based on category
 */
const getAreaColor = (category) => {
  return areaConfigs[category]?.color || '#6b7280'
}

/**
 * Adjust color opacity
 */
const adjustColorOpacity = (hexColor, opacity) => {
  // Convert hex to RGB, then apply opacity
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Get source stats string
 */
const getSourceStats = (sourceId) => {
  const stats = sourceStats.value[sourceId]
  if (!stats) return '0/0'
  return `${stats.owned}/${stats.total}`
}

/**
 * Get node opacity
 */
const getNodeOpacity = (node) => {
  if (node.isOwned) return 0.9
  if (node.status === 'available') return 0.8
  return 0.6
}

/**
 * Get status indicator color
 */
const getStatusColor = (status) => {
  const colors = {
    owned: '#10b981',
    available: '#f59e0b',
    prerequisite_missing: '#ef4444',
    farm_locked: '#8b5cf6',
    tool_locked: '#ec4899'
  }
  return colors[status] || '#6b7280'
}

/**
 * Get node CSS classes
 */
const getNodeClasses = (node) => {
  return {
    'owned': node.isOwned,
    'available': node.status === 'available',
    'locked': node.status !== 'available' && !node.isOwned,
    'selected': node.isSelected,
    'highlighted': node.isHighlighted,
    'hovered': node.isHovered
  }
}

/**
 * Get edge opacity
 */
const getEdgeOpacity = (edge) => {
  // Highlight edges in the critical path
  return isEdgeHighlighted(edge) ? 1.0 : 0.4
}

/**
 * Check if edge is highlighted
 */
const isEdgeHighlighted = (edge) => {
  return highlightedPath.value.includes(edge.from) && highlightedPath.value.includes(edge.to)
}

/**
 * Fit view to show all content
 */
const fitToView = () => {
  if (!layout.value) return
  
  const bounds = {
    x: 0,
    y: 0,
    width: layout.value.dimensions.width,
    height: layout.value.dimensions.height
  }
  
  interactions.fitToContent(bounds)
}

/**
 * Handle keyboard shortcuts
 */
const handleGlobalKeyDown = (event) => {
  // Only handle if this component has focus or no input is focused
  if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
    return
  }
  
  interactions.handleKeyDown(event)
}

// Watch for external selection changes
watch(() => props.selectedUpgradeId, (newId) => {
  if (newId && layout.value?.nodes[newId]) {
    selectNode(layout.value.nodes[newId])
  }
})

// Watch for game data loading
watch(() => gameState.value, (newGameState) => {
  console.log('🔍 Game state changed, triggering layout recalculation')
  calculateLayout()
}, { deep: true })

// Also watch for upgrades data loading
const gameValuesStore = useGameValuesStore()
watch(() => gameValuesStore.isLoaded, (isLoaded) => {
  if (isLoaded) {
    console.log('🔍 Game data loaded, triggering layout calculation')
    nextTick(() => {
      calculateLayout()
    })
  }
})

// Lifecycle
onMounted(() => {
  // Focus container for keyboard events
  if (containerRef.value) {
    containerRef.value.focus()
  }
  
  // Add global keyboard listener
  document.addEventListener('keydown', handleGlobalKeyDown)
  
  // Debug: Log the current game state and upgrades
  console.log('🔍 UpgradeTreeVisualization mounted')
  console.log('📊 Game state:', gameState.value)
  console.log('📋 Layout:', layout.value)
  console.log('🔧 Filtered layout:', filteredLayout.value)
  console.log('🔍 TRACKING: Upgrades from useUpgradeTree:', {
    upgradesType: typeof upgrades.value,
    upgradesIsArray: Array.isArray(upgrades.value),
    upgradesKeys: Object.keys(upgrades.value || {}).slice(0, 5),
    upgradesCount: Object.keys(upgrades.value || {}).length,
    firstUpgrade: Object.values(upgrades.value || {})[0]
  })
  
  // Initial calculation
  nextTick(() => {
    calculateLayout()
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeyDown)
})
</script>

<style scoped>
.upgrade-node {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.upgrade-node:hover {
  filter: drop-shadow(0 8px 15px rgba(0, 0, 0, 0.3));
}

.upgrade-node.selected {
  filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.5));
}

.upgrade-node.highlighted {
  filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.4));
}

.connections path.highlighted {
  stroke-width: 3 !important;
  opacity: 1 !important;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
}

/* Smooth transitions */
.upgrade-node,
.connections path {
  transition: all 0.2s ease-in-out;
}

/* Focus outline for accessibility */
.upgrade-node:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
