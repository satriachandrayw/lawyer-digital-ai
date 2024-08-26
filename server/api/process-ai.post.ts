import { defineEventHandler, readBody } from 'h3'
import { processWithOpenAIFull } from './openaiService'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log("Received body:", body);

  if (!body || !body.text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Text is required in the request body',
    })
  }

  const { text } = body

  try {
    console.log("Processing text of length:", text.length);
    const response = await processWithOpenAIFull(text, {
      headers: {
        'X-Title': 'Indonesian Legal Document Analyzer',
      },
    })

    console.log("Processed successfully, response length:", response.length);
    return { response }
  } catch (error) {
    console.error('Error processing text:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process text: ' + (error.message || 'Unknown error'),
    })
  }
})