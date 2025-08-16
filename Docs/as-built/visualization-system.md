# Visualization System - As Built Documentation

## System Overview

The Visualization System provides real-time, interactive visual representation of simulation data and game state within the Time Hero Simulator. It encompasses chart generation, UI components, real-time updates, and data presentation layers that transform complex simulation data into intuitive visual insights. This system enables users to understand game balance, identify patterns, and make informed decisions through comprehensive data visualization.

In simple terms: This system is the "artist" of the simulator. It takes all the numbers, data, and analysis results and turns them into charts, graphs, and visual displays that humans can easily understand. Instead of looking at thousands of rows of data, users see beautiful charts that clearly show whether the game balance is working correctly.

## System Connections

### Inputs
- **Real-time Game State**: Live simulation data from the Simulation Engine
- **Analysis Results**: Statistical data from Monte Carlo, A/B testing, and bottleneck analysis
- **Historical Data**: Trend data and historical simulation results
- **User Preferences**: Display settings, chart configurations, and view preferences
- **Performance Metrics**: System performance data for monitoring displays

### Outputs
- **Interactive Charts**: Real-time updating visualizations of game data
- **Dashboard Components**: Organized displays of key metrics and insights
- **Export Formats**: Chart images, data tables, and presentation materials
- **UI Updates**: Reactive interface updates based on data changes
- **Alert Notifications**: Visual alerts for significant events or anomalies

## Technical Implementation

### Core Architecture

The Visualization System follows a component-based architecture with reactive data binding:

1. **Chart Engine** - Core charting library integration (Chart.js)
2. **Component Layer** - Vue.js components for different visualization types
3. **Data Pipeline** - Real-time data transformation and formatting
4. **Update Manager** - Efficient update handling for smooth performance
5. **Export System** - Multi-format export capabilities

### Chart Engine Integration

#### Chart.js Foundation
```javascript
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

class ChartManager {
  constructor() {
    this.charts = new Map()
    this.updateQueue = []
    this.isUpdating = false
  }
  
  createChart(canvasId, config) {
    const canvas = document.getElementById(canvasId)
    if (!canvas) throw new Error(`Canvas not found: ${canvasId}`)
    
    const chart = new ChartJS(canvas, {
      ...config,
      options: {
        ...config.options,
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 300,
          easing: 'easeInOutQuart'
        }
      }
    })
    
    this.charts.set(canvasId, chart)
    return chart
  }
}
```

#### Real-time Data Binding
```javascript
class ReactiveChartComponent {
  setup(props) {
    const chartRef = ref(null)
    const chartInstance = ref(null)
    
    // Watch for data changes
    watch(() => props.data, (newData) => {
      this.updateChartData(newData)
    }, { deep: true })
    
    // Watch for configuration changes
    watch(() => props.options, (newOptions) => {
      this.updateChartOptions(newOptions)
    }, { deep: true })
    
    onMounted(() => {
      this.initializeChart()
    })
    
    onUnmounted(() => {
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }
    })
    
    return { chartRef, chartInstance }
  }
  
  updateChartData(newData) {
    if (!this.chartInstance.value) return
    
    // Efficient data update without full re-render
    this.chartInstance.value.data = newData
    this.chartInstance.value.update('none') // No animation for real-time updates
  }
}
```

### Component System Architecture

#### Resource Chart Component
```javascript
// ResourceChart.vue
<script setup>
import { computed, ref, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { useSimulationStore } from '../stores/simulation.js'

const simulation = useSimulationStore()

const chartOptions = ref({
  responsive: true,
  scales: {
    x: {
      type: 'linear',
      title: {
        display: true,
        text: 'Game Time (hours)'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Resource Amount'
      },
      beginAtZero: true
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        title: (context) => `Hour ${context[0].parsed.x}`,
        label: (context) => `${context.dataset.label}: ${context.parsed.y}`
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
})

const chartData = computed(() => {
  const history = simulation.resourceHistory
  if (!history || history.length === 0) return { datasets: [] }
  
  return {
    datasets: [
      {
        label: 'Energy',
        data: history.map(h => ({ x: h.gameTime, y: h.energy })),
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        fill: false,
        tension: 0.2
      },
      {
        label: 'Gold',
        data: history.map(h => ({ x: h.gameTime, y: h.gold })),
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
        fill: false,
        tension: 0.2
      },
      {
        label: 'Water',
        data: history.map(h => ({ x: h.gameTime, y: h.water })),
        borderColor: '#06b6d4',
        backgroundColor: '#06b6d4',
        fill: false,
        tension: 0.2
      }
    ]
  }
})
</script>
```

