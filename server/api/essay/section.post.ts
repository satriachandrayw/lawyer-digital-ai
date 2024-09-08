import { defineEventHandler, readBody } from 'h3'
import { processStructuredData } from '../openaiService'
import { essaySectionMessage } from '~/constants/prompt'
import { z } from 'zod';

const essaySchema = z.object({
  essay: z.object({
    section: z.object({
      title: z.string(),
    }),
  }),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { topic, documentType, sectionIndex, currentSections } = body

  if (!topic || !documentType || sectionIndex === undefined || !currentSections) {
    return createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters',
    })
  }

  try {
    const messages = essaySectionMessage(topic, documentType, sectionIndex, currentSections)

    const response = await processStructuredData(messages, {
      stream: false, // We want a complete response, not a stream
      schema: essaySchema,
    })

    return response

  } catch (error) {
    console.error('Error regenerating section:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'An error occurred while regenerating the section',
    })
  }
})
