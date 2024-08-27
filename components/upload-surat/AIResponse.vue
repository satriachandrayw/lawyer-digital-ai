<template>
  <div class="bg-gray-100 p-4 rounded-md mb-4">
    <h2 class="text-xl font-semibold mb-2 text-black">{{ isLoading ? 'Memuat Respons AI:' : 'Respons AI:' }}</h2>
    <p class="text-black mb-2">{{ isLoading ? 'Menerima respons dari model AI...' : '' }}</p>
    <div v-if="isLoading && !aiResponse" class="w-full flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    <div v-if="aiResponse" class="prose text-black">
      <VueMarkdown :source="aiResponse" :options="markdownOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import VueMarkdown from 'vue-markdown-render'

const props = defineProps({
  aiResponse: {
    type: String,
    required: false,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
})

const markdownOptions = {
  html: true,
  linkify: true,
  typographer: true,
}
</script>

<style>
/* Add any specific styles for AIResponse component */
</style>