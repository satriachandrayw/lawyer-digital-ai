import { ref, Ref } from 'vue'
import * as pdfjs from 'pdfjs-dist'
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
  processFile: (file: File) => Promise<string>
  progress: Ref<number>
}

export const useAIProcessing = (): AIProcessingResult => {
  const isProcessing = ref<boolean>(false)
  const aiResponse = ref<string>('')
  const progress = ref<number>(0)

  const processFile = async (file: File): Promise<string> => {
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
            
            progress.value = (i / numPages) * 100
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

      // Call the new API route
      console.log("Sending request to /api/process-ai");
      const response = await fetch('/api/process-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: cleanedText }),
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response not OK:", response.status, errorText);
        throw new Error(`Processing failed: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const result = await response.json()
      aiResponse.value = result.response
      console.log('Received AI Response, length:', aiResponse.value.length);

      return aiResponse.value
    } catch (error) {
      console.error('Error processing PDF:', error)
      aiResponse.value = 'Error: ' + ((error as Error).message || 'Unknown error occurred')
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