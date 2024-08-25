import { defineEventHandler, readBody } from 'h3'
import { processWithOpenAIFull } from './openaiService'

const systemPrompt = `Anda adalah asisten AI yang ahli dalam menganalisis dokumen hukum Indonesia, khususnya surat gugatan.
Tolong berikan ringkasan dan poin-poin kunci dari surat gugatan berikut ini.
Respons Anda harus akurat, profesional, dan disesuaikan dengan konteks hukum Indonesia.
Gunakan bahasa Indonesia dalam respons Anda.`

export default defineEventHandler(async (event) => {
  const { text } = await readBody(event)

  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Text is required',
    })
  }

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ]

    const response = await processWithOpenAIFull(messages, {
      headers: {
        'X-Title': 'Indonesian Legal Document Analyzer',
      },
    })

    return { response }
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process PDF',
    })
  }
})