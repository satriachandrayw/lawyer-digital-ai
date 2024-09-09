import { defineEventHandler, readBody } from 'h3'
import { processStructuredData } from '../openaiService'
import { essaySectionMessage } from '@/constants/prompt'
import { z } from 'zod';

import type { Section, EssaySectionResponse } from '@/types/essay';

const sectionSchema: z.ZodType<Section> = z.object({
  title: z.string(),
  description: z.string(),
});

const essaySchema: z.ZodType<EssaySectionResponse> = z.object({
  sections: sectionSchema,
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
      stream: false,
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
