import OpenAI from 'openai'
import { OpenAIStream } from 'ai'

// Create an OpenAI API client (that's edge friendly!)
export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
})

const splitTextIntoChunks = (text: string, maxChunkSize: number = 4000): string[] => {
  const chunks: string[] = [];
  let currentChunk = '';

  text.split('\n').forEach(paragraph => {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += paragraph + '\n';
  });

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

const retryWithExponentialBackoff = async (fn: () => Promise<any>, maxRetries = 3, initialDelay = 1000) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      if (retries === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, retries)));
    }
  }
};

export const processWithOpenAI = async (messages, options = {}) => {
  const defaultOptions = {
    model: 'openai/gpt-4o-mini',
    stream: true,
    headers: {
      'HTTP-Referer': 'https://your-site.com',
      'X-Title': 'Asisten Hukum Indonesia',
    },
  }

  // Add a message to specify the language
  messages.unshift({ role: 'system', content: 'Tolong berikan respons dalam bahasa Indonesia.' })

  const mergedOptions = { ...defaultOptions, ...options, messages }

  const response = await retryWithExponentialBackoff(() => openai.chat.completions.create(mergedOptions))

  console.log(response);
  
  return OpenAIStream(response)
}

// New function for non-streaming response
export const processWithOpenAIFull = async (text: string, options = {}) => {
  const defaultOptions = {
    model: 'openai/gpt-4o-mini',
    stream: false,
    headers: {
      'HTTP-Referer': 'https://your-site.com',
      'X-Title': 'Asisten Hukum Indonesia',
    },
  }

  const chunks = splitTextIntoChunks(text);
  let fullResponse = '';

  // Process all chunks
  for (let i = 0; i < chunks.length; i++) {
    const messages = [
      { role: 'system', content: 'Anda adalah asisten hukum yang ahli dalam menganalisis dokumen hukum Indonesia. Tolong analisis bagian dokumen berikut ini dalam konteks keseluruhan dokumen. Jangan membuat kesimpulan atau respons final sampai Anda telah menganalisis seluruh dokumen.' },
      { role: 'user', content: `Bagian ${i + 1} dari ${chunks.length} dari dokumen hukum:\n\n${chunks[i]}` },
    ];

    if (i > 0) {
      messages.push({ role: 'assistant', content: 'Berikut adalah analisis lanjutan, dengan mempertimbangkan bagian-bagian sebelumnya:' });
    }

    const mergedOptions = { ...defaultOptions, ...options, messages };
    try {
      const response = await retryWithExponentialBackoff(() => openai.chat.completions.create(mergedOptions));
      fullResponse += response.choices[0].message.content + '\n\n';
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error);
      throw error; // Rethrow the error to handle it at a higher level
    }
  }

  // Final pass to create the response letter
  const finalMessages = [
    { role: 'system', content: 'Anda adalah asisten hukum yang ahli dalam membuat surat respon gugatan. Berdasarkan analisis dokumen yang telah dilakukan, buatlah surat respon gugatan yang komprehensif dan akurat.' },
    { role: 'user', content: `Berikut adalah analisis lengkap dari dokumen hukum. Gunakan ini untuk membuat surat respon gugatan:\n\n${fullResponse}` },
  ];

  const finalOptions = { ...defaultOptions, ...options, messages: finalMessages };
  try {
    const finalResponse = await retryWithExponentialBackoff(() => openai.chat.completions.create(finalOptions));
    return finalResponse.choices[0].message.content;
  } catch (error) {
    console.error('Error processing final response:', error);
    throw error; // Rethrow the error to handle it at a higher level
  }
}