<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Unggah Surat Gugatan Anda</h1>
    <form @submit.prevent="handleSubmit" class="mb-8">
      <div class="mb-4">
        <label for="pdfFile" class="block text-sm font-medium text-gray-700">Unggah File PDF</label>
        <input
          type="file"
          id="pdfFile"
          ref="fileInput"
          accept=".pdf"
          @change="handleFileChange"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
      </div>
      <button
        type="submit"
        :disabled="isProcessing"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {{ isProcessing ? 'Sedang Memproses...' : 'Proses File' }}
      </button>
    </form>
    
    <div v-if="isProcessing" class="bg-gray-100 p-4 rounded-md mb-4">
      <h2 class="text-xl font-semibold mb-2 text-black">Memproses PDF:</h2>
      <p class="text-black mb-2">Sedang mengekstrak teks dari PDF...</p>
      <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: `${Math.round(progress)}%` }"></div>
      </div>
      <p class="text-sm text-gray-600 mt-1">Progress: {{ Math.round(progress) }}%</p>
    </div>
    
    <div v-if="isLoading && !isProcessing" class="bg-gray-100 p-4 rounded-md mb-4">
      <h2 class="text-xl font-semibold mb-2 text-black">Memuat Respons AI:</h2>
      <p class="text-black mb-2">Sedang menunggu respons dari model AI...</p>
      <div class="w-full flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    </div>
    
    <div v-if="aiResponse && !isLoading && !isProcessing" class="bg-gray-100 p-4 rounded-md">
      <h2 class="text-xl font-semibold mb-2 text-black">Respons AI:</h2>
      <VueMarkdown :source="aiResponse" :options="markdownOptions" class="prose text-black" />
    </div>
    
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAIProcessing } from '@/composables/useAIProcessing'
import VueMarkdown from 'vue-markdown-render'

const fileInput = ref<HTMLInputElement | null>(null)
const error = ref<string | null>(null)
const isLoading = ref<boolean>(false)
const { processFile, isProcessing, aiResponse, progress } = useAIProcessing()

const markdownOptions = {
  html: true,
  linkify: true,
  typographer: true,
}

const handleFileChange = (event: Event) => {
  error.value = null  // Clear any previous errors
}

const handleSubmit = async () => {
  if (!fileInput.value || !fileInput.value.files || fileInput.value.files.length === 0) {
    error.value = 'Silakan pilih file PDF'
    return
  }

  const file = fileInput.value.files[0]

  try {
    error.value = null  // Hapus kesalahan sebelumnya
    isLoading.value = true
    await processFile(file)
  } catch (err) {
    console.error('Kesalahan saat memproses file:', err)
    error.value = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses file'
  } finally {
    isLoading.value = false
  }
}

// Watch for changes in aiResponse
watch(aiResponse, (newValue) => {
  console.log('AI Response updated:', newValue)
  console.log('Type of AI Response:', typeof newValue)
  if (newValue) {
    isLoading.value = false
  }
})

// Debug log
watch(() => isLoading.value, (newValue) => {
  console.log('isLoading changed:', newValue)
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