#### Advanced Analysis Visualization
```javascript
// MonteCarloChart.vue
<script setup>
import { computed } from 'vue'
import { Bar, Line } from 'vue-chartjs'

const props = defineProps({
  results: Object,
  showConfidenceIntervals: Boolean
})

const distributionChart = computed(() => {
  if (!props.results?.distributions) return null
  
  const histogram = props.results.distributions.completionTime
  
  return {
    type: 'bar',
    data: {
      labels: histogram.bins.map(bin => `${bin.min}-${bin.max}h`),
      datasets: [{
        label: 'Frequency',
        data: histogram.bins.map(bin => bin.count),
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Completion Time Distribution'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const percentage = ((context.parsed.y / props.results.summary.totalRuns) * 100).toFixed(1)
              return `${context.parsed.y} runs (${percentage}%)`
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Completion Time (hours)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Number of Simulations'
          },
          beginAtZero: true
        }
      }
    }
  }
})

const confidenceIntervalChart = computed(() => {
  if (!props.results?.confidenceIntervals || !props.showConfidenceIntervals) return null
  
  const intervals = props.results.confidenceIntervals
  
  return {
    type: 'bar',
    data: {
      labels: Object.keys(intervals),
      datasets: [
        {
          label: 'Mean',
          data: Object.values(intervals).map(ci => ci.mean),
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 2
        },
        {
          label: 'Lower Bound (95% CI)',
          data: Object.values(intervals).map(ci => ci.lowerBound),
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 1
        },
        {
          label: 'Upper Bound (95% CI)',
          data: Object.values(intervals).map(ci => ci.upperBound),
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Key Metrics with 95% Confidence Intervals'
        }
      }
    }
  }
})
</script>
```

### Performance Optimization System

#### Efficient Update Management
```javascript
class ChartUpdateManager {
  constructor() {
    this.updateQueue = new Map()
    this.isProcessing = false
    this.batchSize = 10
    this.updateInterval = 100 // ms
  }
  
  scheduleUpdate(chartId, data, priority = 'normal') {
    this.updateQueue.set(chartId, {
      data,
      priority,
      timestamp: Date.now()
    })
    
    if (!this.isProcessing) {
      this.processUpdates()
    }
  }
  
  async processUpdates() {
    this.isProcessing = true
    
    try {
      while (this.updateQueue.size > 0) {
        const batch = this.getBatch()
        await this.processBatch(batch)
        await this.sleep(this.updateInterval)
      }
    } finally {
      this.isProcessing = false
    }
  }
  
  getBatch() {
    const batch = []
    const entries = Array.from(this.updateQueue.entries())
    
    // Sort by priority and timestamp
    entries.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 }
      const priorityDiff = priorityOrder[b[1].priority] - priorityOrder[a[1].priority]
      if (priorityDiff !== 0) return priorityDiff
      return a[1].timestamp - b[1].timestamp
    })
    
    // Take batch
    for (let i = 0; i < Math.min(this.batchSize, entries.length); i++) {
      const [chartId, update] = entries[i]
      batch.push({ chartId, ...update })
      this.updateQueue.delete(chartId)
    }
    
    return batch
  }
  
  async processBatch(batch) {
    const promises = batch.map(update => this.updateChart(update))
    await Promise.all(promises)
  }
}
```

