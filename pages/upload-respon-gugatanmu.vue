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
    <div v-if="isProcessing">
      Processing: {{ Math.round(progress) }}%
    </div>
    <div v-if="aiResponse" class="bg-gray-100 p-4 rounded-md">
      <h2 class="text-xl font-semibold mb-2 text-black">Respons AI:</h2>
      <pre class="whitespace-pre-wrap text-black">{{ aiResponse }}</pre>
    </div>
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAIProcessing } from '@/composables/useAIProcessing'

const fileInput = ref(null)
const error = ref(null)
const { processFile, isProcessing, aiResponse, progress } = useAIProcessing()

const handleFileChange = (event) => {
  error.value = null  // Clear any previous errors
}

const handleSubmit = async () => {
  const file = fileInput.value.files[0]
  if (!file) {
    error.value = 'Silakan pilih file PDF'
    return
  }

  try {
    error.value = null  // Hapus kesalahan sebelumnya
    await processFile(file)
  } catch (err) {
    console.error('Kesalahan saat memproses file:', err)
    error.value = err.message || 'Terjadi kesalahan saat memproses file'
  }
}
</script>