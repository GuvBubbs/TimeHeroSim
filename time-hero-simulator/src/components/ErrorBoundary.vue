<script setup>
import { ref, onErrorCaptured, provide } from 'vue'

// Error state
const error = ref(null)
const errorInfo = ref(null)
const hasError = ref(false)

// Error recovery
const retryCount = ref(0)
const maxRetries = 3

// Error handling
onErrorCaptured((err, instance, info) => {
  console.error('🚨 Application Error Caught:', err)
  console.error('📍 Error Info:', info)
  console.error('🔍 Component Instance:', instance)
  
  // Store error details
  error.value = err
  errorInfo.value = info
  hasError.value = true
  
  // Log to external service (if configured)
  logErrorToService(err, info, instance)
  
  // Prevent error from propagating up
  return false
})

// Error recovery functions
function retryOperation() {
  if (retryCount.value < maxRetries) {
    retryCount.value++
    hasError.value = false
    error.value = null
    errorInfo.value = null
    
    console.log(`🔄 Retrying operation (attempt ${retryCount.value}/${maxRetries})`)
  } else {
    console.warn('⚠️ Maximum retry attempts reached')
  }
}

function resetErrorState() {
  hasError.value = false
  error.value = null
  errorInfo.value = null
  retryCount.value = 0
  
  console.log('🔄 Error state reset')
}

function reportError() {
  const errorReport = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.value?.message,
      stack: error.value?.stack,
      name: error.value?.name
    },
    component: errorInfo.value,
    userAgent: navigator.userAgent,
    url: window.location.href,
    retryCount: retryCount.value
  }
  
  // Copy to clipboard for easy reporting
  navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
    .then(() => console.log('📋 Error report copied to clipboard'))
    .catch(() => console.warn('⚠️ Could not copy error report'))
    
  // Open GitHub issues page
  const issueTitle = encodeURIComponent(`Bug Report: ${error.value?.message || 'Unknown Error'}`)
  const issueBody = encodeURIComponent(`
## Error Description
${error.value?.message || 'Unknown error occurred'}

## Error Details
\`\`\`
${error.value?.stack || 'No stack trace available'}
\`\`\`

## Component Context
${errorInfo.value || 'No component info available'}

## Environment
- User Agent: ${navigator.userAgent}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}

## Steps to Reproduce
Please describe what you were doing when this error occurred.
`)
  
  const githubUrl = `https://github.com/GuvBubbs/TimeHeroSim/issues/new?title=${issueTitle}&body=${issueBody}`
  window.open(githubUrl, '_blank')
}

// Error logging service (placeholder for future implementation)
function logErrorToService(err, info, instance) {
  // This would send error data to an external service like Sentry, LogRocket, etc.
  // For now, we just log locally
  
  const errorData = {
    timestamp: Date.now(),
    message: err.message,
    stack: err.stack,
    componentInfo: info,
    componentName: instance?.$options?.name || 'Unknown',
    url: window.location.href,
    userAgent: navigator.userAgent,
    simulationState: getSimulationState()
  }
  
  // Store in localStorage for debugging
  try {
    const existingErrors = JSON.parse(localStorage.getItem('simulator-errors') || '[]')
    existingErrors.push(errorData)
    
    // Keep only the last 10 errors
    if (existingErrors.length > 10) {
      existingErrors.splice(0, existingErrors.length - 10)
    }
    
    localStorage.setItem('simulator-errors', JSON.stringify(existingErrors))
  } catch (e) {
    console.warn('⚠️ Could not store error data:', e)
  }
}

function getSimulationState() {
  try {
    // Try to get current simulation state for error context
    return {
      isRunning: window.simulationStore?.isRunning || false,
      currentDay: window.simulationStore?.gameState?.day || 0,
      currentPhase: window.simulationStore?.gameState?.currentPhase || 'unknown',
      hasData: window.gameValuesStore?.hasValidData || false
    }
  } catch (e) {
    return { error: 'Could not retrieve simulation state' }
  }
}

// Provide error boundary context to child components
provide('errorBoundary', {
  reportError: (customError, context) => {
    error.value = customError
    errorInfo.value = context || 'Manual error report'
    hasError.value = true
    logErrorToService(customError, context, null)
  }
})

// Component diagnostics
function runDiagnostics() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    },
    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    },
    memory: performance.memory ? {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    } : 'Not available',
    performance: {
      timeOrigin: performance.timeOrigin,
      now: performance.now()
    },
    storage: {
      localStorage: (() => {
        try {
          localStorage.setItem('test', 'test')
          localStorage.removeItem('test')
          return 'Available'
        } catch (e) {
          return 'Not available'
        }
      })(),
      sessionStorage: (() => {
        try {
          sessionStorage.setItem('test', 'test')
          sessionStorage.removeItem('test')
          return 'Available'
        } catch (e) {
          return 'Not available'
        }
      })()
    },
    webWorkers: typeof Worker !== 'undefined' ? 'Supported' : 'Not supported',
    gameData: getSimulationState()
  }
  
  console.log('🔍 System Diagnostics:', diagnostics)
  
  // Copy to clipboard
  navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2))
    .then(() => console.log('📋 Diagnostics copied to clipboard'))
    .catch(() => console.warn('⚠️ Could not copy diagnostics'))
    
  return diagnostics
}

