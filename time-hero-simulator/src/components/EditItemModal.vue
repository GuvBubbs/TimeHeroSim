<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
      <h2 class="text-lg font-semibold text-white mb-4">Edit {{ config?.singular || 'Item' }}</h2>
      
      <div class="space-y-4">
        <div v-for="column in config?.columns || []" :key="column.key">
          <label class="form-label">{{ column.label }}</label>
          <input
            v-model="editedItem[column.key]"
            :type="column.type === 'number' ? 'number' : 'text'"
            class="form-input w-full"
          />
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button @click="$emit('cancel')" class="btn-secondary">Cancel</button>
        <button @click="$emit('save', editedItem)" class="btn-primary">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  item: Object,
  config: Object
})

const emit = defineEmits(['save', 'cancel'])

const editedItem = ref({})

watch(() => props.item, (newItem) => {
  if (newItem) {
    editedItem.value = { ...newItem }
  }
}, { immediate: true })
</script>
