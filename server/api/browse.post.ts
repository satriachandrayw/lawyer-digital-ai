import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { processGenerateWithPerplexityStreamOnline } from '@/server/api/openaiService'
import { browseTopic } from '@/constants/browsePrompts'

const browseSchema = z.object({
  searchContext: z.string().describe('Web search context for the given topic'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { topic, language } = body

  if (!topic || !language) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Topic and language are required',
    })
  }

  try {
    const browseResult = browseTopic(topic, language)
    const { text: searchContext } = await processGenerateWithPerplexityStreamOnline(browseResult)

    // You can decide how to store or process the searchContext here
    // For now, we'll just return it

    return {
      searchContext,
    }
  }
  catch (error) {
    console.error('Error in browse endpoint:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while processing the browse request',
    })
  }
})
