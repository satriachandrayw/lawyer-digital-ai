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
    onResponse: (response) => {
      console.log('Received response from API')
    },
    onFinish: (prompt, completion) => {
      console.log('AI processing finished')
    },
  })

  const processFile = async (file: File): Promise<any> => {
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
      let processedPages = 0

      const processPage = async (pageNum: number) => {
        try {
          const page = await pdf.getPage(pageNum)
          const scale = 2
          const viewport = page.getViewport({ scale })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          canvas.height = viewport.height
          canvas.width = viewport.width

          await page.render({ canvasContext: context, viewport }).promise
          
          const dataUrl = canvas.toDataURL('image/png')
          
          const { data: { text: pageText } } = await scheduler.addJob('recognize', dataUrl)
          
          processedPages++
          progress.value = (processedPages / numPages) * 100

          return cleanIndonesianText(pageText)
        } catch (error) {
          console.error(`Error processing page ${pageNum}:`, error)
          return ''
        }
      }

      const pagePromises = Array.from({ length: numPages }, (_, i) => processPage(i + 1))

      for (const pagePromise of pagePromises) {
        const pageText = await pagePromise
        if (pageText) {
          await complete(pageText)
        }
      }

      isProcessing.value = false
      // Finalize processing
      await complete('', { body: { finalize: true } })

    } catch (error) {
      console.error('Error processing PDF:', error)
      throw error
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