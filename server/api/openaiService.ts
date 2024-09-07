import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText, streamText, generateObject, streamObject } from 'ai'
import { set, z } from 'zod'

import { retryWithExponentialBackoff } from '@/utils/promise'
import { splitTextIntoChunks } from '@/utils/text'
import { responGugatanMessage } from '@/constants/prompt';

// Initialize OpenRouter client
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
})

let context = ''

const processArrayOfChunk = async (chunks: string[], options: any, defaultOptions: any) => {
  let fullResponse = '';

  for (let i = 0; i < chunks.length; i++) {
    context += chunks[i] + '\n'
    console.log(`Processing chunk ${i + 1} of ${chunks.length}`);

    const messages = [
      { role: 'system', content: 'Anda adalah asisten hukum yang ahli dalam menganalisis dokumen hukum Indonesia. Tolong analisis bagian dokumen berikut ini dalam konteks keseluruhan dokumen. Jangan membuat kesimpulan atau respons final sampai Anda telah menganalisis seluruh dokumen.' },
      { role: 'user', content: `Bagian ${i + 1} dari ${chunks.length} dari dokumen hukum:\n\n${chunks[i]}\n\nKonteks sebelumnya:\n\n${context}` },
    ];

    if (i > 0) {
      messages.push({ role: 'assistant', content: 'Berikut adalah analisis lanjutan, dengan mempertimbangkan bagian-bagian sebelumnya:' });
    }

    const mergedOptions = { ...defaultOptions, ...options, messages };
    try {
      const stream = await retryWithExponentialBackoff(() => generateText(mergedOptions));
      fullResponse += stream.text + '\n\n';
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error);
      throw error;
    }
  }

  const response = {
    text: fullResponse,
  }
  console.log( 'fullResponse', fullResponse)
  return response;
}

export const processChunk = async (text: string, defaultOptions = {}, options = {}) => {
  context += text + '\n'

  const messages = [
    { role: 'system', content: 'Anda adalah asisten hukum yang ahli dalam menganalisis dokumen hukum Indonesia. Analisis bagian dokumen berikut ini dalam konteks keseluruhan dokumen yang telah Anda lihat sejauh ini. Jangan membuat kesimpulan atau respons final sampai Anda menerima sinyal bahwa seluruh dokumen telah selesai.' },
    { role: 'user', content: `Bagian baru dari dokumen hukum:\n\n${text}\n\nKonteks sebelumnya:\n\n${context}` },
  ]

  const mergedOptions = { ...defaultOptions, ...options, messages }

  try {
    const stream = await generateText(mergedOptions)
    return stream
  } catch (error) {
    console.error('Error processing chunk:', error)
    throw error
  }
}

export const processWithOpenAI = async (messages, options = {}) => {
  const defaultOptions = {
    model: openrouter('openai/gpt-4o-mini'),
    stream: true,
    headers: {
      'HTTP-Referer': 'https://your-site.com',
      'X-Title': 'Asisten Hukum Indonesia',
    },
  }

  messages.unshift({ role: 'system', content: 'Tolong berikan respons dalam bahasa Indonesia.' })

  const mergedOptions = { ...defaultOptions, ...options, messages }

  const response = await retryWithExponentialBackoff(() => streamText(mergedOptions))
  
  return response
}

// New function for non-streaming response
export const processWithOpenAIFull = async (text: string, options = {}) => {
  console.log("Received text type:", typeof text);
  console.log("Text length:", text?.length);

  if (typeof text !== 'string' || !text) {
    throw new Error('Invalid input: text must be a non-empty string');
  }

  const defaultOptions = {
    model: 'openai/gpt-4o-mini',
    stream: false,
    headers: {
      'HTTP-Referer': 'https://your-site.com',
      'X-Title': 'Asisten Hukum Indonesia',
    },
  }

  const chunks = splitTextIntoChunks(text);
  console.log("Number of chunks:", chunks.length);

  const fullResponse = await processArrayOfChunk(chunks, options, defaultOptions);

  const finalMessages = [
    { role: 'system', content: 'Anda adalah asisten hukum yang ahli dalam membuat surat respon gugatan hukum Indonesia. Berdasarkan analisis dokumen yang telah dilakukan, buatlah surat respon gugatan yang komprehensif dan akurat berdasarkan literatur hukum yang ada'},
    { role: 'user', content: `Berikut adalah analisis lengkap dari dokumen hukum. Gunakan ini untuk membuat surat respon gugatan:\n\n${fullResponse}` },
  ];

  const finalOptions = { ...defaultOptions, ...options, messages: finalMessages };
  try {
    const response = await retryWithExponentialBackoff(() => generateText(finalOptions));
    return response
  } catch (error) {
    console.error('Error processing final response:', error);
    throw error;
  }
}

export const processStructuredData = async (messages: any, options = {}) => {
  
  const defaultOptions = {
    model: openrouter('openai/gpt-4o-mini'),
    temperature: 0.8,
    stream: false,
    headers: {
      'HTTP-Referer': 'https://your-site.com',
    },
  }

  const mergedOptions = { ...defaultOptions, ...options, messages };

  try {
    const {object} = await retryWithExponentialBackoff(() => generateObject(mergedOptions));
    return object
  } catch (error) {
    console.error('Error processing structured data:', error);
    throw error;
  }
}

// export const  processWithOpenAIStream = async (text: string, options = {}) => {
//   const defaultOptions = {
//     model: openrouter('openai/gpt-4o-mini'),
//     temperature: 0.7,
//     stream: true,
//     headers: {
//       'HTTP-Referer': 'https://your-site.com',
//     },
//   }
//   try {
//     // const chunks = splitTextIntoChunks(text, 1000);
//     // const stream = await processArrayOfChunk(chunks, options, defaultOptions);
//     // console.log( 'stream', stream.text)
//       context += text + '\n'
//     // const stream = await processChunk(text, defaultOptions, options)
//     // return stream
//   } catch (error) {
//     console.error('Error processing stream response:', error)
//     throw error
//   }
// }

export const processWithOpenAIStream = async (messages: any, options = {}) => {
  const defaultOptions = {
    model: openrouter('openai/gpt-4o-mini'),
    temperature: 0.8,
    stream: true,
    headers: {
      'HTTP-Referer': 'https://your-site.com',
    },
  }

  const mergedOptions = { ...defaultOptions, ...options, messages }

  try {
    const response = await streamText(mergedOptions)
    return response
  } catch (error) {
    console.error('Error processing final response:', error)
    throw error
  }
}

export const processObjectStructureStreaming = async (messages: any, options = {}) => {
  const defaultOptions = {
    model: openrouter('openai/gpt-4o-mini'),
    temperature: 1.2,
    stream: true,
    headers: {
      'HTTP-Referer': 'https://your-site.com',
    },
  }

  const mergedOptions = { ...defaultOptions, ...options, messages }
  
  try {
    const stream = await streamObject(mergedOptions)
    return stream
  } catch (error) {
    console.error('Error processing final response:', error)
    throw error
  }
}

export const finalizeProcessing = async (options = {}) => {
  const defaultOptions = {
    model: openrouter('google/gemini-pro-1.5'),
    temperature: 0.2,
    stream: true,
    headers: {
      'HTTP-Referer': 'https://your-site.com',
    },
  }

  const messages = responGugatanMessage(context);

  const mergedOptions = { ...defaultOptions, ...options, messages }

  try {
    const response = await streamText(mergedOptions)
    context = '' // Reset context after final processing
    return response
  } catch (error) {
    console.error('Error processing final response:', error)
    throw error
  }
}