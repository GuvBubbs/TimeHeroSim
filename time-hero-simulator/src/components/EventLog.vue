<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useSimulationStore } from '../stores/simulation.js'

const simulation = useSimulationStore()

// Enhanced state management
const logFilter = ref('all')
const searchTerm = ref('')
const maxDisplayEntries = ref(100)
const exportFormat = ref('json')
const showAdvancedSearch = ref(false)
const searchFilters = ref({
  startDate: '',
  endDate: '',
  categories: [],
  priority: 'all'
})

// Auto-scroll management
const autoScroll = ref(true)
const logContainer = ref(null)

// Enhanced filtering
const filteredEvents = computed(() => {
  let events = simulation.eventLog.slice().reverse() // Show newest first
  
  // Apply category filter
  if (logFilter.value !== 'all') {
    events = events.filter(event => event.category.toLowerCase() === logFilter.value.toLowerCase())
  }
  
  // Apply advanced category filters
  if (searchFilters.value.categories.length > 0) {
    events = events.filter(event => 
      searchFilters.value.categories.includes(event.category)
    )
  }
  
  // Apply date range filter
  if (searchFilters.value.startDate || searchFilters.value.endDate) {
    const startTime = searchFilters.value.startDate ? new Date(searchFilters.value.startDate).getTime() : 0
    const endTime = searchFilters.value.endDate ? new Date(searchFilters.value.endDate).getTime() : Date.now()
    
    events = events.filter(event => {
      const eventTime = new Date(event.timestamp).getTime()
      return eventTime >= startTime && eventTime <= endTime
    })
  }
  
  // Apply text search filter
  if (searchTerm.value.trim()) {
    const search = searchTerm.value.toLowerCase()
    events = events.filter(event => 
      event.action.toLowerCase().includes(search) ||
      event.category.toLowerCase().includes(search) ||
      (event.details && JSON.stringify(event.details).toLowerCase().includes(search))
    )
  }
  
  // Apply priority filter
  if (searchFilters.value.priority !== 'all') {
    events = events.filter(event => {
      const priority = getEventPriority(event)
      return priority === searchFilters.value.priority
    })
  }
  
  // Limit entries for performance
  return events.slice(0, maxDisplayEntries.value)
})

const eventCategories = computed(() => {
  const categories = new Set()
  simulation.eventLog.forEach(event => categories.add(event.category))
  return Array.from(categories).sort()
})

const searchStats = computed(() => {
  const total = simulation.eventLog.length
  const filtered = filteredEvents.value.length
  return {
    total,
    filtered,
    hidden: total - filtered
  }
})

// Keyboard shortcuts
function handleKeydown(event) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'f':
        event.preventDefault()
        document.querySelector('.search-input')?.focus()
        break
      case 'k':
        event.preventDefault()
        clearLog()
        break
      case 's':
        event.preventDefault()
        exportLog()
        break
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Event utilities
function getEventPriority(event) {
  const errorCategories = ['ERROR']
  const warningCategories = ['WARNING', 'BOTTLENECK']
  const importantCategories = ['PHASE', 'HELPER', 'UPGRADE']
  
  if (errorCategories.includes(event.category)) return 'error'
  if (warningCategories.includes(event.category)) return 'warning'
  if (importantCategories.includes(event.category)) return 'important'
  return 'normal'
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString()
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
    'WARNING': '⚠️',
    'BOTTLENECK': '🚨'
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
    'WARNING': 'category-warning',
    'BOTTLENECK': 'category-bottleneck'
  }
  return classes[category] || 'category-default'
}

function clearLog() {
  simulation.eventLog.length = 0
  simulation.logEvent('CONFIG', 'Event log cleared')
}

function clearFilters() {
  searchTerm.value = ''
  logFilter.value = 'all'
  searchFilters.value = {
    startDate: '',
    endDate: '',
    categories: [],
    priority: 'all'
  }
}

