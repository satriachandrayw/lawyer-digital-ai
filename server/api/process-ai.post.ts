import { defineEventHandler, readBody } from 'h3'
import { processWithOpenAIStream, finalizeProcessing } from './openaiService'
import { StreamingTextResponse } from 'ai'

export const maxDuration = 300; // Increased to 5 minutes

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log("Received body")

  if (!body || (!body.prompt && !body.finalize)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt or finalize flag is required in the request body',
    })
  }

  try {
    if (body.finalize) {
      console.log("Finalizing processing")
      const stream = await finalizeProcessing()
      return stream.toDataStreamResponse()
    } else {
      console.log("Processing text chunk of length:", body.prompt.length)
      const {text} = await processWithOpenAIStream(body.prompt, {
        headers: {
          'X-Title': 'Indonesian Legal Document Analyzer',
        },
      })
      return text
    }
  } catch (error) {
    console.error('Error processing text:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process text: ' + (error.message || 'Unknown error'),
    })
  }
})