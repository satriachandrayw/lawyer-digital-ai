<template>
  <div class="bg-gray-100 p-4 rounded-md mb-4">
    <h2 class="text-xl font-semibold mb-2 text-black">
      Memproses PDF:
    </h2>
    <p class="text-black mb-2">
      Sedang mengekstrak teks dari PDF menggunakan OCR...
    </p>
    <Progress
      :value="progress"
      class="w-full"
    />
    <p class="mt-2 text-sm text-gray-600">
      {{ progressText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  progress: number
}>()

const progressText = computed(() => {
  return `${Math.round(props.progress)}% complete`
})
</script>

<style>
/* Add any specific styles for ProcessingStatus component */
</style>
