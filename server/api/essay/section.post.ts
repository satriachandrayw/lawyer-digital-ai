import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import type { CoreMessage } from 'ai'
import { processStructureDataStreaming } from '../openaiService'
import { essaySectionMessage } from '@/constants/essayPrompts' 

import type { Section, EssaySectionResponse } from '@/types/essay'

const sectionSchema: z.ZodType<Section> = z.object({
  index: z.number().describe('Section index'),
  title: z.string().describe('Section title'),
  description: z.string().describe('Section description'),
})

const essaySchema: z.ZodType<EssaySectionResponse> = z.object({
  sections: sectionSchema,
})

export default defineEventHandler(async (event) => {
  let messages: CoreMessage[] = []

  const storage = useStorage('redis')

  const body = await readBody(event)
  const { prompt, documentType, language, characteristic, sectionIndex, currentSections, useWebSearch, title } = body

  if (!prompt || !documentType || sectionIndex === undefined || !currentSections) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters',
    })
  }

  try {
    if (useWebSearch) {
      const searchContext: string | null = await storage.getItem('searchContext')
      messages = essaySectionMessage(title, documentType, language, characteristic, sectionIndex, currentSections, searchContext)
    }
    else {
      messages = essaySectionMessage(prompt, documentType, language, characteristic, sectionIndex, currentSections)
    }

    const response = await processStructureDataStreaming(messages, {
      stream: true,
      schema: essaySchema,
    })

    return response.toTextStreamResponse()
  }
  catch (error) {
    console.error('Error regenerating section:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while regenerating the section',
    })
  }
})
