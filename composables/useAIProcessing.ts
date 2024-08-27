import { ref, Ref } from 'vue'
import * as pdfjs from 'pdfjs-dist'
import {useCompletion} from '@ai-sdk/vue'
import { createWorker, createScheduler } from 'tesseract.js'

const cleanIndonesianText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim()
}

let worker: Tesseract.Worker | null = null

const getWorker = async (): Promise<Tesseract.Worker> => {
  if (!worker) {
    worker = await createWorker('ind')
  }
  return worker
}

// Remove the systemPrompt from here as we'll use the one from openaiService.ts

interface AIProcessingResult {
  isProcessing: Ref<boolean>
  aiResponse: Ref<string>
  processFile: (file: File) => Promise<ReadableStream<Uint8Array>>
  progress: Ref<number>
  isLoading: Ref<boolean|undefined>
}

export const useAIProcessing = (): AIProcessingResult => {
  const isProcessing = ref<boolean>(false)
  const progress = ref<number>(0)

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/process-ai',
    body: { text: '' }, // We'll update this dynamically
    onResponse: (response) => {
      // Optional: Handle the response if needed
      console.log('Received response from API')
    },
    onFinish: (prompt, completion) => {
      // Optional: Handle completion if needed
      console.log('AI processing finished')
    },
  })

  const processFile = async (file: File): Promise<ReadableStream<Uint8Array>> => {
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
            const scale = 2
            const viewport = page.getViewport({ scale })
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            canvas.height = viewport.height
            canvas.width = viewport.width

            await page.render({ canvasContext: context, viewport }).promise
            
            const dataUrl = canvas.toDataURL('image/png')
            
            const { data: { text: pageText } } = await scheduler.addJob('recognize', dataUrl)
            
            // Update progress after each page is processed
            progress.value = (i / numPages) * 80 // 80% for PDF processing
            return pageText
          } catch (error) {
            console.error(`Error processing page ${i}:`, error)
            return ''
          }
        })())
      }

      const pageTexts = await Promise.all(pagePromises)
      const text = pageTexts.join('\n')

      const cleanedText = cleanIndonesianText(text)
      console.log("Cleaned text length:", cleanedText.length);

      // Use the complete function from useCompletion with the cleaned text
      await complete(cleanedText)

      // Update progress to 100% after sending to process-ai
      progress.value = 100
    } catch (error) {
      console.error('Error processing PDF:', error)
      throw error
    } finally {
      isProcessing.value = false
    }
  }

  return {
    isProcessing,
    aiResponse: completion,
    processFile,
    progress,
    isLoading
  }
}