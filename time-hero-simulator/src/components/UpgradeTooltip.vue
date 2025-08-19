<template>
  <Teleport to="body">
    <div
      :style="tooltipStyle"
      class="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 max-w-sm pointer-events-none"
    >
      <!-- Header -->
      <div class="flex items-center space-x-2 mb-3">
        <span class="text-lg">{{ getUpgradeIcon(node) }}</span>
        <h3 class="font-semibold text-white">{{ node.name }}</h3>
      </div>

      <!-- Description -->
      <p v-if="node.description" class="text-slate-300 text-sm mb-3">
        {{ node.description }}
      </p>

      <!-- Source & Category -->
      <div class="flex items-center justify-between text-xs text-slate-400 mb-3">
        <span>{{ getVendorName(node.vendor || node.source) }}</span>
        <span>{{ formatCategory(node.category) }}</span>
      </div>

      <!-- Cost Breakdown -->
      <div v-if="node.costs" class="mb-3">
        <h4 class="text-xs font-medium text-slate-300 mb-2">Cost</h4>
        <div class="space-y-1">
          <!-- Gold Cost -->
          <div v-if="node.costs.gold && node.costs.gold > 0" class="flex justify-between text-sm">
            <span class="text-yellow-400">💰 Gold</span>
            <span class="text-slate-300">{{ formatNumber(node.costs.gold) }}</span>
          </div>

          <!-- Energy Cost -->
          <div v-if="node.costs.energy && node.costs.energy > 0" class="flex justify-between text-sm">
            <span class="text-blue-400">⚡ Energy</span>
            <span class="text-slate-300">{{ formatNumber(node.costs.energy) }}</span>
          </div>

          <!-- Material Costs -->
          <div v-for="(amount, material) in node.costs.materials || {}" :key="material" class="flex justify-between text-sm">
            <span class="text-amber-400">🧱 {{ formatMaterialName(material) }}</span>
            <span class="text-slate-300">{{ formatNumber(amount) }}</span>
          </div>

          <!-- Boss Material Costs -->
          <div v-for="(amount, bossMaterial) in node.costs.bossMaterials || {}" :key="bossMaterial" class="flex justify-between text-sm">
            <span class="text-purple-400">👑 {{ formatBossMaterialName(bossMaterial) }}</span>
            <span class="text-slate-300">{{ formatNumber(amount) }}</span>
          </div>
        </div>
      </div>

      <!-- Effects -->
      <div v-if="node.effect" class="mb-3">
        <h4 class="text-xs font-medium text-slate-300 mb-2">Effect</h4>
        <p class="text-sm text-slate-300">{{ node.effect }}</p>
      </div>

      <!-- Prerequisites -->
      <div v-if="hasPrerequisites" class="mb-3">
        <h4 class="text-xs font-medium text-slate-300 mb-2">Prerequisites</h4>
        <div class="space-y-1">
          <!-- Upgrade Prerequisites -->
          <div v-for="prereqId in prerequisites.upgrades" :key="prereqId" class="flex items-center space-x-2 text-sm">
            <span class="text-slate-400">•</span>
            <span class="text-slate-300">{{ getUpgradeName(prereqId) }}</span>
          </div>

          <!-- Farm Stage Prerequisites -->
          <div v-for="stage in prerequisites.farmStages" :key="stage" class="flex items-center space-x-2 text-sm">
            <span class="text-slate-400">•</span>
            <span class="text-slate-300">Farm Stage {{ stage }}</span>
          </div>

          <!-- Tool Prerequisites -->
          <div v-for="toolId in prerequisites.tools" :key="toolId" class="flex items-center space-x-2 text-sm">
            <span class="text-slate-400">•</span>
            <span class="text-slate-300">{{ getToolName(toolId) }}</span>
          </div>

          <!-- Building Prerequisites -->
          <div v-for="buildingId in prerequisites.buildings" :key="buildingId" class="flex items-center space-x-2 text-sm">
            <span class="text-slate-400">•</span>
            <span class="text-slate-300">{{ getBuildingName(buildingId) }}</span>
          </div>
        </div>
      </div>

      <!-- Raw Data Info -->
      <div v-if="node.id" class="mt-3 pt-3 border-t border-slate-700">
        <h4 class="text-xs font-medium text-slate-300 mb-2">Data Info</h4>
        <div class="text-xs text-slate-400 space-y-1">
          <div>ID: {{ node.id }}</div>
          <div v-if="node.type">Type: {{ node.type }}</div>
          <div v-if="node.tier !== undefined">Tier: {{ node.tier }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { parsePrerequisites } from '@/utils/upgradePrerequisites.js'
import { getSourceConfig } from '@/utils/treeLayoutEngine.js'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  position: {
    type: Object,
    required: true
  },
  gameState: {
    type: Object,
    required: true
  }
})

