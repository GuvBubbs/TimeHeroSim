<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-lg font-semibold text-white mb-4">Edit {{ config?.singular || 'Item' }}</h2>
      
      <div class="space-y-4">
        <div v-for="column in config?.columns || []" :key="column.key">
          <label class="form-label">{{ column.label }}</label>
          
          <!-- Special handling for prerequisite fields -->
          <div v-if="column.key === 'prerequisite'" class="space-y-2">
            <div v-for="(prereq, index) in prerequisites" :key="index" class="flex items-center space-x-2">
              <input
                v-model="prerequisites[index]"
                type="text"
                class="form-input flex-1"
                placeholder="Enter prerequisite"
              />
              <button
                @click="removePrerequisite(index)"
                class="btn-danger px-2 py-1 text-sm"
                :disabled="prerequisites.length <= 1"
              >
                Remove
              </button>
            </div>
            <button
              @click="addPrerequisite"
              class="btn-primary px-3 py-1 text-sm flex items-center space-x-1"
            >
              <PlusIcon class="h-4 w-4" />
              <span>Add Prerequisite</span>
            </button>
          </div>
          
          <!-- Special handling for multi-value fields (materials, boss_materials, etc.) -->
          <div v-else-if="isMultiValueField(column.key)" class="space-y-2">
            <div v-for="(value, index) in getMultiValues(column.key)" :key="index" class="flex items-center space-x-2">
              <input
                v-model="getMultiValues(column.key)[index]"
                type="text"
                class="form-input flex-1"
                :placeholder="`Enter ${column.label.toLowerCase()}`"
              />
              <button
                @click="removeMultiValue(column.key, index)"
                class="btn-danger px-2 py-1 text-sm"
                :disabled="getMultiValues(column.key).length <= 1"
              >
                Remove
              </button>
            </div>
            <button
              @click="addMultiValue(column.key)"
              class="btn-primary px-3 py-1 text-sm flex items-center space-x-1"
            >
              <PlusIcon class="h-4 w-4" />
              <span>Add {{ column.label }}</span>
            </button>
          </div>
          
          <!-- Regular input fields -->
          <input
            v-else
            v-model="editedItem[column.key]"
            :type="column.type === 'number' ? 'number' : 'text'"
            class="form-input w-full"
          />
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button @click="$emit('cancel')" class="btn-secondary">Cancel</button>
        <button @click="saveChanges" class="btn-primary">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  item: Object,
  config: Object
})

const emit = defineEmits(['save', 'cancel'])

const editedItem = ref({})
const prerequisites = ref([])
const multiValueFields = ref({})

// Multi-value field definitions
const multiValueFieldNames = ['materials', 'boss_materials', 'common_materials', 'enemy_types', 'yields']

function isMultiValueField(key) {
  return multiValueFieldNames.includes(key)
}

function getMultiValues(key) {
  if (!multiValueFields.value[key]) {
    multiValueFields.value[key] = []
  }
  return multiValueFields.value[key]
}

function addMultiValue(key) {
  if (!multiValueFields.value[key]) {
    multiValueFields.value[key] = []
  }
  multiValueFields.value[key].push('')
}

function removeMultiValue(key, index) {
  if (multiValueFields.value[key] && multiValueFields.value[key].length > 1) {
    multiValueFields.value[key].splice(index, 1)
  }
}

function addPrerequisite() {
  prerequisites.value.push('')
}

function removePrerequisite(index) {
  if (prerequisites.value.length > 1) {
    prerequisites.value.splice(index, 1)
  }
}

function saveChanges() {
  // Combine prerequisites back into single field
  if (prerequisites.value.length > 0) {
    editedItem.value.prerequisite = prerequisites.value.filter(p => p.trim()).join(';')
  }
  
  // Combine multi-value fields back into single fields
  multiValueFieldNames.forEach(key => {
    if (multiValueFields.value[key]) {
      editedItem.value[key] = multiValueFields.value[key].filter(v => v.trim()).join(';')
    }
  })
  
  emit('save', editedItem.value)
}

watch(() => props.item, (newItem) => {
  if (newItem) {
    editedItem.value = { ...newItem }
    
    // Split prerequisites into array
    if (newItem.prerequisite) {
      prerequisites.value = newItem.prerequisite.split(/[;,]/).map(p => p.trim()).filter(p => p)
    } else {
      prerequisites.value = ['']
    }
    
    // Split multi-value fields into arrays
    multiValueFieldNames.forEach(key => {
      if (newItem[key]) {
        multiValueFields.value[key] = newItem[key].split(/[;,]/).map(v => v.trim()).filter(v => v)
      } else {
        multiValueFields.value[key] = ['']
      }
    })
  }
}, { immediate: true })
</script>
