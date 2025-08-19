/**
 * Quick test to verify our source field fix is working
 */

// Test the nodeClassification function
import { classifySource } from './src/utils/nodeClassification.js'

console.log('Testing source classification:')
console.log('Farm crop:', classifySource({name: 'Corn'}, 'crops'))
console.log('Adventure item:', classifySource({name: 'Quest'}, 'adventures'))
console.log('Mining item:', classifySource({name: 'Iron Ore'}, 'mining'))
console.log('Town blacksmith:', classifySource({name: 'Sword'}, 'townBlacksmith'))
console.log('Town agronomist:', classifySource({name: 'Seeds'}, 'townAgronomist'))

// Test a sample upgrade object with source field
const testUpgrade = {
  id: 'test-001',
  name: 'Test Upgrade',
  source: 'farm',
  area: 'crops'
}

console.log('\nTest upgrade source field:', testUpgrade.source)
