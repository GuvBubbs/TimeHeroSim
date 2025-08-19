<template>
  <div
    class="upgrade-node"
    :class="nodeClasses"
    :style="nodeStyle"
    @click="$emit('click', node)"
    @mouseenter="$emit('mouseenter', node, $event)"
    @mouseleave="$emit('mouseleave')"
  >
    <div class="node-header">
      <span class="node-icon">{{ getIcon() }}</span>
      <span class="node-tier">T{{ node.tier || 0 }}</span>
    </div>
    <div class="node-name">{{ truncateName(node.name) }}</div>
    <div class="node-costs">
      <span v-if="node.costs?.gold" class="cost gold">
        💰{{ formatNumber(node.costs.gold) }}
      </span>
      <span v-if="node.costs?.energy" class="cost energy">
        ⚡{{ formatNumber(node.costs.energy) }}
      </span>
    </div>
    <div v-if="hasMaterialCosts" class="node-materials">
      <span v-for="(amount, material) in node.costs.materials" :key="material" class="material">
        {{ getMaterialIcon(material) }}{{ amount }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: { type: Object, required: true },
  position: { type: Object, default: () => ({ x: 0, y: 0 }) },
  isSelected: { type: Boolean, default: false },
  isHovered: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  isOwned: { type: Boolean, default: false }
})

const emit = defineEmits(['click', 'mouseenter', 'mouseleave'])

const nodeStyle = computed(() => ({
  left: `${props.position.x || props.node.x || 0}px`,
  top: `${props.position.y || props.node.y || 0}px`,
  width: `${props.node.width || 140}px`,
  height: `${props.node.height || 70}px`
}))

const nodeClasses = computed(() => ({
  'node-owned': props.isOwned,
  'node-available': props.isAvailable && !props.isOwned,
  'node-locked': props.isLocked,
  'node-selected': props.isSelected,
  'node-hovered': props.isHovered
}))

const hasMaterialCosts = computed(() => {
  return props.node.costs?.materials && Object.keys(props.node.costs.materials).length > 0
})

function getIcon() {
  const areaIcons = {
    energy: '⚡', water: '💧', forge: '🔨', hero: '🦸',
    housing: '🏠', tower: '🗼', storage: '📦', materials: '⛏️',
    deeds: '📜', farm: '🌾', adventure: '⚔️', mine: '⛏️'
  }
  return areaIcons[props.node.area] || props.node.icon || '📋'
}

function getMaterialIcon(material) {
  const icons = {
    wood: '🪵', stone: '🪨', copper: '🟤', iron: '⚫',
    silver: '⚪', crystal: '💎', mythril: '🟣', obsidian: '⬛'
  }
  return icons[material.toLowerCase()] || ''
}

function truncateName(name) {
  return name.length > 18 ? name.substring(0, 15) + '...' : name
}

function formatNumber(num) {
  if (num >= 1000000) return `${Math.floor(num/1000000)}M`
  if (num >= 1000) return `${Math.floor(num/1000)}K`
  return num.toString()
}
</script>

<style scoped>
.upgrade-node {
  position: absolute;
  background: #1e293b;
  border: 2px solid #475569;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 11px;
  color: #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.upgrade-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
  z-index: 10;
}

.node-owned {
  background: #065f46;
  border-color: #10b981;
}

.node-available {
  background: #1e3a8a;
  border-color: #3b82f6;
}

.node-locked {
  background: #374151;
  border-color: #6b7280;
  opacity: 0.7;
}

.node-selected {
  border-color: #fbbf24 !important;
  border-width: 3px;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.5);
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.node-icon {
  font-size: 16px;
}

.node-tier {
  font-size: 9px;
  color: #94a3b8;
  background: #0f172a;
  padding: 1px 4px;
  border-radius: 3px;
}

.node-name {
  font-weight: 600;
  text-align: center;
  margin-bottom: 4px;
  line-height: 1.2;
}

.node-costs {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.node-materials {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 2px;
}

.cost, .material {
  font-size: 10px;
  opacity: 0.9;
}

.cost.gold { color: #fbbf24; }
.cost.energy { color: #60a5fa; }
</style>