function exportLog() {
  const events = filteredEvents.value
  let content = ''
  let filename = `time-hero-log-${new Date().toISOString().slice(0, 19)}`
  let mimeType = ''
  
  switch (exportFormat.value) {
    case 'json':
      content = JSON.stringify(events, null, 2)
      filename += '.json'
      mimeType = 'application/json'
      break
      
    case 'csv':
      const headers = ['Timestamp', 'Category', 'Action', 'Details']
      const csvRows = [headers.join(',')]
      
      events.forEach(event => {
        const row = [
          new Date(event.timestamp).toISOString(),
          event.category,
          `"${event.action.replace(/"/g, '""')}"`,
          `"${event.details ? JSON.stringify(event.details).replace(/"/g, '""') : ''}"`
        ]
        csvRows.push(row.join(','))
      })
      
      content = csvRows.join('\n')
      filename += '.csv'
      mimeType = 'text/csv'
      break
      
    case 'txt':
      content = events.map(event => {
        const time = new Date(event.timestamp).toISOString()
        const details = event.details ? ` | ${JSON.stringify(event.details)}` : ''
        return `[${time}] ${event.category}: ${event.action}${details}`
      }).join('\n')
      filename += '.txt'
      mimeType = 'text/plain'
      break
  }
  
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  simulation.logEvent('CONFIG', `Event log exported as ${exportFormat.value.toUpperCase()}`, {
    format: exportFormat.value,
    eventCount: events.length
  })
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
    <div class="log-header">
      <h2>📜 Event Log</h2>
      <div class="header-actions">
        <button 
          @click="showAdvancedSearch = !showAdvancedSearch"
          class="btn-secondary"
          :class="{ active: showAdvancedSearch }"
        >
          🔍 Advanced Search
        </button>
      </div>
    </div>
    
    <!-- Enhanced Controls -->
    <div class="log-controls">
      <div class="basic-controls">
        <div class="control-group">
          <label for="log-search">Search:</label>
          <input 
            id="log-search"
            type="text" 
            v-model="searchTerm" 
            placeholder="Search events... (Ctrl+F)"
            class="search-input"
          />
          <button 
            v-if="searchTerm" 
            @click="searchTerm = ''"
            class="clear-search"
            title="Clear search"
          >
            ×
          </button>
        </div>
        
        <div class="control-group">
          <label for="log-filter">Category:</label>
          <select id="log-filter" v-model="logFilter">
            <option value="all">All Categories</option>
            <option v-for="category in eventCategories" :key="category" :value="category">
              {{ getCategoryIcon(category) }} {{ category }}
            </option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="max-entries">Show:</label>
          <select id="max-entries" v-model="maxDisplayEntries">
            <option :value="50">50</option>
            <option :value="100">100</option>
            <option :value="250">250</option>
            <option :value="500">500</option>
            <option :value="1000">1000</option>
          </select>
        </div>
      </div>

      <!-- Advanced Search Panel -->
      <div v-if="showAdvancedSearch" class="advanced-search">
        <div class="advanced-row">
          <div class="control-group">
            <label for="start-date">From:</label>
            <input 
              id="start-date"
              type="date" 
              v-model="searchFilters.startDate"
            />
          </div>
          
          <div class="control-group">
            <label for="end-date">To:</label>
            <input 
              id="end-date"
              type="date" 
              v-model="searchFilters.endDate"
            />
          </div>
          
          <div class="control-group">
            <label for="priority-filter">Priority:</label>
            <select id="priority-filter" v-model="searchFilters.priority">
              <option value="all">All Priorities</option>
              <option value="error">🔴 Error</option>
              <option value="warning">🟡 Warning</option>
              <option value="important">🔵 Important</option>
              <option value="normal">⚪ Normal</option>
            </select>
          </div>
        </div>
        
        <div class="advanced-row">
          <div class="control-group categories-select">
            <label>Categories:</label>
            <div class="category-checkboxes">
              <label v-for="category in eventCategories" :key="category" class="checkbox-label">
                <input 
                  type="checkbox" 
                  :value="category"
                  v-model="searchFilters.categories"
                />
                {{ getCategoryIcon(category) }} {{ category }}
              </label>
            </div>
          </div>
        </div>
        
        <div class="advanced-actions">
          <button @click="clearFilters" class="btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Actions & Stats Bar -->
    <div class="log-info-bar">
      <div class="log-stats">
        <div class="stat">
          <span class="stat-label">Total:</span>
          <span class="stat-value">{{ searchStats.total }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Showing:</span>
          <span class="stat-value">{{ searchStats.filtered }}</span>
        </div>
        <div v-if="searchStats.hidden > 0" class="stat">
          <span class="stat-label">Hidden:</span>
          <span class="stat-value warning">{{ searchStats.hidden }}</span>
        </div>
      </div>

      <div class="log-actions">
        <div class="export-group">
          <select v-model="exportFormat" class="export-format">
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="txt">Text</option>
          </select>
          <button @click="exportLog" class="btn-secondary" title="Export filtered events (Ctrl+S)">
            💾 Export {{ exportFormat.toUpperCase() }}
          </button>
        </div>
        
        <button @click="clearLog" class="btn-danger" title="Clear all events (Ctrl+K)">
          🗑️ Clear All
        </button>
      </div>
    </div>

    <!-- Keyboard Shortcuts Help -->
    <div class="shortcuts-hint">
      <small>
        💡 Shortcuts: <kbd>Ctrl+F</kbd> Search, <kbd>Ctrl+S</kbd> Export, <kbd>Ctrl+K</kbd> Clear
      </small>
    </div>

    <!-- Event List -->
    <div class="events-container" ref="logContainer">
      <div v-if="filteredEvents.length === 0" class="no-events">
        <div class="no-events-content">
          <div class="no-events-icon">📄</div>
          <p v-if="simulation.eventLog.length === 0">No events logged yet.</p>
          <p v-else>No events match your current filters.</p>
          <button v-if="simulation.eventLog.length > 0" @click="clearFilters" class="btn-link">
            Clear filters to show all events
          </button>
        </div>
      </div>
      
      <div 
        v-for="event in filteredEvents" 
        :key="event.id"
        class="event-item"
        :class="[
          getCategoryClass(event.category),
          'priority-' + getEventPriority(event)
        ]"
        @click="copyEventDetails(event)"
        :title="'Click to copy details'"
      >
        <div class="event-header">
          <div class="event-meta">
            <span class="event-icon">{{ getCategoryIcon(event.category) }}</span>
            <span class="event-category">{{ event.category }}</span>
            <span class="event-priority" :class="'priority-' + getEventPriority(event)">
              {{ getEventPriority(event) }}
            </span>
          </div>
          <div class="event-timing">
            <span class="event-time">{{ event.gameTime }}</span>
            <span class="event-timestamp">{{ formatTime(event.timestamp) }}</span>
          </div>
        </div>
        
        <div class="event-content">
          <div class="event-action">{{ event.action }}</div>
          <div v-if="event.details" class="event-details">
            <details>
              <summary>Details</summary>
              <pre>{{ typeof event.details === 'string' ? event.details : JSON.stringify(event.details, null, 2) }}</pre>
            </details>
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Header */
.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.log-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.header-actions .btn-secondary.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* Enhanced Controls */
.log-controls {
  border-bottom: 1px solid #dee2e6;
}

.basic-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
  position: relative;
}

