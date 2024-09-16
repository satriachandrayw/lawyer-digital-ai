import { defineEventHandler, readBody } from 'h3'
import { processStructureDataStreaming } from '../openaiService'
import { essaySectionMessage } from '@/constants/prompt'
import { z } from 'zod';

import type { Section, EssaySectionResponse } from '@/types/essay';

const sectionSchema: z.ZodType<Section> = z.object({
  index: z.number().describe('Section index'),
  title: z.string().describe('Section title'),
  description: z.string().describe('Section description'),
});

const essaySchema: z.ZodType<EssaySectionResponse> = z.object({
  sections: sectionSchema,
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { prompt, documentType, language, characteristic, sectionIndex, currentSections } = body

  if (!prompt || !documentType || sectionIndex === undefined || !currentSections) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters',
    })
  }

  try {
    const messages = essaySectionMessage(prompt, documentType, language, characteristic, sectionIndex, currentSections)

    const response = await processStructureDataStreaming(messages, {
      stream: true,
      schema: essaySchema,
    })

    return response.toTextStreamResponse()

  } catch (error) {
    console.error('Error regenerating section:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while regenerating the section',
    })
  }
})
