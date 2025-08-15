<script setup>
import { computed, ref } from 'vue'
import { useSimulationStore } from '../stores/simulation.js'

const simulation = useSimulationStore()

const logFilter = ref('all')
const searchTerm = ref('')
const maxDisplayEntries = ref(100)

const filteredEvents = computed(() => {
  let events = simulation.eventLog.slice().reverse() // Show newest first
  
  // Apply category filter
  if (logFilter.value !== 'all') {
    events = events.filter(event => event.category.toLowerCase() === logFilter.value.toLowerCase())
  }
  
  // Apply search filter
  if (searchTerm.value.trim()) {
    const search = searchTerm.value.toLowerCase()
    events = events.filter(event => 
      event.action.toLowerCase().includes(search) ||
      event.category.toLowerCase().includes(search) ||
      (event.details && JSON.stringify(event.details).toLowerCase().includes(search))
    )
  }
  
  // Limit entries for performance
  return events.slice(0, maxDisplayEntries.value)
})

const eventCategories = computed(() => {
  const categories = new Set()
  simulation.eventLog.forEach(event => categories.add(event.category))
  return Array.from(categories).sort()
})

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}

function getCategoryIcon(category) {
  const icons = {
    'SIMULATION': '⚡',
    'CONFIG': '⚙️',
    'PHASE': '🎯',
    'HARVEST': '🌾',
    'PLANT': '🌱',
    'WATER': '💧',
    'ADVENTURE': '⚔️',
    'MINE': '⛏️',
    'CRAFT': '⚒️',
    'UPGRADE': '🔧',
    'HELPER': '🧙',
    'ERROR': '❌',
    'WARNING': '⚠️'
  }
  return icons[category] || '📝'
}

function getCategoryClass(category) {
  const classes = {
    'SIMULATION': 'category-simulation',
    'CONFIG': 'category-config',
    'PHASE': 'category-phase',
    'HARVEST': 'category-harvest',
    'PLANT': 'category-plant',
    'WATER': 'category-water',
    'ADVENTURE': 'category-adventure',
    'MINE': 'category-mine',
    'CRAFT': 'category-craft',
    'UPGRADE': 'category-upgrade',
    'HELPER': 'category-helper',
    'ERROR': 'category-error',
    'WARNING': 'category-warning'
  }
  return classes[category] || 'category-default'
}

function clearLog() {
  simulation.eventLog.length = 0
  simulation.logEvent('CONFIG', 'Event log cleared')
}

