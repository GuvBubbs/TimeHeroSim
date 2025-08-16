<template>
  <div class="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
    <!-- Scrollable Container -->
    <div 
      ref="scrollContainer"
      class="overflow-x-auto overflow-y-auto h-full"
      @wheel.prevent="handleWheel"
    >
      <!-- SVG Canvas for Upgrade Tree -->
      <svg
        ref="svgCanvas"
        :width="canvasWidth * zoomLevel"
        :height="canvasHeight * zoomLevel"
        :style="{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }"
      >
        <!-- Grid Background -->
        <defs>
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
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Phase Headers -->
        <g v-for="(phase, index) in phases" :key="phase.name">
          <rect
            :x="phase.x"
            y="0"
            :width="phase.width"
            height="40"
            fill="#1e293b"
            stroke="#475569"
            stroke-width="1"
          />
          <text
            :x="phase.x + phase.width / 2"
            y="25"
            fill="#94a3b8"
            font-size="14"
            font-weight="bold"
            text-anchor="middle"
          >
            {{ phase.name }}
          </text>
        </g>

        <!-- Swim Lane Labels and Backgrounds -->
        <g v-for="(lane, index) in swimLanes" :key="lane.id">
          <!-- Lane Background -->
          <rect
            x="0"
            :y="lane.y"
            :width="canvasWidth"
            :height="lane.height"
            :fill="index % 2 === 0 ? '#0f172a' : '#1e293b'"
            opacity="0.5"
          />
          
          <!-- Lane Label -->
          <rect
            x="0"
            :y="lane.y"
            width="150"
            :height="lane.height"
            fill="#1e293b"
            stroke="#475569"
            stroke-width="1"
          />
          <text
            x="75"
            :y="lane.y + lane.height / 2 + 5"
            fill="#e2e8f0"
            font-size="12"
            font-weight="bold"
            text-anchor="middle"
          >
            {{ lane.name }}
          </text>
        </g>

        <!-- Connections between upgrades -->
        <g class="connections">
          <path
            v-for="connection in connections"
            :key="`${connection.from}-${connection.to}`"
            :d="connection.path"
            fill="none"
            :stroke="connection.color"
            stroke-width="2"
            opacity="0.4"
            marker-end="url(#arrowhead)"
          />
        </g>

        <!-- Arrow marker definition -->
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill="#6366f1"
            />
          </marker>
        </defs>

        <!-- Upgrade Nodes -->
        <g class="upgrade-nodes">
          <g
            v-for="upgrade in upgradeNodes"
            :key="upgrade.id"
            :transform="`translate(${upgrade.x}, ${upgrade.y})`"
            class="upgrade-node cursor-pointer"
            @click="selectUpgrade(upgrade)"
            @mouseenter="showTooltip(upgrade, $event)"
            @mouseleave="hideTooltip"
          >
            <!-- Node Background -->
            <rect
              :width="nodeWidth"
              :height="nodeHeight"
              rx="6"
              :fill="getCategoryColor(upgrade.category)"
              stroke="white"
              stroke-width="1"
              opacity="0.9"
            />

            <!-- Upgrade Icon -->
            <text
              :x="nodeWidth / 2"
              y="20"
              text-anchor="middle"
              font-size="16"
            >
              {{ upgrade.icon }}
            </text>

            <!-- Upgrade Name -->
            <text
              :x="nodeWidth / 2"
              y="35"
              text-anchor="middle"
              fill="white"
              font-size="9"
              font-weight="600"
            >
              {{ truncateName(upgrade.name) }}
            </text>

            <!-- Cost Information -->
            <text
              :x="nodeWidth / 2"
              y="48"
              text-anchor="middle"
              fill="#e2e8f0"
              font-size="7"
              opacity="0.9"
            >
              {{ formatCost(upgrade) }}
            </text>
          </g>
        </g>
      </svg>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      class="absolute z-20 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl pointer-events-none"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <h3 class="font-medium text-white mb-2">{{ tooltip.upgrade?.name }}</h3>
      <div class="text-sm text-slate-300 mb-2">{{ tooltip.upgrade?.description || tooltip.upgrade?.effect }}</div>
      <div class="text-xs text-slate-400">
        <div>Cost: {{ formatFullCost(tooltip.upgrade) }}</div>
        <div>Source: {{ getUpgradeSource(tooltip.upgrade) }}</div>
        <div>Phase: {{ getUpgradePhase(tooltip.upgrade) }}</div>
      </div>
    </div>

    <!-- Zoom Controls -->
    <div class="absolute top-4 right-4 flex flex-col space-y-2 z-10">
      <button
        @click="zoomIn"
        class="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-600 flex items-center justify-center"
      >
        +
      </button>
      <button
        @click="zoomOut"
        class="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-600 flex items-center justify-center"
      >
        −
      </button>
      <button
        @click="resetZoom"
        class="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-600 flex items-center justify-center text-xs"
      >
        ⌂
      </button>
    </div>

    <!-- Legend -->
    <div class="absolute bottom-4 left-4 bg-slate-800/95 border border-slate-600 rounded-lg p-3 z-10">
      <h4 class="text-xs font-medium text-white mb-2">Categories</h4>
      <div class="space-y-1 text-xs">
        <div v-for="cat in categoryList" :key="cat.id" class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded" :style="{ backgroundColor: cat.color }"></div>
          <span class="text-slate-300">{{ cat.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useGameValuesStore } from '../stores/gameValues.js'

const props = defineProps({
  interactive: {
    type: Boolean,
    default: true
  },
  editMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['upgradeSelected', 'upgradeEdited'])

const gameValues = useGameValuesStore()

// Canvas dimensions
const canvasWidth = ref(2000) // Wide canvas for horizontal scrolling
const canvasHeight = ref(800)
const nodeWidth = 100
const nodeHeight = 55
const nodeSpacing = 15 // Space between nodes
const laneStartY = 50 // Start below phase headers

// Zoom state
const zoomLevel = ref(1)
const scrollContainer = ref(null)

// Tooltip state
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  upgrade: null
})

