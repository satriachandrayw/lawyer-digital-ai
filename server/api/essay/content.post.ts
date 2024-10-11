import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'

import type { CoreMessage } from 'ai'
import type { Section } from '@/types/essay'

import { processGenerateWithPerplexityStreamOnline, processStructureDataStreaming } from '@/server/api/openaiService'
import { essayContentMessage } from '@/constants/essayPrompts'
import { browseTopicWithSection } from '~/constants/browsePrompts'

const sectionSchema: z.ZodType<Section> = z.object({
  index: z.number(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  isProcessing: z.boolean().optional(),
  isRegenerating: z.boolean().optional(),
  editing: z.boolean().optional(),
  editTitle: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  let messages: CoreMessage[] = []

  const body = await readBody(event)
  const { prompt, title, language, characteristic, index, useWebSearch, draftEssay } = body

  if (!prompt || typeof prompt !== 'string' || !title || typeof title !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Invalid section or title data',
    })
  }
  console.log(`prompt: ${prompt}`);
  

  if (useWebSearch) {
    const browseResult = browseTopicWithSection(prompt, title, language)
    const { text: searchContext } = await processGenerateWithPerplexityStreamOnline(browseResult)
    console.log(`searchContext: ${searchContext}`);

    messages = essayContentMessage(title, language, characteristic, index, prompt, draftEssay, searchContext) as CoreMessage[]
  }
  else {
    messages = essayContentMessage(title, language, characteristic, index, prompt.title, draftEssay) as CoreMessage[]
  }

  const options = {
    schema: sectionSchema,
    temperature: 0.7,
    frequencyPenalty: 0.5,
  }

  try {
    const stream = await processStructureDataStreaming(messages, options)

    return stream.toTextStreamResponse()
  }
  catch (error) {
    console.error('Error generating content:', error)
    throw createError({
      statusCode: 500,
      message: 'Error generating content',
    })
  }
})