.control-group label {
  min-width: 60px;
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.control-group select,
.control-group input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.control-group input:focus,
.control-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-input {
  padding-right: 2rem !important;
}

.clear-search {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 2px 4px;
  border-radius: 2px;
}

.clear-search:hover {
  background: #e9ecef;
  color: #495057;
}

/* Advanced Search */
.advanced-search {
  padding: 1rem;
  background: white;
  border-top: 1px solid #dee2e6;
}

.advanced-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.advanced-row:last-child {
  margin-bottom: 0;
}

.categories-select {
  flex: 1;
  min-width: 100%;
}

.category-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.checkbox-label:hover {
  background: #f8f9fa;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
  min-width: auto;
  width: auto;
}

.advanced-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Info Bar */
.log-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  flex-wrap: wrap;
  gap: 1rem;
}

.log-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.stat-label {
  color: #6c757d;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

.stat-value.warning {
  color: #dc3545;
}

.log-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.export-group {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.export-format {
  padding: 0.375rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px 0 0 4px;
  background: white;
  font-size: 0.875rem;
}

.btn-secondary {
  padding: 0.375rem 0.75rem;
  border: 1px solid #6c757d;
  border-radius: 4px;
  background: white;
  color: #6c757d;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-secondary:hover {
  background: #6c757d;
  color: white;
}

.btn-danger {
  padding: 0.375rem 0.75rem;
  border: 1px solid #dc3545;
  border-radius: 4px;
  background: white;
  color: #dc3545;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #dc3545;
  color: white;
}

.btn-link {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.875rem;
  padding: 0;
}

.btn-link:hover {
  color: #0056b3;
}

/* Keyboard Shortcuts */
.shortcuts-hint {
  padding: 0.5rem 1rem;
  background: #e9ecef;
  border-bottom: 1px solid #dee2e6;
  text-align: center;
}

.shortcuts-hint kbd {
  background: #495057;
  color: white;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-family: monospace;
}

/* Events Container */
.events-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.no-events {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6c757d;
}

.no-events-content {
  text-align: center;
}

.no-events-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

/* Event Items */
.event-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  border-left: 4px solid #dee2e6;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.event-item:hover {
  background: #e9ecef;
  transform: translateX(2px);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.event-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-icon {
  font-size: 1rem;
  width: 1.5rem;
  text-align: center;
}

.event-category {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #495057;
}

.event-priority {
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  text-transform: uppercase;
  font-weight: 500;
}

.event-timing {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.event-time {
  font-weight: 500;
  font-size: 0.875rem;
  color: #495057;
}

.event-timestamp {
  font-size: 0.75rem;
  color: #6c757d;
}

.event-content {
  margin-left: 2rem;
}

.event-action {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.event-details details {
  margin-top: 0.5rem;
}

.event-details summary {
  cursor: pointer;
  font-size: 0.8rem;
  color: #007bff;
  margin-bottom: 0.25rem;
}

.event-details pre {
  background: #f1f3f4;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
}

/* Priority Styles */
.priority-error {
  border-left-color: #dc3545 !important;
  background: rgba(220, 53, 69, 0.05) !important;
}

.priority-error .event-priority {
  background: #dc3545;
  color: white;
}

.priority-warning {
  border-left-color: #ffc107 !important;
  background: rgba(255, 193, 7, 0.05) !important;
}

.priority-warning .event-priority {
  background: #ffc107;
  color: #212529;
}

.priority-important {
  border-left-color: #007bff !important;
  background: rgba(0, 123, 255, 0.05) !important;
}

.priority-important .event-priority {
  background: #007bff;
  color: white;
}

.priority-normal .event-priority {
  background: #6c757d;
  color: white;
}

/* Category Styles */
.category-phase {
  border-left-color: #28a745 !important;
}

.category-helper {
  border-left-color: #6f42c1 !important;
}

.category-upgrade {
  border-left-color: #17a2b8 !important;
}

.category-adventure {
  border-left-color: #dc3545 !important;
}

.category-mine {
  border-left-color: #6f42c1 !important;
}

.category-craft {
  border-left-color: #fd7e14 !important;
}

.category-harvest {
  border-left-color: #28a745 !important;
}

.category-plant {
  border-left-color: #20c997 !important;
}

.category-water {
  border-left-color: #17a2b8 !important;
}

.category-bottleneck {
  border-left-color: #dc3545 !important;
  background: rgba(220, 53, 69, 0.1) !important;
}

/* Footer */
.log-footer {
  padding: 0.5rem 1rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
  text-align: center;
}

.performance-info {
  color: #6c757d;
  font-size: 0.75rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .basic-controls {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .control-group {
    min-width: 100%;
  }
  
  .log-info-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .event-timing {
    align-items: flex-start;
  }
  
  .event-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .event-content {
    margin-left: 0;
    margin-top: 0.5rem;
  }
}
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
