<template>
  <div class="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
    <div
      class="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-in-out"
      :style="{ width: `${value}%` }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: number
}>()
</script>