#### Memory-Efficient Data Handling
```javascript
class DataStreamManager {
  constructor(maxDataPoints = 1000) {
    this.maxDataPoints = maxDataPoints
    this.dataStreams = new Map()
  }
  
  addDataPoint(streamId, dataPoint) {
    if (!this.dataStreams.has(streamId)) {
      this.dataStreams.set(streamId, [])
    }
    
    const stream = this.dataStreams.get(streamId)
    stream.push(dataPoint)
    
    // Maintain maximum data points
    if (stream.length > this.maxDataPoints) {
      // Remove older points but keep key milestones
      const milestones = this.extractMilestones(stream)
      const recent = stream.slice(-this.maxDataPoints * 0.8)
      this.dataStreams.set(streamId, [...milestones, ...recent])
    }
  }
  
  extractMilestones(data) {
    // Extract important data points (peaks, valleys, significant changes)
    const milestones = []
    
    for (let i = 1; i < data.length - 1; i++) {
      const prev = data[i - 1]
      const curr = data[i]
      const next = data[i + 1]
      
      // Peak detection
      if (curr.value > prev.value && curr.value > next.value) {
        milestones.push(curr)
      }
      
      // Valley detection
      if (curr.value < prev.value && curr.value < next.value) {
        milestones.push(curr)
      }
      
      // Significant change detection
      const changePercent = Math.abs((curr.value - prev.value) / prev.value)
      if (changePercent > 0.1) { // 10% change
        milestones.push(curr)
      }
    }
    
    return milestones
  }
}
```

### Interactive Features

#### Zoom and Pan Implementation
```javascript
class ChartInteractionManager {
  setupZoomAndPan(chart) {
    let isPanning = false
    let lastPanPoint = null
    
    chart.canvas.addEventListener('mousedown', (e) => {
      isPanning = true
      lastPanPoint = { x: e.clientX, y: e.clientY }
    })
    
    chart.canvas.addEventListener('mousemove', (e) => {
      if (!isPanning) return
      
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      
      this.panChart(chart, deltaX, deltaY)
      lastPanPoint = { x: e.clientX, y: e.clientY }
    })
    
    chart.canvas.addEventListener('mouseup', () => {
      isPanning = false
      lastPanPoint = null
    })
    
    chart.canvas.addEventListener('wheel', (e) => {
      e.preventDefault()
      this.zoomChart(chart, e.deltaY, e.clientX, e.clientY)
    })
  }
  
  panChart(chart, deltaX, deltaY) {
    const xAxis = chart.scales.x
    const yAxis = chart.scales.y
    
    const xRange = xAxis.max - xAxis.min
    const yRange = yAxis.max - yAxis.min
    
    const xPanAmount = (deltaX / chart.width) * xRange
    const yPanAmount = (deltaY / chart.height) * yRange
    
    chart.options.scales.x.min = xAxis.min - xPanAmount
    chart.options.scales.x.max = xAxis.max - xPanAmount
    chart.options.scales.y.min = yAxis.min + yPanAmount
    chart.options.scales.y.max = yAxis.max + yPanAmount
    
    chart.update('none')
  }
  
  zoomChart(chart, deltaY, centerX, centerY) {
    const zoomFactor = deltaY > 0 ? 1.1 : 0.9
    
    const xAxis = chart.scales.x
    const yAxis = chart.scales.y
    
    const xRange = xAxis.max - xAxis.min
    const yRange = yAxis.max - yAxis.min
    
    const newXRange = xRange * zoomFactor
    const newYRange = yRange * zoomFactor
    
    const xCenter = xAxis.getValueForPixel(centerX)
    const yCenter = yAxis.getValueForPixel(centerY)
    
    chart.options.scales.x.min = xCenter - newXRange / 2
    chart.options.scales.x.max = xCenter + newXRange / 2
    chart.options.scales.y.min = yCenter - newYRange / 2
    chart.options.scales.y.max = yCenter + newYRange / 2
    
    chart.update('none')
  }
}
```

