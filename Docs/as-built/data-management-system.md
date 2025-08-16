# Data Management System - As Built Documentation

## System Overview

The Data Management System serves as the foundation for all game configuration and static data within the Time Hero Simulator. It handles CSV file import, data validation, transformation, and provides a reactive data store for game values. This system ensures data integrity, supports hot-reloading of configuration changes, and provides a single source of truth for all game parameters.

In simple terms: This system is the "librarian" of the simulator. It reads all the game configuration files (like crop growth times, adventure rewards, upgrade costs) and makes sure the data is correct and usable. When the development team changes a crop's energy cost in a spreadsheet, this system makes sure that change gets properly loaded into the simulator.

## System Connections

### Inputs
- **CSV Configuration Files**: Static game data (crops.csv, adventures.csv, upgrades.csv)
- **Validation Rules**: Data integrity requirements and business logic constraints
- **Schema Definitions**: Expected data structure and type information
- **Hot Reload Requests**: Development-time configuration updates
- **External Data Sources**: Potential future integration with external APIs

### Outputs
- **Validated Game Values**: Clean, structured game configuration data
- **Data Store Updates**: Reactive updates to Pinia stores when data changes
- **Validation Reports**: Error messages and warnings for invalid data
- **Lookup Tables**: Optimized data structures for fast game logic access
- **Export Formats**: Data transformation for external tools and reporting

## Technical Implementation

### Core Architecture

The Data Management System follows a pipeline architecture with distinct stages:

1. **Import Stage** - Raw CSV file reading and parsing
2. **Validation Stage** - Data integrity checking and error reporting  
3. **Transformation Stage** - Data normalization and structure optimization
4. **Storage Stage** - Reactive store management and update propagation
5. **Access Stage** - Optimized data retrieval for game logic

### CSV Import and Parsing System

#### File Import Infrastructure
```javascript
class GameDataImporter {
  constructor() {
    this.parsers = {
      crops: new CropDataParser(),
      adventures: new AdventureDataParser(), 
      upgrades: new UpgradeDataParser()
    }
    this.validationRules = new ValidationRuleEngine()
  }
  
  async loadAllGameData() {
    try {
      const rawData = await this.loadRawDataFiles()
      const validatedData = await this.validateAndTransformData(rawData)
      const optimizedData = this.optimizeDataStructures(validatedData)
      
      return {
        success: true,
        data: optimizedData,
        metadata: this.generateMetadata(optimizedData)
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        validationErrors: this.validationErrors
      }
    }
  }
  
  async loadRawDataFiles() {
    const files = ['crops.csv', 'adventures.csv', 'upgrades.csv']
    const rawData = {}
    
    for (const filename of files) {
      const response = await fetch(`/data/${filename}`)
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.statusText}`)
      }
      
      const csvText = await response.text()
      const dataType = filename.replace('.csv', '')
      rawData[dataType] = this.parseCSV(csvText, dataType)
    }
    
    return rawData
  }
}
```

#### CSV Parsing Implementation
```javascript
function parseCSV(csvText, dataType) {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const rows = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('#')) continue // Skip empty lines and comments
    
    const values = this.parseCSVLine(line)
    if (values.length !== headers.length) {
      throw new Error(`Row ${i}: Expected ${headers.length} columns, got ${values.length}`)
    }
    
    const row = {}
    headers.forEach((header, index) => {
      row[header] = this.parseValue(values[index], header, dataType)
    })
    
    rows.push(row)
  }
  
  return rows
}

