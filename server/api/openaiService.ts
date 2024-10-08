import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { CoreMessage } from 'ai'
import { generateText, streamText, generateObject, streamObject, StreamData } from 'ai'

import { retryWithExponentialBackoff } from '@/utils/promise'

const runtimeConfig = useRuntimeConfig()

const openrouter = createOpenRouter({
  apiKey: runtimeConfig.openrouterApiKey || '',
  baseURL: 'https://openrouter.ai/api/v1',
})

const generateDefaultOptions = () => ({
  model: openrouter('openai/gpt-4o-mini'),
  headers: {
    'HTTP-Referer': 'https://your-site.com',
    'X-Title': 'Asisten Hukum Indonesia',
  },
})

const generateDefaultOptionsOnline = () => ({
  model: openrouter('perplexity/llama-3.1-sonar-small-128k-online'),
  headers: {
    'HTTP-Referer': 'https://your-site.com',
    'X-Title': 'Asisten Hukum Indonesia',
  },
})

export const processGenerateWithPerplexityStreamOnline = async (messages: CoreMessage[], options = {}) => {
  const defaultOptions = generateDefaultOptionsOnline()
  defaultOptions.temperature = 0.6
  defaultOptions.stream = true

  const mergedOptions = { ...defaultOptions, ...options, messages }

  try {
    const response = await generateText(mergedOptions)

    return response
  }
  catch (error) {
    console.error('Error processing final response:', error)
    throw error
  }
}

export const processWithPerplexityStreamOnline = async (messages: CoreMessage[], options = {}) => {
  const defaultOptions = generateDefaultOptionsOnline()
  defaultOptions.temperature = 0.6
  defaultOptions.stream = true

  const mergedOptions = { ...defaultOptions, ...options, messages }

  try {
    const response = await streamText(mergedOptions)

    return response
  }
  catch (error) {
    console.error('Error processing final response:', error)
    throw error
  }
}

export const processWithOpenAI = async (messages: CoreMessage[], options = {}) => {
  const defaultOptions = generateDefaultOptions()
  defaultOptions.stream = true
  defaultOptions.temperature = 0.7

  messages.unshift({
    role: 'system',
    content: 'Tolong berikan respons dalam bahasa Indonesia.',
  })

  const mergedOptions = { ...defaultOptions, ...options, messages }

  const response = await retryWithExponentialBackoff(() =>
    streamText(mergedOptions),
  )

  return response
}

// New function for non-streaming response
export const processWithOpenAIFull = async (messages: CoreMessage[], options = {}) => {
  if (!messages) {
    throw new Error('Invalid input: text must be a non-empty string')
  }

  const defaultOptions = generateDefaultOptions()
  defaultOptions.stream = false

  const finalOptions = {
    ...defaultOptions,
    ...options,
    messages,
  }
  try {
    const response = await retryWithExponentialBackoff(() =>
      generateText(finalOptions),
    )
    return response
  }
  catch (error) {
    console.error('Error processing final response:', error)
    throw error
  }
}

export const processWithOpenAIStream = async (messages: CoreMessage[], options = {}) => {
  const defaultOptions = generateDefaultOptions()
  defaultOptions.model = openrouter('google/gemini-pro-1.5')
  defaultOptions.temperature = 0.6
  defaultOptions.stream = true

  const mergedOptions = { ...defaultOptions, ...options, messages }

  try {
    const response = await streamText(mergedOptions)

    return response
  }
  catch (error) {
    console.error('Error processing final response:', error)
    throw error
  }
}

export const processStructuredData = async (messages: CoreMessage[], options = {}) => {
  const defaultOptions = generateDefaultOptions()
  defaultOptions.temperature = 0.6
  defaultOptions.stream = false

  const mergedOptions = { ...defaultOptions, ...options, messages }

  try {
    const { object } = await retryWithExponentialBackoff(() =>
      generateObject(mergedOptions),
    )
    return object
  }
  catch (error) {
    console.error('Error processing structured data:', error)
    throw error
  }
}

export const processStructureDataStreaming = async (messages: CoreMessage[], options = {}) => {
  const defaultOptions = generateDefaultOptions()
  defaultOptions.temperature = 0.6
  defaultOptions.stream = true

  const mergedOptions = { ...defaultOptions, ...options, messages }

  try {
    const data = new StreamData()

    mergedOptions.onFinish = () => {
      data.close()
    }

    const response = await streamObject(mergedOptions)

    return response
  }
  catch (error) {
    console.error('Error processing final response:', error)
    throw error
  }
}
