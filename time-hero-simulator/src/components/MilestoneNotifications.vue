<template>
  <div class="milestone-notifications">
    <Transition name="notification-list">
      <div v-if="visibleNotifications.length > 0" class="notification-container">
        <TransitionGroup name="notification" tag="div" class="notification-list">
          <div
            v-for="notification in visibleNotifications"
            :key="notification.id"
            class="notification"
            :class="['notification-' + notification.type, { 'notification-new': notification.isNew }]"
            @click="markAsRead(notification.id)"
          >
            <div class="notification-icon">{{ notification.icon }}</div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <button 
              class="notification-close"
              @click.stop="dismissNotification(notification.id)"
              :aria-label="'Dismiss ' + notification.title"
            >
              ×
            </button>
          </div>
        </TransitionGroup>
        
        <div v-if="hasMoreNotifications" class="notification-toggle">
          <button @click="showAllNotifications = !showAllNotifications" class="toggle-btn">
            {{ showAllNotifications ? 'Show Less' : `Show ${hiddenCount} More` }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Settings panel -->
    <div v-if="showSettings" class="notification-settings">
      <h5>Notification Settings</h5>
      <div class="setting-group">
        <label>
          <input 
            type="checkbox" 
            v-model="settings.phaseTransitions"
          />
          Phase Transitions
        </label>
        <label>
          <input 
            type="checkbox" 
            v-model="settings.helperDiscovery"
          />
          Helper Discovery
        </label>
        <label>
          <input 
            type="checkbox" 
            v-model="settings.majorUpgrades"
          />
          Major Upgrades
        </label>
        <label>
          <input 
            type="checkbox" 
            v-model="settings.bottlenecks"
          />
          Bottleneck Warnings
        </label>
      </div>
      <div class="setting-group">
        <label for="maxVisible">Max Visible Notifications:</label>
        <input 
          id="maxVisible"
          type="range" 
          min="1" 
          max="10" 
          v-model="settings.maxVisible"
        />
        <span>{{ settings.maxVisible }}</span>
      </div>
    </div>

    <!-- Toggle button for settings -->
    <button 
      class="settings-toggle"
      @click="showSettings = !showSettings"
      :class="{ active: showSettings }"
      title="Notification Settings"
    >
      ⚙️
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useSimulationStore } from '../stores/simulation.js'

const simulation = useSimulationStore()

// Component state
const notifications = ref([])
const showAllNotifications = ref(false)
const showSettings = ref(false)
const nextId = ref(1)

// Settings
const settings = ref({
  phaseTransitions: true,
  helperDiscovery: true,
  majorUpgrades: true,
  bottlenecks: true,
  maxVisible: 3
})

// Computed properties
const visibleNotifications = computed(() => {
  const sorted = notifications.value
    .filter(n => !n.dismissed)
    .sort((a, b) => b.timestamp - a.timestamp)
  
  if (showAllNotifications.value) {
    return sorted
  }
  
  return sorted.slice(0, settings.value.maxVisible)
})

const hasMoreNotifications = computed(() => {
  const total = notifications.value.filter(n => !n.dismissed).length
  return total > settings.value.maxVisible
})

const hiddenCount = computed(() => {
  const total = notifications.value.filter(n => !n.dismissed).length
  return Math.max(0, total - settings.value.maxVisible)
})

// Watch for game state changes to trigger notifications
watch(() => simulation.gameState.currentPhase, (newPhase, oldPhase) => {
  if (oldPhase && newPhase !== oldPhase && settings.value.phaseTransitions) {
    addNotification({
      type: 'phase',
      title: 'Phase Transition!',
      message: `Advanced from ${oldPhase} to ${newPhase} phase`,
      icon: '🎉'
    })
  }
})

watch(() => simulation.gameState.helpers?.length || 0, (newCount, oldCount) => {
  if (newCount > (oldCount || 0) && settings.value.helperDiscovery) {
    const newHelper = simulation.gameState.helpers[newCount - 1]
    addNotification({
      type: 'helper',
      title: 'Helper Discovered!',
      message: `Found a ${newHelper.type} helper in the mines`,
      icon: '🧙‍♂️'
    })
  }
})

