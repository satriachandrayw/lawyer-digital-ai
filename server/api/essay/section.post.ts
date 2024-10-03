import { defineEventHandler, readBody } from 'h3'
import { processGenerateWithPerplexityStreamOnline, processStructureDataStreaming } from '../openaiService'
import { browseTopicWithSection, essaySectionMessage } from '@/constants/prompt'
import { z } from 'zod';

import type { Section, EssaySectionResponse } from '@/types/essay';
import { CoreMessage } from 'ai';

const sectionSchema: z.ZodType<Section> = z.object({
  index: z.number().describe('Section index'),
  title: z.string().describe('Section title'),
  description: z.string().describe('Section description'),
});

const essaySchema: z.ZodType<EssaySectionResponse> = z.object({
  sections: sectionSchema,
});

export default defineEventHandler(async (event) => {
  let messages: CoreMessage[] = [];
  const body = await readBody(event)
  const { prompt, documentType, language, characteristic, sectionIndex, currentSections, useWebSearch, topic } = body

  if (!prompt || !documentType || sectionIndex === undefined || !currentSections) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters',
    })
  }

  try {
    if (useWebSearch) {
      const browseResult = browseTopicWithSection(topic, prompt, language);
      const {text: searchContext} = await processGenerateWithPerplexityStreamOnline(browseResult);
      console.log(searchContext);
      messages = essaySectionMessage(topic, documentType, language, characteristic, sectionIndex, currentSections, searchContext)
    }
    else {
      messages = essaySectionMessage(prompt, documentType, language, characteristic, sectionIndex, currentSections)
    }

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
