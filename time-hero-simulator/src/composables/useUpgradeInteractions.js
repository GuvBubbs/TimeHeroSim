/**
 * useUpgradeInteractions Composable
 * 
 * Handles mouse, touch, and keyboard interactions for the upgrade tree
 * including zoom, pan, selection, and hover behaviors.
 */

import { ref, computed, nextTick } from 'vue'

export function useUpgradeInteractions(containerRef) {
  // Interaction state
  const isDragging = ref(false)
  const isZooming = ref(false)
  const dragStart = ref({ x: 0, y: 0 })
  const lastPanPosition = ref({ x: 0, y: 0 })
  const touches = ref([])
  const lastTouchDistance = ref(0)

  // View state
  const viewTransform = ref({
    zoom: 1.0,
    panX: 0,
    panY: 0
  })

  // Interaction settings
  const settings = ref({
    zoomSensitivity: 0.1,
    maxZoom: 3.0,
    minZoom: 0.25,
    panSensitivity: 1.0,
    doubleTapZoomFactor: 1.5,
    inertiaEnabled: true,
    boundariesEnabled: false // Whether to constrain panning to content bounds
  })

  // Computed transform string for CSS
  const transformStyle = computed(() => {
    return `translate(${viewTransform.value.panX}px, ${viewTransform.value.panY}px) scale(${viewTransform.value.zoom})`
  })

  /**
   * Mouse wheel handler for zoom and pan
   */
  const handleWheel = (event) => {
    event.preventDefault()
    
    if (event.ctrlKey || event.metaKey) {
      // Zoom
      handleZoom(event.deltaY, event.clientX, event.clientY)
    } else if (event.shiftKey) {
      // Horizontal pan
      handlePan(-event.deltaY * settings.value.panSensitivity, 0)
    } else {
      // Vertical pan
      handlePan(-event.deltaX * settings.value.panSensitivity, -event.deltaY * settings.value.panSensitivity)
    }
  }

  /**
   * Handle zoom operation
   */
  const handleZoom = (delta, centerX, centerY) => {
    const container = containerRef.value
    if (!container) return

    const rect = container.getBoundingClientRect()
    const zoomPoint = {
      x: centerX - rect.left,
      y: centerY - rect.top
    }

    const zoomFactor = 1 - (delta * settings.value.zoomSensitivity * 0.01)
    const newZoom = Math.max(
      settings.value.minZoom,
      Math.min(settings.value.maxZoom, viewTransform.value.zoom * zoomFactor)
    )

    if (newZoom !== viewTransform.value.zoom) {
      // Calculate new pan to keep zoom point stable
      const zoomRatio = newZoom / viewTransform.value.zoom
      const newPanX = zoomPoint.x - (zoomPoint.x - viewTransform.value.panX) * zoomRatio
      const newPanY = zoomPoint.y - (zoomPoint.y - viewTransform.value.panY) * zoomRatio

      viewTransform.value.zoom = newZoom
      viewTransform.value.panX = newPanX
      viewTransform.value.panY = newPanY
    }
  }

  /**
   * Handle pan operation
   */
  const handlePan = (deltaX, deltaY) => {
    viewTransform.value.panX += deltaX
    viewTransform.value.panY += deltaY

    // Apply boundaries if enabled
    if (settings.value.boundariesEnabled) {
      constrainToBounds()
    }
  }

  /**
   * Mouse down handler
   */
  const handleMouseDown = (event) => {
    if (event.button !== 0) return // Only left mouse button

    isDragging.value = true
    dragStart.value = { x: event.clientX, y: event.clientY }
    lastPanPosition.value = { x: viewTransform.value.panX, y: viewTransform.value.panY }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    event.preventDefault()
  }

  /**
   * Mouse move handler
   */
  const handleMouseMove = (event) => {
    if (!isDragging.value) return

    const deltaX = event.clientX - dragStart.value.x
    const deltaY = event.clientY - dragStart.value.y

    viewTransform.value.panX = lastPanPosition.value.x + deltaX
    viewTransform.value.panY = lastPanPosition.value.y + deltaY

    if (settings.value.boundariesEnabled) {
      constrainToBounds()
    }
  }

  /**
   * Mouse up handler
   */
  const handleMouseUp = () => {
    isDragging.value = false
    
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  /**
   * Touch start handler
   */
  const handleTouchStart = (event) => {
    touches.value = Array.from(event.touches)
    
    if (touches.value.length === 1) {
      // Single touch - start panning
      const touch = touches.value[0]
      isDragging.value = true
      dragStart.value = { x: touch.clientX, y: touch.clientY }
      lastPanPosition.value = { x: viewTransform.value.panX, y: viewTransform.value.panY }
    } else if (touches.value.length === 2) {
      // Two finger touch - start zooming
      isDragging.value = false
      isZooming.value = true
      lastTouchDistance.value = getTouchDistance(touches.value[0], touches.value[1])
    }

    event.preventDefault()
  }

  /**
   * Touch move handler
   */
  const handleTouchMove = (event) => {
    const currentTouches = Array.from(event.touches)
    
    if (currentTouches.length === 1 && isDragging.value) {
      // Single touch panning
      const touch = currentTouches[0]
      const deltaX = touch.clientX - dragStart.value.x
      const deltaY = touch.clientY - dragStart.value.y

      viewTransform.value.panX = lastPanPosition.value.x + deltaX
      viewTransform.value.panY = lastPanPosition.value.y + deltaY

      if (settings.value.boundariesEnabled) {
        constrainToBounds()
      }
    } else if (currentTouches.length === 2 && isZooming.value) {
      // Two finger zoom
      const distance = getTouchDistance(currentTouches[0], currentTouches[1])
      const zoomCenter = getTouchCenter(currentTouches[0], currentTouches[1])
      
      if (lastTouchDistance.value > 0) {
        const zoomFactor = distance / lastTouchDistance.value
        const newZoom = Math.max(
          settings.value.minZoom,
          Math.min(settings.value.maxZoom, viewTransform.value.zoom * zoomFactor)
        )

        if (newZoom !== viewTransform.value.zoom) {
          const container = containerRef.value
          if (container) {
            const rect = container.getBoundingClientRect()
            const zoomPoint = {
              x: zoomCenter.x - rect.left,
              y: zoomCenter.y - rect.top
            }

            const zoomRatio = newZoom / viewTransform.value.zoom
            const newPanX = zoomPoint.x - (zoomPoint.x - viewTransform.value.panX) * zoomRatio
            const newPanY = zoomPoint.y - (zoomPoint.y - viewTransform.value.panY) * zoomRatio

            viewTransform.value.zoom = newZoom
            viewTransform.value.panX = newPanX
            viewTransform.value.panY = newPanY
          }
        }
      }

      lastTouchDistance.value = distance
    }

    touches.value = currentTouches
    event.preventDefault()
  }

  /**
   * Touch end handler
   */
  const handleTouchEnd = (event) => {
    const remainingTouches = Array.from(event.touches)
    
    if (remainingTouches.length === 0) {
      // All touches ended
      isDragging.value = false
      isZooming.value = false
      touches.value = []
    } else if (remainingTouches.length === 1 && isZooming.value) {
      // Transition from zoom to pan
      isZooming.value = false
      isDragging.value = true
      const touch = remainingTouches[0]
      dragStart.value = { x: touch.clientX, y: touch.clientY }
      lastPanPosition.value = { x: viewTransform.value.panX, y: viewTransform.value.panY }
    }

    touches.value = remainingTouches
    event.preventDefault()
  }

  /**
   * Double click/tap to zoom
   */
  const handleDoubleClick = (event) => {
    const zoomFactor = viewTransform.value.zoom < 1 ? 
      settings.value.doubleTapZoomFactor : 
      1 / settings.value.doubleTapZoomFactor

    handleZoom(-100 * zoomFactor, event.clientX, event.clientY)
  }

  /**
   * Programmatic zoom controls
   */
  const zoomIn = (centerPoint) => {
    const center = centerPoint || getViewportCenter()
    handleZoom(-100, center.x, center.y)
  }

  const zoomOut = (centerPoint) => {
    const center = centerPoint || getViewportCenter()
    handleZoom(100, center.x, center.y)
  }

  const resetView = () => {
    viewTransform.value.zoom = 1.0
    viewTransform.value.panX = 0
    viewTransform.value.panY = 0
  }

  const fitToContent = (contentBounds) => {
    if (!containerRef.value || !contentBounds) return

    const container = containerRef.value
    const containerRect = container.getBoundingClientRect()
    
    const scaleX = containerRect.width / contentBounds.width
    const scaleY = containerRect.height / contentBounds.height
    const scale = Math.min(scaleX, scaleY, settings.value.maxZoom) * 0.9 // 90% to add padding

    const centerX = containerRect.width / 2
    const centerY = containerRect.height / 2
    const contentCenterX = contentBounds.x + contentBounds.width / 2
    const contentCenterY = contentBounds.y + contentBounds.height / 2

    viewTransform.value.zoom = scale
    viewTransform.value.panX = centerX - contentCenterX * scale
    viewTransform.value.panY = centerY - contentCenterY * scale
  }

  /**
   * Keyboard controls
   */
  const handleKeyDown = (event) => {
    const step = 50 / viewTransform.value.zoom

    switch (event.key) {
      case 'ArrowUp':
        handlePan(0, step)
        event.preventDefault()
        break
      case 'ArrowDown':
        handlePan(0, -step)
        event.preventDefault()
        break
      case 'ArrowLeft':
        handlePan(step, 0)
        event.preventDefault()
        break
      case 'ArrowRight':
        handlePan(-step, 0)
        event.preventDefault()
        break
      case '+':
      case '=':
        zoomIn()
        event.preventDefault()
        break
      case '-':
        zoomOut()
        event.preventDefault()
        break
      case '0':
        resetView()
        event.preventDefault()
        break
      case 'f':
      case 'F':
        if (event.ctrlKey || event.metaKey) {
          // Fit to content - would need content bounds
          event.preventDefault()
        }
        break
    }
  }

  /**
   * Helper functions
   */
  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchCenter = (touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }

  const getViewportCenter = () => {
    const container = containerRef.value
    if (!container) return { x: 0, y: 0 }

    const rect = container.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
  }

  const constrainToBounds = () => {
    // This would implement boundary constraints
    // For now, we allow unlimited panning
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  const screenToWorld = (screenX, screenY) => {
    const container = containerRef.value
    if (!container) return { x: screenX, y: screenY }

    const rect = container.getBoundingClientRect()
    const relativeX = screenX - rect.left
    const relativeY = screenY - rect.top

    return {
      x: (relativeX - viewTransform.value.panX) / viewTransform.value.zoom,
      y: (relativeY - viewTransform.value.panY) / viewTransform.value.zoom
    }
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  const worldToScreen = (worldX, worldY) => {
    const container = containerRef.value
    if (!container) return { x: worldX, y: worldY }

    const rect = container.getBoundingClientRect()
    
    return {
      x: rect.left + worldX * viewTransform.value.zoom + viewTransform.value.panX,
      y: rect.top + worldY * viewTransform.value.zoom + viewTransform.value.panY
    }
  }

  /**
   * Check if a point (in world coordinates) is visible in the viewport
   */
  const isPointVisible = (worldX, worldY) => {
    const screen = worldToScreen(worldX, worldY)
    const container = containerRef.value
    if (!container) return false

    const rect = container.getBoundingClientRect()
    return screen.x >= rect.left && 
           screen.x <= rect.right && 
           screen.y >= rect.top && 
           screen.y <= rect.bottom
  }

  /**
   * Get visible world bounds
   */
  const getVisibleBounds = () => {
    const container = containerRef.value
    if (!container) return null

    const rect = container.getBoundingClientRect()
    const topLeft = screenToWorld(0, 0)
    const bottomRight = screenToWorld(rect.width, rect.height)

    return {
      left: topLeft.x,
      top: topLeft.y,
      right: bottomRight.x,
      bottom: bottomRight.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    }
  }

  return {
    // State
    isDragging,
    isZooming,
    viewTransform,
    settings,

    // Computed
    transformStyle,

    // Event handlers
    handleWheel,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDoubleClick,
    handleKeyDown,

    // Controls
    zoomIn,
    zoomOut,
    resetView,
    fitToContent,
    handleZoom,
    handlePan,

    // Coordinate conversion
    screenToWorld,
    worldToScreen,
    isPointVisible,
    getVisibleBounds
  }
}