function exportLog() {
  const logData = JSON.stringify(simulation.eventLog, null, 2)
  const blob = new Blob([logData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `time-hero-log-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function copyEventDetails(event) {
  const details = {
    gameTime: event.gameTime,
    category: event.category,
    action: event.action,
    details: event.details
  }
  navigator.clipboard.writeText(JSON.stringify(details, null, 2))
}
</script>

<template>
  <div class="event-log">
    <h2>📜 Event Log</h2>
    
    <!-- Controls -->
    <div class="log-controls">
      <div class="control-group">
        <label for="log-filter">Filter:</label>
        <select id="log-filter" v-model="logFilter">
          <option value="all">All Events</option>
          <option v-for="category in eventCategories" :key="category" :value="category">
            {{ getCategoryIcon(category) }} {{ category }}
          </option>
        </select>
      </div>
      
      <div class="control-group">
        <label for="log-search">Search:</label>
        <input 
          id="log-search"
          type="text" 
          v-model="searchTerm" 
          placeholder="Search events..."
        />
      </div>
      
      <div class="control-group">
        <label for="max-entries">Max:</label>
        <select id="max-entries" v-model="maxDisplayEntries">
          <option :value="50">50</option>
          <option :value="100">100</option>
          <option :value="250">250</option>
          <option :value="500">500</option>
        </select>
      </div>
    </div>

    <!-- Actions -->
    <div class="log-actions">
      <button @click="clearLog" class="btn-secondary" title="Clear log">
        🗑️ Clear
      </button>
      <button @click="exportLog" class="btn-secondary" title="Export log as JSON">
        💾 Export
      </button>
    </div>

    <!-- Stats -->
    <div class="log-stats">
      <div class="stat">
        <span class="stat-label">Total Events:</span>
        <span class="stat-value">{{ simulation.eventLog.length }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Showing:</span>
        <span class="stat-value">{{ filteredEvents.length }}</span>
      </div>
    </div>

    <!-- Event List -->
    <div class="events-container">
      <div v-if="filteredEvents.length === 0" class="no-events">
        <p v-if="simulation.eventLog.length === 0">No events logged yet.</p>
        <p v-else>No events match your filter criteria.</p>
      </div>
      
      <div 
        v-for="event in filteredEvents" 
        :key="event.id"
        class="event-item"
        :class="getCategoryClass(event.category)"
        @click="copyEventDetails(event)"
        :title="'Click to copy details. Timestamp: ' + formatTime(event.timestamp)"
      >
        <div class="event-header">
          <span class="event-icon">{{ getCategoryIcon(event.category) }}</span>
          <span class="event-category">{{ event.category }}</span>
          <span class="event-time">{{ event.gameTime }}</span>
        </div>
        
        <div class="event-content">
          <div class="event-action">{{ event.action }}</div>
          <div v-if="event.details" class="event-details">
            {{ typeof event.details === 'string' ? event.details : JSON.stringify(event.details) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Info -->
    <div class="log-footer">
      <small class="performance-info">
        Events logged: {{ simulation.metrics.eventsLogged }} | 
        Memory usage: ~{{ Math.round(simulation.eventLog.length * 0.2) }}KB
      </small>
    </div>
  </div>
</template>

<style scoped>
.event-log {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-log h2 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

/* Controls */
.log-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  min-width: 50px;
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.control-group select,
.control-group input {
  flex: 1;
  padding: 0.4rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 0.85rem;
}

.log-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn-secondary {
  padding: 0.5rem 0.75rem;
  border: 1px solid #6c757d;
  border-radius: 0.25rem;
  background: white;
  color: #6c757d;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #6c757d;
  color: white;
}

/* Stats */
.log-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #e9ecef;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.stat-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

/* Events Container */
.events-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background: white;
}

.no-events {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

.event-item {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background-color 0.2s;
}

.event-item:hover {
  background: #f8f9fa;
}

.event-item:last-child {
  border-bottom: none;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.event-icon {
  font-size: 1rem;
}

.event-category {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  background: #e9ecef;
  color: #495057;
}

.event-time {
  margin-left: auto;
  font-size: 0.75rem;
  color: #6c757d;
  font-family: monospace;
}

.event-content {
  margin-left: 1.5rem;
}

.event-action {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.event-details {
  font-size: 0.8rem;
  color: #6c757d;
  background: #f8f9fa;
  padding: 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
  word-break: break-all;
  max-height: 100px;
  overflow-y: auto;
}

/* Category Colors */
.category-simulation .event-category {
  background: #e3f2fd;
  color: #1976d2;
}

.category-config .event-category {
  background: #f3e5f5;
  color: #7b1fa2;
}

.category-phase .event-category {
  background: #fff3e0;
  color: #f57c00;
}

.category-harvest .event-category {
  background: #e8f5e8;
  color: #388e3c;
}

.category-plant .event-category {
  background: #e0f2f1;
  color: #00695c;
}

.category-water .event-category {
  background: #e1f5fe;
  color: #0277bd;
}

.category-adventure .event-category {
  background: #fce4ec;
  color: #c2185b;
}

.category-mine .event-category {
  background: #f3e5f5;
  color: #512da8;
}

.category-craft .event-category {
  background: #fff8e1;
  color: #ff8f00;
}

.category-upgrade .event-category {
  background: #e8eaf6;
  color: #3f51b5;
}

.category-helper .event-category {
  background: #f9fbe7;
  color: #689f38;
}

.category-error .event-category {
  background: #ffebee;
  color: #d32f2f;
}

.category-warning .event-category {
  background: #fff3e0;
  color: #f57c00;
}

/* Footer */
.log-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.performance-info {
  color: #6c757d;
  font-size: 0.75rem;
}

/* Scrollbar styling */
.events-container::-webkit-scrollbar {
  width: 6px;
}

.events-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.events-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.events-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
