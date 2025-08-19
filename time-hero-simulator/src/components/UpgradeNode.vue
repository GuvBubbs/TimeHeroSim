<template>
  <div
    class="upgrade-node-card"
    :class="[
      `source-${node.source}`,
      `area-${node.area}`,
      {
        'node-available': isAvailable,
        'node-locked': isLocked,
        'node-owned': isOwned,
        'node-selected': isSelected,
        'node-hovered': isHovered,
        'node-placeholder': node.isPlaceholder
      }
    ]"
    :style="cardStyle"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Card Header -->
    <div class="card-header">
      <div class="node-icon">
        {{ areaIcon }}
      </div>
      <div class="node-status">
        <div v-if="isOwned" class="status-badge owned">✓</div>
        <div v-else-if="isAvailable" class="status-badge available">⚡</div>
        <div v-else class="status-badge locked">🔒</div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="card-body">
      <h3 class="node-title">{{ node.name || node.id }}</h3>
      <p class="node-description">{{ truncatedDescription }}</p>
    </div>

    <!-- Card Footer -->
    <div class="card-footer">
      <div class="cost-display" v-if="!isOwned">
        <span class="cost-item" v-for="(cost, resource) in displayCosts" :key="resource">
          {{ cost }} {{ resourceIcon(resource) }}
        </span>
      </div>
      <div class="source-label">{{ sourceLabel }}</div>
    </div>

    <!-- Prerequisites indicator -->
    <div v-if="hasPrerequisites" class="prerequisites-indicator">
      <span class="prereq-count">{{ prerequisiteCount }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SOURCES, AREAS } from '@/utils/treeLayoutEngine.js'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isHovered: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: true
  },
  isOwned: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'mouseenter', 'mouseleave'])

// Card positioning
const cardStyle = computed(() => ({
  transform: `translate(${props.position.x}px, ${props.position.y}px)`,
  position: 'absolute'
}))

// Area-based icon mapping
const areaIcon = computed(() => {
  // Special icon for placeholder nodes
  if (props.node.isPlaceholder) {
    return '📋'
  }
  
  const areaIcons = {
    energy: '⚡',
    water: '💧',
    forge: '🔨',
    hero: '🗡️',
    housing: '🏠',
    tower: '🗼',
    storage: '📦',
    materials: '⛏️',
    deeds: '📜'
  }
  return areaIcons[props.node.area] || '❓'
})

// Source label
const sourceLabel = computed(() => {
  const sourceLabels = {
    blacksmith: 'Ember & Edge',
    agronomist: 'Greenwise Co-op',
    land_steward: 'Land Office',
    carpenter: 'Towerwrights',
    skills_trainer: 'Field School',
    vendor: 'Exchange Post'
  }
  return sourceLabels[props.node.source] || props.node.source
})

// Description truncation
const truncatedDescription = computed(() => {
  const desc = props.node.description || props.node.effect || 'No description available'
  return desc.length > 80 ? desc.substring(0, 77) + '...' : desc
})

// Cost display
const displayCosts = computed(() => {
  const costs = {}
  const node = props.node
  
  // Extract costs from various possible fields
  if (node.goldCost && node.goldCost > 0) costs.gold = node.goldCost
  if (node.energyCost && node.energyCost > 0) costs.energy = node.energyCost
  if (node.stoneCost && node.stoneCost > 0) costs.stone = node.stoneCost
  if (node.copperCost && node.copperCost > 0) costs.copper = node.copperCost
  if (node.ironCost && node.ironCost > 0) costs.iron = node.ironCost
  if (node.silverCost && node.silverCost > 0) costs.silver = node.silverCost
  if (node.crystalCost && node.crystalCost > 0) costs.crystal = node.crystalCost
  if (node.mythrilCost && node.mythrilCost > 0) costs.mythril = node.mythrilCost
  
  return costs
})

// Resource icons
const resourceIcon = (resource) => {
  const icons = {
    gold: '🪙',
    energy: '⚡',
    stone: '🪨',
    copper: '🟤',
    iron: '⚪',
    silver: '⚫',
    crystal: '💎',
    mythril: '✨'
  }
  return icons[resource] || resource
}

// Prerequisites
const hasPrerequisites = computed(() => {
  return props.node.prerequisites && props.node.prerequisites.length > 0
})

const prerequisiteCount = computed(() => {
  return props.node.prerequisites ? props.node.prerequisites.length : 0
})

// Event handlers
const handleClick = () => {
  emit('click', props.node)
}

const handleMouseEnter = () => {
  emit('mouseenter', props.node)
}

const handleMouseLeave = () => {
  emit('mouseleave', props.node)
}
</script>

<style scoped>
.upgrade-node-card {
  width: 200px;
  height: 120px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 2px solid #475569;
  border-radius: 12px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.upgrade-node-card:hover {
  transform: translate(var(--x), var(--y)) scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

/* Status-based styling */
.node-available {
  border-color: #10b981;
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
}

.node-owned {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
}

.node-locked {
  border-color: #6b7280;
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  opacity: 0.7;
}

.node-selected {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
}

.node-hovered {
  border-color: #8b5cf6;
}

/* Area-based border colors */
.area-energy { border-left: 4px solid #fbbf24; }
.area-water { border-left: 4px solid #3b82f6; }
.area-forge { border-left: 4px solid #ef4444; }
.area-hero { border-left: 4px solid #8b5cf6; }
.area-housing { border-left: 4px solid #10b981; }
.area-tower { border-left: 4px solid #6b7280; }
.area-storage { border-left: 4px solid #f97316; }
.area-materials { border-left: 4px solid #84cc16; }
.area-deeds { border-left: 4px solid #ec4899; }

/* Card layout */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.node-icon {
  font-size: 20px;
  line-height: 1;
}

.node-status {
  position: relative;
}

.status-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.owned {
  background: #10b981;
  color: white;
}

.status-badge.available {
  background: #fbbf24;
  color: #1f2937;
}

.status-badge.locked {
  background: #6b7280;
  color: white;
}

.card-body {
  flex: 1;
  min-height: 0;
  margin-bottom: 4px;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0 0 4px 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-description {
  font-size: 11px;
  color: #cbd5e1;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
}

.cost-display {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.cost-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 4px;
  border-radius: 4px;
  color: #fbbf24;
  font-weight: 500;
}

.source-label {
  color: #94a3b8;
  font-size: 9px;
  text-align: right;
  flex-shrink: 0;
  margin-left: 4px;
}

.prerequisites-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f59e0b;
  color: #1f2937;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border: 2px solid #1e293b;
}

/* Source-based accent colors */
.source-blacksmith .card-header { border-bottom: 1px solid #ef4444; }
.source-agronomist .card-header { border-bottom: 1px solid #10b981; }
.source-land_steward .card-header { border-bottom: 1px solid #ec4899; }
.source-carpenter .card-header { border-bottom: 1px solid #f97316; }
.source-skills_trainer .card-header { border-bottom: 1px solid #8b5cf6; }
.source-vendor .card-header { border-bottom: 1px solid #6b7280; }

/* Placeholder node styling */
.node-placeholder {
  border: 2px dashed #64748b !important;
  background: rgba(100, 116, 139, 0.2) !important;
  opacity: 0.7;
}

.node-placeholder .card-header {
  background: rgba(100, 116, 139, 0.3);
  border-bottom: 1px dashed #64748b;
}

.node-placeholder .node-title {
  color: #94a3b8;
  font-style: italic;
}

.node-placeholder .node-description {
  color: #64748b;
  font-size: 10px;
}

.node-placeholder .node-icon::before {
  content: "📋";
  opacity: 0.6;
}
</style>
