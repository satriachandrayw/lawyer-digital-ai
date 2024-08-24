import { ref } from 'vue'
import * as pdfjs from 'pdfjs-dist'

export const useAIProcessing = () => {
  const isProcessing = ref(false)
  const aiResponse = ref('')

  const processFile = async (file: File) => {
    isProcessing.value = true

    try {
      const pdfjs = await import('pdfjs-dist/build/pdf.js')
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      let text = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const strings = content.items.map((item: any) => item.str)
        text += strings.join(' ') + '\n'
      }

      // Upload the file to get a fileUrl
      const formData = new FormData()
      formData.append('file', file)
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const { fileUrl } = await uploadResponse.json()

      // Call the process-pdf API endpoint
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl, text }),
      })

      const result = await response.json()
      aiResponse.value = result.response

      return aiResponse.value
    } catch (error) {
      console.error('Error processing PDF:', error)
      throw error
    } finally {
      isProcessing.value = false
    }
  }

  return {
    isProcessing,
    aiResponse,
    processFile,
  }
}