function parseCSVLine(line) {
  const values = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  values.push(current.trim())
  return values
}
```

#### Type-Aware Value Parsing
```javascript
function parseValue(value, header, dataType) {
  // Remove quotes if present
  value = value.replace(/^"(.*)"$/, '$1')
  
  // Handle empty values
  if (value === '' || value === 'null') {
    return null
  }
  
  // Get expected type from schema
  const expectedType = this.getExpectedType(header, dataType)
  
  switch (expectedType) {
    case 'number':
      const num = parseFloat(value)
      if (isNaN(num)) {
        throw new Error(`Invalid number: "${value}" in column "${header}"`)
      }
      return num
      
    case 'integer':
      const int = parseInt(value, 10)
      if (isNaN(int) || int.toString() !== value) {
        throw new Error(`Invalid integer: "${value}" in column "${header}"`)
      }
      return int
      
    case 'boolean':
      const lower = value.toLowerCase()
      if (lower === 'true' || lower === '1' || lower === 'yes') return true
      if (lower === 'false' || lower === '0' || lower === 'no') return false
      throw new Error(`Invalid boolean: "${value}" in column "${header}"`)
      
    case 'array':
      try {
        return value.split(';').map(item => item.trim()).filter(item => item.length > 0)
      } catch (error) {
        throw new Error(`Invalid array format: "${value}" in column "${header}"`)
      }
      
    case 'object':
      try {
        return JSON.parse(value)
      } catch (error) {
        throw new Error(`Invalid JSON object: "${value}" in column "${header}"`)
      }
      
    default:
      return value // String type
  }
}
```

### Data Validation System

#### Schema-Based Validation
```javascript
class ValidationRuleEngine {
  constructor() {
    this.schemas = {
      crops: {
        id: { type: 'string', required: true, unique: true },
        name: { type: 'string', required: true },
        energy: { type: 'integer', required: true, min: 1, max: 100 },
        growthTime: { type: 'integer', required: true, min: 5, max: 1440 },
        stages: { type: 'integer', required: true, min: 1, max: 10 },
        baseReward: { type: 'number', required: true, min: 0 },
        requirements: { type: 'object', required: false }
      },
      adventures: {
        id: { type: 'string', required: true, unique: true },
        name: { type: 'string', required: true },
        location: { type: 'string', required: true },
        difficulty: { type: 'integer', required: true, min: 1, max: 10 },
        energyCost: { type: 'integer', required: true, min: 1, max: 50 },
        goldReward: { type: 'array', required: true },
        materialRewards: { type: 'object', required: false }
      },
      upgrades: {
        id: { type: 'string', required: true, unique: true },
        name: { type: 'string', required: true },
        description: { type: 'string', required: true },
        cost: { type: 'integer', required: true, min: 1 },
        requirements: { type: 'object', required: false },
        effects: { type: 'object', required: true }
      }
    }
  }
  
  validateData(data, dataType) {
    const schema = this.schemas[dataType]
    if (!schema) {
      throw new Error(`No validation schema for data type: ${dataType}`)
    }
    
    const errors = []
    const uniqueValues = new Map()
    
    // Initialize unique value tracking
    Object.entries(schema).forEach(([field, rules]) => {
      if (rules.unique) {
        uniqueValues.set(field, new Set())
      }
    })
    
    // Validate each row
    data.forEach((row, index) => {
      const rowErrors = this.validateRow(row, schema, index, uniqueValues)
      errors.push(...rowErrors)
    })
    
    // Additional cross-row validations
    const crossValidationErrors = this.performCrossValidation(data, dataType)
    errors.push(...crossValidationErrors)
    
    return errors
  }
  
  validateRow(row, schema, rowIndex, uniqueValues) {
    const errors = []
    
    // Check required fields
    Object.entries(schema).forEach(([field, rules]) => {
      const value = row[field]
      
      // Required field validation
      if (rules.required && (value === null || value === undefined)) {
        errors.push({
          row: rowIndex,
          field,
          type: 'required',
          message: `Required field "${field}" is missing`
        })
        return
      }
      
      if (value === null || value === undefined) return
      
      // Type validation
      if (!this.validateType(value, rules.type)) {
        errors.push({
          row: rowIndex,
          field,
          type: 'type',
          message: `Field "${field}" should be of type ${rules.type}, got ${typeof value}`
        })
        return
      }
      
      // Range validation for numbers
      if (rules.type === 'number' || rules.type === 'integer') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push({
            row: rowIndex,
            field,
            type: 'range',
            message: `Field "${field}" value ${value} is below minimum ${rules.min}`
          })
        }
        
        if (rules.max !== undefined && value > rules.max) {
          errors.push({
            row: rowIndex,
            field,
            type: 'range',
            message: `Field "${field}" value ${value} exceeds maximum ${rules.max}`
          })
        }
      }
      
      // Uniqueness validation
      if (rules.unique) {
        const uniqueSet = uniqueValues.get(field)
        if (uniqueSet.has(value)) {
          errors.push({
            row: rowIndex,
            field,
            type: 'unique',
            message: `Duplicate value "${value}" in field "${field}"`
          })
        } else {
          uniqueSet.add(value)
        }
      }
    })
    
    return errors
  }
}
```

#### Business Logic Validation
```javascript
function performCrossValidation(data, dataType) {
  const errors = []
  
  switch (dataType) {
    case 'crops':
      errors.push(...this.validateCropProgression(data))
      errors.push(...this.validateCropEconomy(data))
      break
      
    case 'adventures':
      errors.push(...this.validateAdventureBalance(data))
      errors.push(...this.validateRewardRatios(data))
      break
      
    case 'upgrades':
      errors.push(...this.validateUpgradeProgression(data))
      errors.push(...this.validateUpgradeDependencies(data))
      break
  }
  
  return errors
}