#### Tooltip and Annotation System
```javascript
class AdvancedTooltipManager {
  createCustomTooltip(chart, config) {
    return {
      enabled: false,
      external: (context) => {
        const tooltip = this.getOrCreateTooltip(chart)
        const tooltipModel = context.tooltip
        
        if (tooltipModel.opacity === 0) {
          tooltip.style.opacity = 0
          return
        }
        
        // Set content
        if (tooltipModel.body) {
          const content = this.generateTooltipContent(tooltipModel, config)
          tooltip.innerHTML = content
        }
        
        // Position tooltip
        const position = Chart.helpers.getRelativePosition(context.chart.canvas, context.chart)
        tooltip.style.left = position.x + tooltipModel.caretX + 'px'
        tooltip.style.top = position.y + tooltipModel.caretY + 'px'
        tooltip.style.opacity = 1
      }
    }
  }
  
  generateTooltipContent(tooltipModel, config) {
    const dataPoint = tooltipModel.dataPoints[0]
    
    let content = `
      <div class="custom-tooltip">
        <div class="tooltip-header">
          ${config.title || 'Data Point'}
        </div>
        <div class="tooltip-body">
          <div class="tooltip-item">
            <span class="label">${dataPoint.dataset.label}:</span>
            <span class="value">${this.formatValue(dataPoint.parsed.y, config.format)}</span>
          </div>
    `
    
    // Add additional context if available
    if (config.additionalData) {
      const additionalInfo = config.additionalData(dataPoint)
      content += `
        <div class="tooltip-additional">
          ${additionalInfo}
        </div>
      `
    }
    
    content += `
        </div>
      </div>
    `
    
    return content
  }
}
```

### Export and Sharing System

#### Multi-Format Export
```javascript
class ChartExporter {
  async exportChart(chart, format, options = {}) {
    switch (format) {
      case 'png':
        return this.exportToPNG(chart, options)
      case 'svg':
        return this.exportToSVG(chart, options)
      case 'pdf':
        return this.exportToPDF(chart, options)
      case 'data':
        return this.exportData(chart, options)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }
  
  exportToPNG(chart, options) {
    const canvas = chart.canvas
    const ctx = canvas.getContext('2d')
    
    // Set background color if specified
    if (options.backgroundColor) {
      ctx.save()
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = options.backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
    }
    
    return canvas.toDataURL('image/png', options.quality || 1.0)
  }
  
  exportToSVG(chart, options) {
    // Convert chart to SVG format
    const svgString = this.chartToSVG(chart, options)
    return 'data:image/svg+xml;base64,' + btoa(svgString)
  }
  
  exportData(chart, options) {
    const data = chart.data.datasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data,
      metadata: {
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor
      }
    }))
    
    switch (options.dataFormat) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        return this.convertToCSV(data)
      default:
        return data
    }
  }
}
```

### Responsive Design System

#### Adaptive Layout Management
```javascript
class ResponsiveChartManager {
  constructor() {
    this.breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    }
    
    this.configurations = {
      mobile: {
        aspectRatio: 1,
        legend: { position: 'bottom' },
        tooltip: { mode: 'nearest' }
      },
      tablet: {
        aspectRatio: 1.5,
        legend: { position: 'right' },
        tooltip: { mode: 'index' }
      },
      desktop: {
        aspectRatio: 2,
        legend: { position: 'top' },
        tooltip: { mode: 'index' }
      }
    }
  }
  
  getResponsiveConfig(baseConfig) {
    const screenWidth = window.innerWidth
    let deviceType = 'desktop'
    
    if (screenWidth <= this.breakpoints.mobile) {
      deviceType = 'mobile'
    } else if (screenWidth <= this.breakpoints.tablet) {
      deviceType = 'tablet'
    }
    
    return this.mergeConfigurations(baseConfig, this.configurations[deviceType])
  }
  
  setupResizeHandler(chart) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newConfig = this.getResponsiveConfig(chart.config)
        chart.options = newConfig.options
        chart.update('resize')
      }
    })
    
    resizeObserver.observe(chart.canvas.parentElement)
    
    return () => resizeObserver.disconnect()
  }
}
```

### Accessibility Features

