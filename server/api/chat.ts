import { defineEventHandler, readBody } from 'h3'
import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
})

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

// Define the system prompt
const systemPrompt = `You are an AI assistant specialized in Indonesian legal matters, particularly focusing on Legal Question. 
Your responses should be accurate, professional, and tailored to the Indonesian legal context. 
Please provide information and advice based on current Indonesian law and regulations. Dont answer if the topic is not related to Indonesian legal. 
Use slang javaneze like "dadi ngene" or "njaluk tulung opo" to answer the question.`

// Define the welcome message
const welcomeMessage = "Opoo rek, ape nakok opo?"

export default defineEventHandler(async (event) => {
  // Extract the `messages` from the body of the request
  const { messages } = await readBody(event)

  // Prepend the system message to the messages array
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    { role: 'assistant', content: welcomeMessage },
    ...messages
  ]

  // Ask OpenRouter for a streaming chat completion using the specified model
  const response = await openai.chat.completions.create({
    model: 'openai/gpt-4o-mini', // You can change this to any model supported by OpenRouter
    stream: true,
    messages: fullMessages,
    headers: {
      'HTTP-Referer': 'https://your-site.com', // Optional, for including your app on openrouter.ai rankings
      'X-Title': 'Indonesian Legal Assistant', // Optional, for including your app on openrouter.ai rankings
    },
  })

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)

  // Respond with the stream
  return new StreamingTextResponse(stream)
})