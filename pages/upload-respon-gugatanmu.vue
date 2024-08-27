<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Unggah Surat Gugatan Anda</h1>
    <FileUpload @file-uploaded="handleFileChange" :is-processing="isProcessing" />
    
    <ProcessingStatus v-if="isProcessing" :progress="progress" />
    
    <AIResponse v-if="processState === 'Waiting AI Response'" :ai-response="aiResponse" :is-loading="isLoading" />
    
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { useAIProcessing } from '@/composables/useAIProcessing'
import FileUpload from '@/components/upload-surat/FileUpload.vue'
import ProcessingStatus from '@/components/upload-surat/ProcessingStatus.vue'
import AIResponse from '@/components/upload-surat/AIResponse.vue'

const error = ref<string | null>(null)
const { processFile, isProcessing, aiResponse, progress, isLoading, processState } = useAIProcessing()

const handleFileChange = (event: Event) => {
  error.value = null  // Clear any previous errors
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    handleSubmit(file)
  }
}

const handleSubmit = async (file: File) => {
  try {
    error.value = null  // Clear any previous errors
    await processFile(file)
  } catch (err) {
    console.error('Kesalahan saat memproses file:', err)
    error.value = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses file'
  }
}

// Watch for changes in aiResponse
watch(aiResponse, (newValue) => {
  console.log('AI Response updated:', newValue)
  console.log('Type of AI Response:', typeof newValue)
})
</script>

<style>
.prose {
  max-width: 65ch;
  @apply text-sm leading-normal;
}
.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  @apply font-bold my-4;
}
.prose p {
  @apply my-2;
}
.prose ul, .prose ol {
  @apply my-2 pl-5;
}
.prose li {
  @apply my-1;
}
.prose pre {
  @apply bg-gray-100 p-2 rounded;
}
.prose code {
  @apply bg-gray-100 px-1 rounded;
}
</style>