// Emergency reset function
function emergencyReset() {
  console.warn('🚨 Performing emergency reset...')
  
  try {
    // Clear local storage
    localStorage.removeItem('simulator-state')
    localStorage.removeItem('simulator-config')
    localStorage.removeItem('simulator-results')
    
    // Reset error state
    resetErrorState()
    
    // Reload page after short delay
    setTimeout(() => {
      window.location.reload()
    }, 1000)
    
  } catch (e) {
    console.error('❌ Emergency reset failed:', e)
    // Force reload as last resort
    window.location.reload()
  }
}
</script>

<template>
  <div class="error-boundary">
    <!-- Normal application content -->
    <div v-if="!hasError" class="app-content">
      <slot />
    </div>
    
    <!-- Error state -->
    <div v-else class="error-display">
      <div class="error-container">
        <div class="error-header">
          <h1>🚨 Something went wrong</h1>
          <p class="error-subtitle">
            The simulator encountered an unexpected error. Don't worry - your data is safe!
          </p>
        </div>
        
        <div class="error-details">
          <details class="error-summary">
            <summary>Error Details</summary>
            <div class="error-content">
              <div class="error-message">
                <h3>Error Message:</h3>
                <code>{{ error?.message || 'Unknown error' }}</code>
              </div>
              
              <div class="error-stack" v-if="error?.stack">
                <h3>Stack Trace:</h3>
                <pre>{{ error.stack }}</pre>
              </div>
              
              <div class="error-context" v-if="errorInfo">
                <h3>Component Context:</h3>
                <code>{{ errorInfo }}</code>
              </div>
            </div>
          </details>
        </div>
        
        <div class="error-actions">
          <div class="primary-actions">
            <button 
              @click="retryOperation" 
              :disabled="retryCount >= maxRetries"
              class="btn-primary"
            >
              {{ retryCount >= maxRetries ? '❌ Max Retries Reached' : `🔄 Try Again (${retryCount}/${maxRetries})` }}
            </button>
            
            <button @click="resetErrorState" class="btn-secondary">
              🏠 Return to Main View
            </button>
          </div>
          
          <div class="secondary-actions">
            <button @click="reportError" class="btn-outline">
              🐛 Report This Bug
            </button>
            
            <button @click="runDiagnostics" class="btn-outline">
              🔍 Run Diagnostics
            </button>
            
            <button @click="emergencyReset" class="btn-danger">
              🚨 Emergency Reset
            </button>
          </div>
        </div>
        
        <div class="error-help">
          <h3>What can you do?</h3>
          <ul>
            <li><strong>Try Again:</strong> The error might be temporary</li>
            <li><strong>Return to Main View:</strong> Go back to the main simulator</li>
            <li><strong>Report Bug:</strong> Help us fix this issue for everyone</li>
            <li><strong>Emergency Reset:</strong> Clear all data and restart (last resort)</li>
          </ul>
          
          <div class="error-tips">
            <h4>Common Solutions:</h4>
            <ul>
              <li>Refresh your browser tab</li>
              <li>Close other browser tabs to free memory</li>
              <li>Try using a different browser</li>
              <li>Check if your browser is up to date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-boundary {
  min-height: 100vh;
  position: relative;
}

.app-content {
  height: 100%;
}

.error-display {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 100%;
  padding: 2rem;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-header {
  text-align: center;
  margin-bottom: 2rem;
}

.error-header h1 {
  font-size: 2.5rem;
  color: #d32f2f;
  margin: 0 0 1rem 0;
}

.error-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.error-details {
  margin-bottom: 2rem;
}

.error-summary {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
  background: #f8f9fa;
}

.error-summary summary {
  font-weight: 600;
  cursor: pointer;
  color: #495057;
}

.error-summary summary:hover {
  color: #007bff;
}

.error-content {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.error-message,
.error-stack,
.error-context {
  margin-bottom: 1rem;
}

.error-message h3,
.error-stack h3,
.error-context h3 {
  font-size: 1rem;
  color: #495057;
  margin: 0 0 0.5rem 0;
}

.error-message code,
.error-context code {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.5rem;
  display: block;
  word-break: break-word;
  color: #d63384;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
}

.error-stack pre {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.75rem;
  overflow-x: auto;
  font-size: 0.8rem;
  color: #6c757d;
  max-height: 200px;
  overflow-y: auto;
}

.error-actions {
  margin-bottom: 2rem;
}

.primary-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.secondary-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-outline,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.error-help {
  border-top: 1px solid #dee2e6;
  padding-top: 1.5rem;
}

.error-help h3 {
  color: #495057;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
}

.error-help h4 {
  color: #6c757d;
  font-size: 1rem;
  margin: 1rem 0 0.5rem 0;
}

.error-help ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #6c757d;
}

.error-help li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.error-tips {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

/* Responsive design */
@media (max-width: 768px) {
  .error-display {
    padding: 1rem;
  }
  
  .error-container {
    padding: 1.5rem;
  }
  
  .error-header h1 {
    font-size: 2rem;
  }
  
  .primary-actions,
  .secondary-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-outline,
  .btn-danger {
    width: 100%;
    text-align: center;
  }
}
</style>
