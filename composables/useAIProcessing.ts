import { ref } from 'vue'
import * as pdfjs from 'pdfjs-dist'
import { createWorker, createScheduler } from 'tesseract.js'

const cleanIndonesianText = (text: string): string => {
  // Remove extra whitespace and normalize some common characters
  return text
    .replace(/\s+/g, ' ')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim()
}

// Create a singleton worker
let worker: Tesseract.Worker | null = null

const getWorker = async () => {
  if (!worker) {
    worker = await createWorker('ind')
  }
  return worker
}

export const useAIProcessing = () => {
  const isProcessing = ref(false)
  const aiResponse = ref('')
  const progress = ref(0)

  const processFile = async (file: File) => {
    isProcessing.value = true
    progress.value = 0

    try {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      
      const scheduler = createScheduler()
      const worker = await getWorker()
      scheduler.addWorker(worker)

      const numPages = pdf.numPages
      const pagePromises = []

      for (let i = 1; i <= numPages; i++) {
        pagePromises.push((async () => {
          try {
            const page = await pdf.getPage(i)
            const scale = 2 // Increase scale for better OCR results
            const viewport = page.getViewport({ scale })
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            canvas.height = viewport.height
            canvas.width = viewport.width

            await page.render({ canvasContext: context, viewport }).promise
            
            // Convert canvas to data URL
            const dataUrl = canvas.toDataURL('image/png')
            
            // Perform OCR on the data URL
            const { data: { text: pageText } } = await scheduler.addJob('recognize', dataUrl)
            
            progress.value = (i / numPages) * 100
            return pageText
          } catch (error) {
            console.error(`Error processing page ${i}:`, error)
            return '' // Return empty string if page processing fails
          }
        })())
      }

      const pageTexts = await Promise.all(pagePromises)
      const text = pageTexts.join('\n')

      // Clean and preprocess the text
      const cleanedText = cleanIndonesianText(text)

      console.log(cleanedText)

      // Call the process-pdf API endpoint
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: cleanedText }),
      })

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.statusText}`)
      }

      const result = await response.json()
      aiResponse.value = result.response

      return aiResponse.value
    } catch (error) {
      console.error('Error processing PDF:', error)
      throw error
    } finally {
      isProcessing.value = false
      progress.value = 100
    }
  }

  return {
    isProcessing,
    aiResponse,
    processFile,
    progress,
  }
}