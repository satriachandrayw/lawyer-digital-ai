import OpenAI from 'openai'
import { OpenAIStream } from 'ai'

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
      'X-Title': 'Asisten Hukum Indonesia',
    },
  }

  // Add a message to specify the language
  messages.unshift({ role: 'system', content: 'Tolong berikan respons dalam bahasa Indonesia.' })

  const mergedOptions = { ...defaultOptions, ...options, messages }

  const response = await openai.chat.completions.create(mergedOptions)

  console.log(response);
  
  return OpenAIStream(response)
}

// New function for non-streaming response
export const processWithOpenAIFull = async (messages, options = {}) => {
  const defaultOptions = {
    model: 'openai/gpt-4o-mini',
    stream: false,
    headers: {
      'HTTP-Referer': 'https://your-site.com',
      'X-Title': 'Asisten Hukum Indonesia',
    },
  }

  // Add a message to specify the language
  messages.unshift({ role: 'system', content: 'Tolong berikan respons dalam bahasa Indonesia.' })

  const mergedOptions = { ...defaultOptions, ...options, messages }

  const response = await openai.chat.completions.create(mergedOptions)

  console.log(response);
  
  // Return the full text response
  return response.choices[0].message.content
}