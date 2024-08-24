import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

// Create an OpenAI API client (that's edge friendly!)
export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
})

export const processWithOpenAI = async (messages, options = {}) => {
  const defaultOptions = {
    model: 'openai/gpt-4o-mini',
    stream: true,
    headers: {
      'HTTP-Referer': 'https://your-site.com',
      'X-Title': 'Indonesian Legal Assistant',
    },
  }

  const mergedOptions = { ...defaultOptions, ...options, messages }

  const response = await openai.chat.completions.create(mergedOptions)

  return OpenAIStream(response)
}

export const streamToString = async (stream) => {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return chunks.join('')
}