#### Screen Reader Support
```javascript
class ChartAccessibility {
  makeChartAccessible(chart, config) {
    const canvas = chart.canvas
    
    // Add ARIA labels
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', config.description || 'Data visualization chart')
    
    // Create data table for screen readers
    const dataTable = this.createDataTable(chart.data, config)
    const tableId = `chart-data-${chart.id}`
    dataTable.id = tableId
    dataTable.style.position = 'absolute'
    dataTable.style.left = '-9999px'
    
    canvas.parentElement.appendChild(dataTable)
    canvas.setAttribute('aria-describedby', tableId)
    
    // Add keyboard navigation
    this.addKeyboardNavigation(chart)
  }
  
  createDataTable(chartData, config) {
    const table = document.createElement('table')
    table.className = 'sr-only chart-data-table'
    
    // Create header
    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')
    headerRow.innerHTML = '<th>Category</th>'
    
    chartData.datasets.forEach(dataset => {
      const th = document.createElement('th')
      th.textContent = dataset.label
      headerRow.appendChild(th)
    })
    
    thead.appendChild(headerRow)
    table.appendChild(thead)
    
    // Create body with data
    const tbody = document.createElement('tbody')
    const labels = chartData.labels || []
    
    labels.forEach((label, index) => {
      const row = document.createElement('tr')
      const labelCell = document.createElement('td')
      labelCell.textContent = label
      row.appendChild(labelCell)
      
      chartData.datasets.forEach(dataset => {
        const cell = document.createElement('td')
        const value = dataset.data[index]
        cell.textContent = this.formatAccessibleValue(value, config)
        row.appendChild(cell)
      })
      
      tbody.appendChild(row)
    })
    
    table.appendChild(tbody)
    return table
  }
}
```

## Code References

### Core Implementation Files
- `/src/components/ResourceChart.vue` - Real-time resource visualization
- `/src/components/PhaseTimeline.vue` - Game phase progression chart
- `/src/components/UpgradeChart.vue` - Upgrade progression visualization
- `/src/components/BottleneckChart.vue` - Bottleneck analysis visualization
- `/src/components/MonteCarloResults.vue` - Statistical analysis results

### Chart Management Infrastructure
- `/src/utils/chartManager.js` - Core chart management and coordination
- `/src/utils/chartUpdater.js` - Efficient update handling for real-time data
- `/src/utils/chartExporter.js` - Multi-format export capabilities
- `/src/utils/chartAccessibility.js` - Accessibility features and screen reader support

### Data Processing for Visualization
- `/src/utils/dataFormatter.js` - Data transformation for chart consumption
- `/src/utils/colorPalette.js` - Consistent color schemes and theming
- `/src/utils/chartAnimations.js` - Smooth transitions and animation management
- `/src/utils/responsiveCharts.js` - Responsive design and mobile optimization

### Integration Points
- `/src/components/GameVisualizer.vue` - Main visualization dashboard
- `/src/stores/results.js` - Data source for visualization components
- `/src/components/AnalysisPanel.vue` - Advanced analysis visualization container
- `/src/App.vue` - Global chart configuration and theme management

## Future Considerations

### Advanced Visualization Features
- **3D Visualization**: Three-dimensional charts for complex multi-variable analysis
- **WebGL Acceleration**: GPU-accelerated rendering for large datasets
- **Virtual Reality**: VR-based data exploration for immersive analysis
- **Augmented Reality**: AR overlays for mobile data presentation

### Real-time Enhancements
- **WebSocket Integration**: Live data streaming from external sources
- **Progressive Loading**: Incremental chart updates for massive datasets
- **Predictive Visualization**: Show predicted trends alongside actual data
- **Collaborative Viewing**: Shared visualization sessions for team analysis

### AI-Powered Features
- **Automated Insights**: AI-generated annotations and insights on charts
- **Anomaly Highlighting**: Automatic detection and highlighting of unusual patterns
- **Smart Recommendations**: AI suggestions for better chart types and configurations
- **Natural Language Queries**: Voice and text-based chart interaction