watch(() => simulation.gameState.upgrades?.owned?.length || 0, (newCount, oldCount) => {
  if (newCount > (oldCount || 0) && settings.value.majorUpgrades) {
    const majorUpgrades = ['storage_2', 'farm_expansion_2', 'helper_training', 'auto_harvest']
    const latestUpgrade = simulation.gameState.upgrades.owned[newCount - 1]
    
    if (majorUpgrades.includes(latestUpgrade)) {
      addNotification({
        type: 'upgrade',
        title: 'Major Upgrade Complete!',
        message: `Built ${formatUpgradeName(latestUpgrade)}`,
        icon: '⬆️'
      })
    }
  }
})

// Monitor bottlenecks
watch(() => simulation.gameState.resources.energy.current, (current) => {
  const cap = simulation.gameState.resources.energy.cap
  if (current >= cap * 0.95 && settings.value.bottlenecks) {
    // Throttle bottleneck notifications
    const lastBottleneckNotification = notifications.value
      .filter(n => n.type === 'bottleneck')
      .sort((a, b) => b.timestamp - a.timestamp)[0]
    
    if (!lastBottleneckNotification || Date.now() - lastBottleneckNotification.timestamp > 300000) { // 5 minutes
      addNotification({
        type: 'bottleneck',
        title: 'Energy Storage Full!',
        message: 'Consider upgrading storage or using energy on adventures',
        icon: '⚠️'
      })
    }
  }
})

// Functions
function addNotification(notificationData) {
  const notification = {
    id: nextId.value++,
    timestamp: Date.now(),
    isNew: true,
    dismissed: false,
    read: false,
    ...notificationData
  }
  
  notifications.value.push(notification)
  
  // Mark as not new after a delay
  setTimeout(() => {
    const n = notifications.value.find(n => n.id === notification.id)
    if (n) n.isNew = false
  }, 3000)
  
  // Auto-dismiss info notifications after 10 seconds
  if (notification.type === 'info') {
    setTimeout(() => {
      dismissNotification(notification.id)
    }, 10000)
  }
}

function markAsRead(id) {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

function dismissNotification(id) {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.dismissed = true
  }
}

function formatTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

function formatUpgradeName(upgradeId) {
  return upgradeId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Add some initial milestone notifications for demonstration
onMounted(() => {
  if (simulation.gameState.currentPhase !== 'tutorial') {
    addNotification({
      type: 'info',
      title: 'Simulation Started',
      message: 'Monitoring game progress for milestone notifications',
      icon: '🎯'
    })
  }
})

// Export functions for external use
defineExpose({
  addNotification,
  clearAllNotifications: () => {
    notifications.value = []
  }
})
</script>

<style scoped>
.milestone-notifications {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  max-width: 400px;
}

.notification-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.notification:hover {
  background: rgba(0, 0, 0, 0.05);
}

.notification:last-child {
  border-bottom: none;
}

.notification-new {
  background: rgba(0, 123, 255, 0.1);
  border-left: 4px solid #007bff;
}

.notification-phase {
  border-left: 4px solid #28a745;
}

.notification-helper {
  border-left: 4px solid #6f42c1;
}

.notification-upgrade {
  border-left: 4px solid #ffc107;
}

.notification-bottleneck {
  border-left: 4px solid #dc3545;
}

.notification-info {
  border-left: 4px solid #17a2b8;
}

.notification-icon {
  font-size: 1.5rem;
  min-width: 2rem;
  text-align: center;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: bold;
  color: #495057;
  margin-bottom: 0.25rem;
}

.notification-message {
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.notification-time {
  font-size: 0.75rem;
  color: #adb5bd;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #adb5bd;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #495057;
}

.notification-toggle {
  padding: 0.75rem;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.02);
}

.toggle-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s ease;
}

.toggle-btn:hover {
  background: #0056b3;
}

.notification-settings {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-top: 0.5rem;
}

.notification-settings h5 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.setting-group {
  margin-bottom: 1rem;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  color: #495057;
}

.setting-group input[type="checkbox"] {
  margin: 0;
}

.setting-group input[type="range"] {
  flex: 1;
  margin: 0 0.5rem;
}

.settings-toggle {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 0.5rem;
  margin-left: auto;
  transition: all 0.2s ease;
}

.settings-toggle:hover {
  background: #5a6268;
  transform: scale(1.05);
}

.settings-toggle.active {
  background: #007bff;
}

/* Transitions */
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}

.notification-list-enter-from,
.notification-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  left: 0;
  right: 0;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
