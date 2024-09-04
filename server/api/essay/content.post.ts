import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'

import { processObjectStructureStreaming } from '@/server/api/openaiService'
import { essayContentMessage } from '@/constants/prompt'
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { prompt, topic, index } = body

  if (!prompt || typeof prompt !== 'string' || !topic || typeof topic !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Invalid section or topic data',
    })
  }

  const messages = essayContentMessage(topic, index, prompt)

  const essaySchema = z.object({
    essay: z.object({
      section: z.object({
        content: z.string(),
      })
    }),
  });

  const options = {
    schema: essaySchema,
  }

  try {
    const stream = await processObjectStructureStreaming(messages, options)

    return stream.toTextStreamResponse()
  } catch (error) {
    console.error('Error generating content:', error)
    throw createError({
      statusCode: 500,
      message: 'Error generating content',
    })
  }
})
