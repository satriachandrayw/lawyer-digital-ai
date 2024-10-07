<template>
  <form
    class="mb-8"
    @submit.prevent="handleSubmit"
  >
    <div class="mb-4">
      <label
        for="pdfFile"
        class="block text-sm font-medium text-gray-700"
      >Unggah File PDF</label>
      <input
        id="pdfFile"
        ref="fileInput"
        type="file"
        accept=".pdf"
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        @change="handleFileChange"
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
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['file-uploaded'])
const fileInput = ref<HTMLInputElement | null>(null)
const isProcessing = ref(false)

const handleFileChange = (event: Event) => {
  // emit('file-uploaded', event)
}

const handleSubmit = async () => {
  if (fileInput.value && fileInput.value.files && fileInput.value.files.length > 0) {
    emit('file-uploaded', { target: fileInput.value })
  }
}
</script>

<style>
/* Add any specific styles for FileUpload component */
</style>