// Phase definitions with dynamic widths
const phases = ref([
  { name: 'Tutorial', x: 150, width: 200 },
  { name: 'Early', x: 350, width: 300 },
  { name: 'Mid', x: 650, width: 400 },
  { name: 'Late', x: 1050, width: 400 },
  { name: 'Endgame', x: 1450, width: 550 }
])

// Source-based swim lanes
const sourceDefinitions = {
  'town': { name: 'Town (Blueprints)', icon: '🏪' },
  'home': { name: 'Home (Energy)', icon: '🏠' },
  'forge': { name: 'Forge', icon: '🔨' },
  'mine': { name: 'Mines', icon: '⛏️' },
  'adventure': { name: 'Adventures', icon: '⚔️' },
  'tower': { name: 'Tower', icon: '🗼' },
  'other': { name: 'Other', icon: '❓' }
}

// Category colors for visual distinction
const categoryColors = {
  'storage': '#8b5cf6', // purple
  'water': '#06b6d4', // cyan
  'infrastructure': '#10b981', // emerald
  'farm': '#10b981', // emerald
  'tools': '#3b82f6', // blue
  'tower': '#f59e0b', // amber
  'forge': '#ef4444', // red
  'helper': '#ec4899', // pink
  'automation': '#ec4899', // pink
  'combat': '#dc2626', // red
  'mining': '#6b7280' // gray
}

// Computed category list for legend
const categoryList = computed(() => {
  const categories = new Set()
  Object.values(gameValues.upgrades || {}).forEach(upgrade => {
    if (upgrade.category) categories.add(upgrade.category)
  })
  
  return Array.from(categories).map(cat => ({
    id: cat,
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    color: categoryColors[cat] || '#6b7280'
  }))
})

