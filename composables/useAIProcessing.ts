import { ref, computed } from 'vue'
import * as pdfjs from 'pdfjs-dist'
import { useCompletion } from '@ai-sdk/vue'
import { createWorker, createScheduler } from 'tesseract.js'

import { cleanIndonesianText } from '@/utils/text'
import type { AIProcessingResult } from '@/types/aiProcessing' 

let worker: Tesseract.Worker | null = null

const getWorker = async (): Promise<Tesseract.Worker> => {
  if (!worker) {
    worker = await createWorker('ind')
  }
  return worker
}

export const useAIProcessing = (): AIProcessingResult => {
  const isProcessing = ref<boolean>(false)
  const processState = ref<string>('')
  const actualProgress = ref<number>(0)
  const displayProgress = ref<number>(0)
  const fullText = ref<string>('')

  const progress = computed(() => Math.min(displayProgress.value, 100))

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/process-ai',
    onResponse: (response) => {
      console.log('Received response from API')
    },
    onFinish: (prompt, completion) => {
      console.log('AI processing finished')
    },
  })

  const updateProgress = () => {
    if (displayProgress.value < actualProgress.value) {
      displayProgress.value = Math.min(displayProgress.value + 0.5, actualProgress.value)
      requestAnimationFrame(updateProgress)
    }
  }

  const processFile = async (file: File): Promise<any> => {
    isProcessing.value = true
    processState.value = 'Read PDF'
    actualProgress.value = 0
    displayProgress.value = 0
    fullText.value = ''

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
          fullText.value += pageText + '\n'
          processedPages++
          actualProgress.value = (processedPages / numPages) * 100
          requestAnimationFrame(updateProgress)
        }
      }

      isProcessing.value = false
      processState.value = 'Waiting AI Response'
      await complete(fullText.value, { body: { finalize: true } })

    } catch (error) {
      console.error('Error processing PDF:', error)
      throw error
    }
  }

  return {
    isProcessing,
    aiResponse: completion,
    processFile,
    progress: displayProgress,
    isLoading,
    processState
  }
}