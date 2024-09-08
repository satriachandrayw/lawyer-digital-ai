import { defineEventHandler, readBody } from 'h3'

import { processWithOpenAIStream } from './openaiService'
import { responGugatanMessage } from '~/constants/prompt';

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

      const messages = responGugatanMessage(body.prompt);
      const stream = await processWithOpenAIStream(messages)
      
      return stream.toDataStreamResponse()
    }
  } catch (error) {
    console.error('Error processing text:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process text: ' + (error.message || 'Unknown error'),
    })
  }
})