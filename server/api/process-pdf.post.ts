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
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 60000) // 60 seconds timeout
    )

    const responsePromise = processWithOpenAIFull(text, systemPrompt, {
      headers: {
        'X-Title': 'Indonesian Legal Document Analyzer',
      },
    })

    const response = await Promise.race([responsePromise, timeoutPromise])

    return { response }
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw createError({
      statusCode: error.message === 'Request timeout' ? 504 : 500,
      statusMessage: error.message === 'Request timeout' ? 'Gateway Timeout' : 'Failed to process PDF',
    })
  }
})