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

        <!-- Vendor Section Headers -->
        <g v-for="(section, vendorId) in layout?.vendorSections" :key="vendorId">
          <rect
            x="0"
            :y="section.y"
            :width="layout.dimensions.width"
            height="50"
            :fill="getVendorConfig(vendorId).color"
            opacity="0.1"
            stroke="#475569"
            stroke-width="1"
          />
          
          <!-- Vendor Header -->
          <rect
            x="0"
            :y="section.y"
            width="180"
            height="50"
            :fill="getVendorConfig(vendorId).color"
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
            {{ getVendorStats(vendorId) }}
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

        <!-- Upgrade Nodes -->
        <g class="upgrade-nodes">
          <g
            v-for="node in filteredLayout?.nodes || {}"
            :key="node.id"
            :transform="`translate(${node.x}, ${node.y})`"
            class="upgrade-node cursor-pointer transition-all duration-200"
            :class="getNodeClasses(node)"
            @click="selectNode(node)"
            @mouseenter="hoverNode(node, $event)"
            @mouseleave="clearHover"
          >
            <!-- Node Background -->
            <rect
              :width="node.width"
              :height="node.height"
              rx="8"
              :fill="getNodeBackground(node)"
              :stroke="getNodeBorder(node)"
              :stroke-width="getNodeBorderWidth(node)"
              :opacity="getNodeOpacity(node)"
              class="transition-all duration-200"
            />

            <!-- Status Indicator -->
            <circle
              v-if="node.status !== 'available'"
              :cx="node.width - 8"
              :cy="8"
              r="6"
              :fill="getStatusColor(node.status)"
              stroke="white"
              stroke-width="1"
            />

            <!-- Upgrade Icon -->
            <text
              :x="node.width / 2"
              y="22"
              text-anchor="middle"
              font-size="18"
              class="pointer-events-none select-none"
            >
              {{ getUpgradeIcon(node.upgrade) }}
            </text>

            <!-- Upgrade Name -->
            <text
              :x="node.width / 2"
              y="38"
              text-anchor="middle"
              fill="white"
              font-size="10"
              font-weight="600"
              class="pointer-events-none select-none"
            >
              {{ truncateName(node.upgrade.name) }}
            </text>

            <!-- Cost Information -->
            <text
              :x="node.width / 2"
              y="52"
              text-anchor="middle"
              fill="#e2e8f0"
              font-size="8"
              opacity="0.9"
              class="pointer-events-none select-none"
            >
              {{ node.formattedCost }}
            </text>

            <!-- Time to Afford (if not owned) -->
            <text
              v-if="!node.isOwned && node.status === 'available'"
              :x="node.width / 2"
              :y="node.height - 4"
              text-anchor="middle"
              :fill="node.canAfford ? '#10b981' : '#f59e0b'"
              font-size="7"
              class="pointer-events-none select-none"
            >
              {{ node.timeToAfford.timeFormatted }}
            </text>

            <!-- Highlight Overlay -->
            <rect
              v-if="node.isHighlighted"
              :width="node.width"
              :height="node.height"
              rx="8"
              fill="none"
              stroke="#fbbf24"
              stroke-width="3"
              opacity="0.8"
              class="pointer-events-none"
            />
          </g>
        </g>
      </svg>
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

    <!-- Vendor Legend -->
    <div class="absolute bottom-4 left-4 bg-slate-800/95 border border-slate-600 rounded-lg p-3 z-10 max-w-xs">
      <h4 class="text-xs font-medium text-white mb-2">Vendors</h4>
      <div class="space-y-1 text-xs">
        <div v-for="(vendor, vendorId) in vendorStats" :key="vendorId" class="flex items-center justify-between space-x-2">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded" :style="{ backgroundColor: vendor.color }"></div>
            <span class="text-slate-300">{{ vendor.icon }} {{ vendor.name }}</span>
          </div>
          <span class="text-slate-400">{{ vendor.owned }}/{{ vendor.total }}</span>
        </div>
      </div>
    </div>

    <!-- Status Legend -->
    <div class="absolute bottom-4 right-4 bg-slate-800/95 border border-slate-600 rounded-lg p-3 z-10">
      <h4 class="text-xs font-medium text-white mb-2">Status</h4>
      <div class="space-y-1 text-xs">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <span class="text-slate-300">Owned</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span class="text-slate-300">Available</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <span class="text-slate-300">Prerequisites Missing</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-purple-500"></div>
          <span class="text-slate-300">Farm Stage Locked</span>
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
import { getVendorConfig } from '@/utils/treeLayoutEngine.js'
import UpgradeTooltip from './UpgradeTooltip.vue'

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
  selectedNode,
  hoveredNode,
  highlightedPath,
  isLoading,
  error,
  layout,
  filteredLayout,
  gameState,
  vendorStats,
  calculateLayout,
  selectNode: selectUpgradeNode,
  hoverNode: hoverUpgradeNode,
  clearHover,
  findPathTo
} = useUpgradeTree()

const interactions = useUpgradeInteractions(containerRef)

// Tooltip state
const tooltip = ref({
  visible: false,
  position: { x: 0, y: 0 }
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
 * Get vendor statistics display string
 */
const getVendorStats = (vendorId) => {
  const stats = vendorStats.value[vendorId]
  if (!stats) return ''
  
  const percentage = Math.round(stats.completionPercentage)
  return `${stats.owned}/${stats.total} (${percentage}%)`
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
 * Get node background color
 */
const getNodeBackground = (node) => {
  if (node.isOwned) return '#10b981' // Green for owned
  if (node.status === 'available') {
    return node.canAfford ? '#f59e0b' : '#6b7280' // Yellow if affordable, gray if not
  }
  if (node.status === 'farm_locked') return '#8b5cf6' // Purple
  if (node.status === 'prerequisite_missing') return '#ef4444' // Red
  return '#6b7280' // Gray default
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

// Lifecycle
onMounted(() => {
  // Focus container for keyboard events
  if (containerRef.value) {
    containerRef.value.focus()
  }
  
  // Add global keyboard listener
  document.addEventListener('keydown', handleGlobalKeyDown)
  
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
