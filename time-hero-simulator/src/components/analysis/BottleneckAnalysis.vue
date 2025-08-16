<template>
  <div class="space-y-6">
    <div class="card">
      <div class="card-header">
        <h3 class="text-lg font-semibold text-white">Bottleneck Analysis</h3>
      </div>
      <div class="card-body">
        <p class="text-slate-400">Bottleneck detection for {{ simulation?.name || 'Unknown' }}</p>
        <!-- Implementation placeholder -->
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  simulation: Object
})
</script>