// Compute swim lanes based on upgrades
const swimLanes = computed(() => {
  const lanes = {}
  const laneHeight = nodeHeight + 30 // Node height plus padding
  
  // Group upgrades by source
  const upgradesBySource = {}
  Object.entries(gameValues.upgrades || {}).forEach(([id, upgrade]) => {
    const source = getUpgradeSource(upgrade)
    if (!upgradesBySource[source]) {
      upgradesBySource[source] = []
    }
    upgradesBySource[source].push({ id, ...upgrade })
  })
  
  // Create lanes with dynamic heights
  let currentY = laneStartY
  Object.keys(sourceDefinitions).forEach(sourceId => {
    const upgrades = upgradesBySource[sourceId] || []
    const height = Math.max(laneHeight, upgrades.length > 0 ? laneHeight : laneHeight)
    
    lanes[sourceId] = {
      id: sourceId,
      name: sourceDefinitions[sourceId].name,
      y: currentY,
      height: height,
      upgrades: upgrades
    }
    
    currentY += height
  })
  
  // Update canvas height based on lanes
  canvasHeight.value = currentY + 50
  
  return Object.values(lanes)
})

// Computed upgrade nodes with positioning
const upgradeNodes = computed(() => {
  if (!gameValues.upgrades) return []
  
  const nodes = []
  const positionMap = {} // Track positions to avoid overlaps
  
  swimLanes.value.forEach(lane => {
    let xOffset = 0 // Track horizontal position within each lane
    
    // Sort upgrades by unlock day/phase
    const sortedUpgrades = [...lane.upgrades].sort((a, b) => {
      const dayA = a.unlockDay || 0
      const dayB = b.unlockDay || 0
      return dayA - dayB
    })
    
    sortedUpgrades.forEach(upgrade => {
      const phase = getUpgradePhase(upgrade)
      const phaseData = phases.value.find(p => p.name.toLowerCase() === phase)
      
      if (phaseData) {
        // Calculate x position within phase
        const baseX = phaseData.x + 10 + xOffset
        const x = Math.min(baseX, phaseData.x + phaseData.width - nodeWidth - 10)
        
        // Calculate y position (center in lane)
        const y = lane.y + (lane.height - nodeHeight) / 2
        
        nodes.push({
          ...upgrade,
          x: x,
          y: y,
          phase: phase,
          source: lane.id,
          icon: getUpgradeIcon(upgrade),
          category: upgrade.category || 'other'
        })
        
        // Increment x offset for next node
        xOffset += nodeWidth + nodeSpacing
        
        // Reset offset if we've moved to a new phase
        if (xOffset > phaseData.width - nodeWidth) {
          xOffset = 0
        }
      }
    })
  })
  
  return nodes
})

// Computed connections between upgrades
const connections = computed(() => {
  const conns = []
  
  // This would need to be populated from actual prerequisite data
  // For now, return empty array
  
  return conns
})

// Helper functions
function getUpgradeSource(upgrade) {
  // Determine source based on upgrade properties
  const name = (upgrade.name || '').toLowerCase()
  const category = (upgrade.category || '').toLowerCase()
  
  // Town blueprints (most upgrades are bought as blueprints)
  if (category === 'storage' || category === 'water' || category === 'infrastructure') {
    return 'town'
  }
  
  // Tower upgrades
  if (category === 'tower' || name.includes('tower') || name.includes('floor') || name.includes('catcher')) {
    return 'tower'
  }
  
  // Forge items
  if (category === 'forge' || category === 'tools' || name.includes('anvil') || name.includes('bellows')) {
    return 'forge'
  }
  
  // Home/Farm upgrades (energy-based)
  if (name.includes('till') || name.includes('clear') || name.includes('expand') || name.includes('cleanup')) {
    return 'home'
  }
  
  // Mine discoveries
  if (category === 'helper' || name.includes('gnome') || name.includes('golem')) {
    return 'mine'
  }
  
  // Adventure rewards
  if (category === 'combat' || name.includes('weapon') || name.includes('armor')) {
    return 'adventure'
  }
  
  // Default to town
  return 'town'
}

function getUpgradePhase(upgrade) {
  // Determine phase based on unlock day or cost
  const unlockDay = upgrade.unlockDay || 0
  const goldCost = upgrade.goldCost || upgrade.cost?.gold || 0
  
  if (unlockDay <= 1 || goldCost <= 100) return 'tutorial'
  if (unlockDay <= 3 || goldCost <= 1000) return 'early'
  if (unlockDay <= 7 || goldCost <= 10000) return 'mid'
  if (unlockDay <= 14 || goldCost <= 100000) return 'late'
  return 'endgame'
}

