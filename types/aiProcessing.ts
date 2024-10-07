import type { Ref } from 'vue'

export interface AIProcessingResult {
  isProcessing: Ref<boolean>
  aiResponse: Ref<string>
  processFile: (file: File) => Promise<ReadableStream<Uint8Array>>
  progress: Ref<number>
  isLoading: Ref<boolean | undefined>
  processState: Ref<string>
}