function validateCropProgression(crops) {
  const errors = []
  
  // Validate energy cost progression
  const sortedByEnergy = crops.sort((a, b) => a.energy - b.energy)
  
  for (let i = 1; i < sortedByEnergy.length; i++) {
    const prev = sortedByEnergy[i - 1]
    const curr = sortedByEnergy[i]
    
    // Higher energy crops should generally have better rewards
    const prevRatio = prev.baseReward / prev.energy
    const currRatio = curr.baseReward / curr.energy
    
    if (currRatio < prevRatio * 0.8) { // Allow some variance
      errors.push({
        type: 'progression',
        message: `Crop "${curr.name}" may have poor energy efficiency compared to "${prev.name}"`
      })
    }
  }
  
  return errors
}
```

### Data Transformation and Optimization

#### Structure Optimization
```javascript
function optimizeDataStructures(validatedData) {
  const optimized = {}
  
  // Convert arrays to objects with ID keys for O(1) lookup
  optimized.crops = this.arrayToLookupObject(validatedData.crops, 'id')
  optimized.adventures = this.arrayToLookupObject(validatedData.adventures, 'id')
  optimized.upgrades = this.arrayToLookupObject(validatedData.upgrades, 'id')
  
  // Create additional lookup structures
  optimized.cropsByEnergyRequirement = this.groupCropsByEnergyRequirement(validatedData.crops)
  optimized.adventuresByDifficulty = this.groupAdventuresByDifficulty(validatedData.adventures)
  optimized.upgradesByCategory = this.groupUpgradesByCategory(validatedData.upgrades)
  
  // Pre-calculate commonly used values
  optimized.maxCropEnergy = Math.max(...validatedData.crops.map(c => c.energy))
  optimized.maxAdventureDifficulty = Math.max(...validatedData.adventures.map(a => a.difficulty))
  optimized.totalUpgradeCost = validatedData.upgrades.reduce((sum, u) => sum + u.cost, 0)
  
  return optimized
}

function arrayToLookupObject(array, keyField) {
  const lookup = {}
  array.forEach(item => {
    lookup[item[keyField]] = item
  })
  return lookup
}

function groupCropsByEnergyRequirement(crops) {
  const groups = { low: [], medium: [], high: [] }
  
  crops.forEach(crop => {
    if (crop.energy <= 10) {
      groups.low.push(crop)
    } else if (crop.energy <= 25) {
      groups.medium.push(crop)
    } else {
      groups.high.push(crop)
    }
  })
  
  return groups
}
```

#### Dynamic Relationship Building
```javascript
function buildDataRelationships(gameValues) {
  // Build upgrade dependency tree
  gameValues.upgradeDependencies = this.buildUpgradeDependencyTree(gameValues.upgrades)
  
  // Build adventure unlock progression
  gameValues.adventureProgression = this.buildAdventureProgression(gameValues.adventures)
  
  // Build crop efficiency rankings
  gameValues.cropEfficiencyRankings = this.buildCropEfficiencyRankings(gameValues.crops)
  
  return gameValues
}