function getCategoryColor(category) {
  return categoryColors[category] || '#6b7280'
}

function getUpgradeIcon(upgrade) {
  const name = (upgrade.name || '').toLowerCase()
  const category = (upgrade.category || '').toLowerCase()
  
  // Category-based icons
  if (category === 'storage') return '📦'
  if (category === 'water') return '💧'
  if (category === 'tower') return '🗼'
  if (category === 'forge') return '🔨'
  if (category === 'tools') return '🔧'
  if (category === 'helper' || category === 'automation') return '🤖'
  if (category === 'combat') return '⚔️'
  if (category === 'mining') return '⛏️'
  if (category === 'farm' || category === 'infrastructure') return '🌱'
  
  // Name-based fallbacks
  if (name.includes('seed')) return '🌰'
  if (name.includes('water')) return '💧'
  if (name.includes('auto')) return '🤖'
  
  return '⚙️'
}

function truncateName(name) {
  if (!name) return ''
  // Remove common prefixes/suffixes for cleaner display
  name = name.replace(/Storage |Shed |Tank |Pump |Upgrade |Floor /g, '')
  if (name.length > 12) {
    return name.substring(0, 11) + '...'
  }
  return name
}

function formatCost(upgrade) {
  if (!upgrade) return ''
  const goldCost = upgrade.goldCost || upgrade.cost?.gold || 0
  const energyCost = upgrade.energyCost || upgrade.cost?.energy || 0
  
  const parts = []
  if (goldCost) parts.push(`${goldCost}g`)
  if (energyCost) parts.push(`${energyCost}e`)
  
  return parts.join(' ') || 'Free'
}

function formatFullCost(upgrade) {
  if (!upgrade) return 'Free'
  
  const costs = []
  if (upgrade.goldCost) costs.push(`${upgrade.goldCost} gold`)
  if (upgrade.energyCost) costs.push(`${upgrade.energyCost} energy`)
  if (upgrade.stoneCost) costs.push(`${upgrade.stoneCost} stone`)
  if (upgrade.copperCost) costs.push(`${upgrade.copperCost} copper`)
  if (upgrade.ironCost) costs.push(`${upgrade.ironCost} iron`)
  if (upgrade.silverCost) costs.push(`${upgrade.silverCost} silver`)
  if (upgrade.crystalCost) costs.push(`${upgrade.crystalCost} crystal`)
  if (upgrade.mythrilCost) costs.push(`${upgrade.mythrilCost} mythril`)
  
  return costs.length > 0 ? costs.join(', ') : 'Free'
}

// Interaction methods
function selectUpgrade(upgrade) {
  if (props.interactive) {
    emit('upgradeSelected', upgrade)
  }
}

function showTooltip(upgrade, event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const containerRect = scrollContainer.value.getBoundingClientRect()
  
  tooltip.value = {
    visible: true,
    x: rect.left - containerRect.left + rect.width + 10,
    y: rect.top - containerRect.top,
    upgrade
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}

function handleWheel(event) {
  if (event.ctrlKey || event.metaKey) {
    // Zoom with Ctrl/Cmd + scroll
    event.preventDefault()
    if (event.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  } else if (event.shiftKey) {
    // Horizontal scroll with Shift + scroll
    event.preventDefault()
    scrollContainer.value.scrollLeft += event.deltaY
  }
}

function zoomIn() {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 2)
}

function zoomOut() {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.5)
}

function resetZoom() {
  zoomLevel.value = 1
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft = 0
    scrollContainer.value.scrollTop = 0
  }
}

onMounted(() => {
  // Ensure container is scrollable
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollLeft = 0
    }
  })
})
</script>

<style scoped>
/* Custom scrollbar styles */
.overflow-x-auto::-webkit-scrollbar,
.overflow-y-auto::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track,
.overflow-y-auto::-webkit-scrollbar-track {
  background: #1e293b;
}

.overflow-x-auto::-webkit-scrollbar-thumb,
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover,
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
