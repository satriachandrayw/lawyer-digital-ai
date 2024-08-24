<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Upload Respon Gugatanmu</h1>
    <form @submit.prevent="handleSubmit" class="mb-8">
      <div class="mb-4">
        <label for="pdfFile" class="block text-sm font-medium text-gray-700">Upload PDF File</label>
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
        {{ isProcessing ? 'Processing...' : 'Process File' }}
      </button>
    </form>
    <div v-if="aiResponse" class="bg-gray-100 p-4 rounded-md">
      <h2 class="text-xl font-semibold mb-2">AI Response:</h2>
      <pre class="whitespace-pre-wrap">{{ aiResponse }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAIProcessing } from '@/composables/useAIProcessing'

const fileInput = ref(null)
const { processFile, isProcessing, aiResponse } = useAIProcessing()

const handleFileChange = (event) => {
  // You can add file validation here if needed
}

const handleSubmit = async () => {
  const file = fileInput.value.files[0]
  if (!file) {
    alert('Please select a PDF file')
    return
  }

  try {
    await processFile(file)
  } catch (error) {
    console.error('Error processing file:', error)
    alert('An error occurred while processing the file')
  }
}
</script>