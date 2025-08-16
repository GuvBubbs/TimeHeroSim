<template>
  <div class="space-y-6">
    <div class="card">
      <div class="card-header">
        <h3 class="text-lg font-semibold text-white">Comparison Analysis</h3>
      </div>
      <div class="card-body">
        <p class="text-slate-400">Comparing {{ simulations?.length || 0 }} simulations</p>
        <!-- Implementation placeholder -->
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  simulations: Array
})
</script>