function buildUpgradeDependencyTree(upgrades) {
  const tree = {}
  
  Object.values(upgrades).forEach(upgrade => {
    tree[upgrade.id] = {
      dependencies: upgrade.requirements?.upgrades || [],
      dependents: []
    }
  })
  
  // Build reverse dependencies
  Object.entries(tree).forEach(([upgradeId, node]) => {
    node.dependencies.forEach(depId => {
      if (tree[depId]) {
        tree[depId].dependents.push(upgradeId)
      }
    })
  })
  
  return tree
}
```

### Reactive Data Store Integration

#### Pinia Store Implementation
```javascript
export const useGameValuesStore = defineStore('gameValues', () => {
  // Core data state
  const crops = ref({})
  const adventures = ref({})
  const upgrades = ref({})
  
  // Derived state
  const isLoaded = ref(false)
  const validationErrors = ref([])
  const lastUpdated = ref(null)
  
  // Optimized lookup structures
  const cropsByEnergy = computed(() => groupCropsByEnergyRequirement(Object.values(crops.value)))
  const upgradesByCategory = computed(() => groupUpgradesByCategory(Object.values(upgrades.value)))
  
  // All game values combined (for worker synchronization)
  const allGameValues = computed(() => ({
    crops: crops.value,
    adventures: adventures.value,
    upgrades: upgrades.value,
    metadata: {
      isLoaded: isLoaded.value,
      lastUpdated: lastUpdated.value,
      validationErrors: validationErrors.value
    }
  }))
  
  // Actions
  async function loadGameValues(data) {
    try {
      crops.value = data.crops
      adventures.value = data.adventures
      upgrades.value = data.upgrades
      
      isLoaded.value = true
      lastUpdated.value = new Date().toISOString()
      validationErrors.value = []
      
      console.log('✅ Game values loaded successfully')
    } catch (error) {
      console.error('❌ Failed to load game values:', error)
      validationErrors.value.push(error.message)
    }
  }
  
  function validateGameValues() {
    const validator = new ValidationRuleEngine()
    const errors = []
    
    errors.push(...validator.validateData(Object.values(crops.value), 'crops'))
    errors.push(...validator.validateData(Object.values(adventures.value), 'adventures'))
    errors.push(...validator.validateData(Object.values(upgrades.value), 'upgrades'))
    
    validationErrors.value = errors
    
    if (errors.length > 0) {
      console.warn('⚠️ Game value validation warnings:', errors)
    }
    
    return errors.length === 0
  }
  
  return {
    // State
    crops: readonly(crops),
    adventures: readonly(adventures),
    upgrades: readonly(upgrades),
    isLoaded: readonly(isLoaded),
    validationErrors: readonly(validationErrors),
    
    // Computed
    cropsByEnergy,
    upgradesByCategory,
    allGameValues,
    
    // Actions
    loadGameValues,
    validateGameValues
  }
})
```

### Hot Reload and Development Support

#### Development Mode Features
```javascript
class DevelopmentDataManager {
  constructor() {
    this.watchMode = process.env.NODE_ENV === 'development'
    this.fileWatchers = new Map()
  }
  
  enableHotReload() {
    if (!this.watchMode) return
    
    const files = ['crops.csv', 'adventures.csv', 'upgrades.csv']
    
    files.forEach(filename => {
      const watcher = this.createFileWatcher(filename)
      this.fileWatchers.set(filename, watcher)
    })
    
    console.log('🔥 Hot reload enabled for game data files')
  }
  
  createFileWatcher(filename) {
    // In a real implementation, this would use fs.watch or chokidar
    return {
      onChange: async () => {
        console.log(`📁 File changed: ${filename}`)
        try {
          await this.reloadDataFile(filename)
          console.log(`✅ Hot reloaded: ${filename}`)
        } catch (error) {
          console.error(`❌ Hot reload failed for ${filename}:`, error)
        }
      }
    }
  }
  
  async reloadDataFile(filename) {
    const gameValues = useGameValuesStore()
    const importer = new GameDataImporter()
    
    // Reload just the changed file
    const dataType = filename.replace('.csv', '')
    const newData = await importer.loadSingleFile(filename, dataType)
    
    // Update store
    gameValues.updateDataType(dataType, newData)
    
    // Trigger validation
    gameValues.validateGameValues()
  }
}
```

### Data Export and Integration

#### Export Capabilities
```javascript
class DataExporter {
  exportToJSON(gameValues) {
    return JSON.stringify({
      version: '1.0.0',
      exported: new Date().toISOString(),
      data: gameValues
    }, null, 2)
  }
  
