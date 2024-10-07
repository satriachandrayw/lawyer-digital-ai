import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { processGenerateWithPerplexityStreamOnline, processStructureDataStreaming } from '../openaiService'
import { essayStructureMessage } from '@/constants/essayPrompts'
import { browseTopic } from '@/constants/browsePrompts'

const essaySchema = z.object({
  essay: z.object({
    title: z.string().describe('Essay title'),
    sections: z.array(z.object({
      title: z.string().describe('Section title'),
      description: z.string().describe('Section description'),
    })),
  }),
})

const journalSchema = z.object({
  journal: z.object({
    title: z.string(),
    tableOfContent: z.array(z.object({
      title: z.string(),
    })),
  }),
})

const getSchemaAndMessage = (documentType: string, language: string, characteristic: string, text: string, searchContext?: string) => {
  let schema
  let message

  if (documentType === 'essay') {
    schema = essaySchema
    message = essayStructureMessage(text, language, characteristic, searchContext)
  }
  else if (documentType === 'journal') {
    schema = journalSchema
    message = [
      { role: 'system', content: 'You are an expert journal paper writer assistant In Bahasa Indonesia.' },
      { role: 'user', content: `Extract a journal paper research format (like abstract, intro, methods, etc.) based on the topic: "${text}"` },
    ]
  }
  else {
    throw new Error('Invalid type option. Expected "essay" or "journal".')
  }

  return { schema, message }
}

export default defineEventHandler(async (event) => {
  let stream

  const { prompt, documentType, language, characteristic, useWebSearch } = await readBody(event)

  if (!prompt || !documentType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Topic and document type are required',
    })
  }

  if (useWebSearch) {
    const browseResult = browseTopic(prompt, language)
    const { text: searchContext } = await processGenerateWithPerplexityStreamOnline(browseResult)
    console.log(searchContext)

    const { schema, message } = getSchemaAndMessage(documentType, language, characteristic, prompt, searchContext)
    stream = await processStructureDataStreaming(message, { schema })
  }

  else {
    const { schema, message } = getSchemaAndMessage(documentType, language, characteristic, prompt)
    stream = await processStructureDataStreaming(message, { schema })
  }

  return stream.toTextStreamResponse()
})