/**
 * Tooltip positioning style
 */
const tooltipStyle = computed(() => {
  const { x, y } = props.position
  
  // Adjust position to keep tooltip on screen
  const adjustedX = Math.min(x, window.innerWidth - 400)
  const adjustedY = Math.max(y - 50, 20)
  
  return {
    left: `${adjustedX}px`,
    top: `${adjustedY}px`
  }
})

/**
 * Parse prerequisites from upgrade
 */
const prerequisites = computed(() => {
  if (!props.node.prerequisites) {
    return { upgrades: [], farmStages: [], tools: [], buildings: [] }
  }
  
  return parsePrerequisites(props.node.prerequisites)
})

/**
 * Check if upgrade has any prerequisites
 */
const hasPrerequisites = computed(() => {
  const prereqs = prerequisites.value
  return prereqs.upgrades.length > 0 || 
         prereqs.farmStages.length > 0 || 
         prereqs.tools.length > 0 || 
         prereqs.buildings.length > 0
})

/**
 * Get upgrade icon
 */
const getUpgradeIcon = (upgrade) => {
  if (upgrade.icon) return upgrade.icon
  
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
 * Get source display name  
 */
const getVendorName = (vendorId) => {
  const source = getSourceConfig(vendorId)
  return source ? `${source.icon} ${source.name}` : vendorId
}

/**
 * Format category name
 */
const formatCategory = (category) => {
  if (!category || typeof category !== 'string') {
    return 'Unknown'
  }
  return category.charAt(0).toUpperCase() + category.slice(1)
}

/**
 * Format numbers with appropriate suffixes
 */
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Format material names for display
 */
const formatMaterialName = (materialId) => {
  const names = {
    stone: 'Stone',
    iron: 'Iron',
    wood: 'Wood',
    coal: 'Coal',
    silver: 'Silver',
    gold_ore: 'Gold Ore'
  }
  return names[materialId] || materialId
}

/**
 * Format boss material names for display
 */
const formatBossMaterialName = (bossMaterialId) => {
  const names = {
    dragon_scale: 'Dragon Scale',
    phoenix_feather: 'Phoenix Feather',
    kraken_ink: 'Kraken Ink',
    titan_core: 'Titan Core'
  }
  return names[bossMaterialId] || bossMaterialId
}

/**
 * Get upgrade name by ID
 */
const getUpgradeName = (upgradeId) => {
  // This would need access to the full upgrade list
  // For now, return the ID as fallback
  return upgradeId
}

/**
 * Get tool name by ID
 */
const getToolName = (toolId) => {
  const names = {
    basic_hoe: 'Basic Hoe',
    iron_hoe: 'Iron Hoe',
    steel_hoe: 'Steel Hoe'
  }
  return names[toolId] || toolId
}

/**
 * Get building name by ID
 */
const getBuildingName = (buildingId) => {
  const names = {
    barn: 'Barn',
    silo: 'Silo',
    warehouse: 'Warehouse'
  }
  return names[buildingId] || buildingId
}
</script>

<style scoped>
/* Custom scrollbar for overflow content */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #475569;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #64748b;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>