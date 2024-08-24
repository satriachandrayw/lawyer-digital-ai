import { defineEventHandler, readBody } from 'h3'
import { processWithOpenAI, streamToString } from './openaiService'

const systemPrompt = `You are an AI assistant specialized in analyzing legal documents. 
Please provide a summary and key points of the following legal document. 
Your response should be accurate, professional, and tailored to the Indonesian legal context.`

export default defineEventHandler(async (event) => {
  const { fileUrl, text } = await readBody(event)

  if (!fileUrl || !text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File URL and text are required',
    })
  }

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ]

    const stream = await processWithOpenAI(messages, {
      headers: {
        'X-Title': 'Indonesian Legal Document Analyzer',
      },
    })

    const result = await streamToString(stream)

    return { response: result }
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process PDF',
    })
  }
})