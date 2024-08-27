import { defineEventHandler, readBody } from 'h3'
import { processWithOpenAIStream } from './openaiService'
import { StreamingTextResponse } from 'ai'

export const maxDuration = 60;

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log("Received body:", body);

  if (!body || !body.prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required in the request body',
    })
  }

  const { prompt } = body

  try {
    console.log("Processing text of length:", prompt.length);
    const stream = await processWithOpenAIStream(prompt, {
      headers: {
        'X-Title': 'Indonesian Legal Document Analyzer',
      },
    })

    return stream.toDataStreamResponse()
  } catch (error) {
    console.error('Error processing text:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process text: ' + (error.message || 'Unknown error'),
    })
  }
})