  exportToCSV(gameValues, dataType) {
    const data = gameValues[dataType]
    if (!data) throw new Error(`No data found for type: ${dataType}`)
    
    const items = Object.values(data)
    if (items.length === 0) return ''
    
    // Generate headers
    const headers = Object.keys(items[0])
    
    // Generate CSV content
    const csvLines = [headers.join(',')]
    
    items.forEach(item => {
      const values = headers.map(header => {
        const value = item[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value
      })
      csvLines.push(values.join(','))
    })
    
    return csvLines.join('\n')
  }
  
  exportForExternalTools(gameValues, format) {
    switch (format) {
      case 'unity':
        return this.exportForUnity(gameValues)
      case 'excel':
        return this.exportForExcel(gameValues)
      case 'database':
        return this.exportForDatabase(gameValues)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }
}
```

### Performance and Caching

#### Intelligent Caching
```javascript
class DataCache {
  constructor() {
    this.cache = new Map()
    this.maxAge = 5 * 60 * 1000 // 5 minutes
  }
  
  get(key) {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
  
  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}
```

### Error Handling and Recovery

#### Graceful Error Handling
```javascript
function handleDataLoadError(error, fallbackStrategy = 'default') {
  console.error('Data load error:', error)
  
  switch (fallbackStrategy) {
    case 'cache':
      return this.loadFromCache()
    case 'default':
      return this.loadDefaultGameValues()
    case 'partial':
      return this.loadPartialData()
    default:
      throw new Error('All data loading strategies failed')
  }
}

function loadDefaultGameValues() {
  return {
    crops: {
      'wheat': { id: 'wheat', name: 'Wheat', energy: 5, growthTime: 60, baseReward: 10 },
      'corn': { id: 'corn', name: 'Corn', energy: 8, growthTime: 90, baseReward: 18 }
    },
    adventures: {
      'forest': { id: 'forest', name: 'Forest Exploration', difficulty: 1, energyCost: 10, goldReward: [15, 25] }
    },
    upgrades: {
      'energy_boost': { id: 'energy_boost', name: 'Energy Boost', cost: 100, effects: { energyCap: 20 } }
    }
  }
}
```

## Code References

### Primary Implementation Files
- `/src/utils/importers.js` - Main CSV import and parsing logic
- `/src/stores/gameValues.js` - Reactive data store for game configuration
- `/src/utils/dataValidation.js` - Validation rules and error checking
- `/src/utils/dataTransformation.js` - Data optimization and relationship building

### Data Files and Configuration
- `/data/crops.csv` - Crop definitions and growth parameters
- `/data/adventures.csv` - Adventure definitions and reward structures
- `/data/upgrades.csv` - Upgrade definitions and requirements
- `/public/data/` - Public data files for production deployment

### Supporting Utilities
- `/src/utils/csvParser.js` - Core CSV parsing functionality
- `/src/utils/dataExport.js` - Export capabilities for external tools
- `/src/utils/hotReload.js` - Development-time hot reload support
- `/src/utils/dataCache.js` - Performance optimization through caching

### Integration Points
- `/src/App.vue` - Initial data loading and error handling
- `/src/components/DataValidator.vue` - Data validation UI component
- `/src/workers/dataWorker.js` - Background data processing
- `/src/utils/workerManager.js` - Data synchronization with workers

## Future Considerations

### Advanced Data Sources
- **Database Integration**: Direct connection to SQL/NoSQL databases
- **API Integration**: Real-time data from external game analytics services
- **Version Control**: Git-based versioning of game configuration changes
- **Collaborative Editing**: Multi-user editing with conflict resolution

### Enhanced Validation
- **Machine Learning Validation**: AI-powered detection of balance issues
- **Historical Validation**: Compare changes against historical performance data
- **Cross-Game Validation**: Validate against data from similar games
- **Real-time Validation**: Continuous validation against live player data

### Performance Optimization
- **Streaming Data**: Large dataset support through streaming processing
- **Incremental Updates**: Only update changed portions of data
- **Compression**: Data compression for faster loading and reduced bandwidth
- **CDN Integration**: Content delivery network for global data distribution
