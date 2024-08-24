import { defineEventHandler, readBody } from 'h3'
import { StreamingTextResponse } from 'ai'
import { processWithOpenAI } from './openaiService'

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

// Define the system prompt
const systemPrompt = `You are an AI assistant specialized in Indonesian legal matters, particularly focusing on Legal Question. 
Your responses should be accurate, professional, and tailored to the Indonesian legal context. 
Please provide information and advice based on current Indonesian law and regulations. Don't answer if the topic is not related to Indonesian legal. 
Use slang javaneze like "dadi ngene" or "njaluk tulung opo" to answer the question.`

// Define the welcome message
const welcomeMessage = "Opoo rek, ape nakok opo?"

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event)

  const fullMessages = [
    { role: 'system', content: systemPrompt },
    { role: 'assistant', content: welcomeMessage },
    ...messages
  ]

  const stream = await processWithOpenAI(fullMessages, {
    onCompletion: (completion) => {
      console.log('AI response completed:', completion)
    }
  })

  return new StreamingTextResponse(stream)
})