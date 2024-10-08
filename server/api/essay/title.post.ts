import { essayTitleMessage } from '~/constants/essayPrompts'
import { processWithOpenAIFull } from '@/server/api/openaiService'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { topic, language, characteristic } = body

  if (!topic) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Topic is required',
    })
  }

  const messages = essayTitleMessage(topic, language, characteristic)

  try {
    const suggestedTitle = await processWithOpenAIFull(messages)

    return suggestedTitle.text
  }
  catch (error) {
    console.error('Error generating title suggestion:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error generating title suggestion',
    })
  }
})
