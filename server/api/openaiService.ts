import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText, OpenAIStream, streamText } from 'ai'

import { retryWithExponentialBackoff } from '@/utils/promise'
import { splitTextIntoChunks } from '@/utils/text'

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
    const finalResponse = await retryWithExponentialBackoff(() => openrouter.chat.completions.create(finalOptions));
    return finalResponse.choices[0].message.content;
  } catch (error) {
    console.error('Error processing final response:', error);
    throw error;
  }
}

export const  processWithOpenAIStream = async (text: string, options = {}) => {
  const defaultOptions = {
    model: openrouter('openai/gpt-4o-mini'),
    temperature: 0.7,
    stream: true,
    headers: {
      'HTTP-Referer': 'https://your-site.com',
    },
  }
  try {
    // const chunks = splitTextIntoChunks(text, 1000);
    // const stream = await processArrayOfChunk(chunks, options, defaultOptions);
    // console.log( 'stream', stream.text)
    const stream = await processChunk(text, defaultOptions, options)
    return stream
  } catch (error) {
    console.error('Error processing stream response:', error)
    throw error
  }
}

export const finalizeProcessing = async (options = {}) => {
  const defaultOptions = {
    model: openrouter('openai/gpt-4o-mini'),
    temperature: 0.7,
    stream: true,
    headers: {
      'HTTP-Referer': 'https://your-site.com',
    },
  }

  const messages = [
    { role: 'system', content: `Anda adalah asisten hukum yang ahli dalam membuat surat respon gugatan hukum Indonesia. Berdasarkan analisis dokumen yang telah dilakukan, buatlah surat respon gugatan yang komprehensif dan akurat berdasarkan literatur hukum yang ada. Pastikan bahwa surat tersebut tidak mengandung kesalahan bahasa atau ejaan.
      
      Format surat respon gugatan:
      1. **Tanggal dan Nomor Surat**: [Tanggal], [Nomor Surat]
      2. **Alamat Tujuan**: 
        - Hakim Pemeriksa Perkara No. [Nomor Perkara]
        - Pengadilan Negeri [Nama Pengadilan]
        - [Alamat Pengadilan]
      3. **Perihal**: Eksepsi dan Jawaban Tergugat pada Perkara Gugatan Sederhana No. [Nomor Perkara]
      4. **Identitas Pihak**:
        - **Penggugat**: [Nama Penggugat], [Alamat Penggugat]
        - **Tergugat**: [Nama Tergugat], [Alamat Tergugat]
        - **Kuasa Hukum**: 
          - Nama: [Nama Kuasa Hukum]
          - NIK: [NIK Kuasa Hukum]
          - Tempat/Tanggal Lahir: [TTL Kuasa Hukum]
          - Jenis Kelamin: [Jenis Kelamin]
          - Warga Negara: [Warga Negara]
          - Agama: [Agama]
          - Pekerjaan: [Pekerjaan]
          - Status Kawin: [Status Kawin]
          - Pendidikan: [Pendidikan]
      5. **Eksepsi**:
        - [Detail Eksepsi Error in Persona]
        - [Detail Plurium Litis Consortium]
        - [Detail Obscuur Libel]
      6. **Pokok Perkara**:
        - [Tanggapan terhadap dalil Gugatan]
        - [Argumen hukum yang mendukung Tergugat]
      7. **Permohonan Putusan**:
        - [Permohonan untuk menerima eksepsi dan menolak gugatan]
        - [Permohonan untuk membebankan biaya kepada Penggugat]
      8. **Penutup**: 
        - [Pernyataan harapan untuk putusan yang adil]
        - [Tanda tangan Kuasa Hukum]

        - Pastikan surat tersebut mengikuti format resmi dan menggunakan bahasa hukum yang tepat.
        - Sertakan literatur hukum yang mendukung argumen Anda sepeti KUHP atau teori hukum.
        - Pastikan bahwa surat tersebut tidak mengandung kesalahan bahasa atau ejaan.
        - Gunakan bahasa yang panjang dan rinci
        - Sertakan dengan lengkap detail-detail yang ada dalam dokumen seperti daftar isi, tanggal, nama, dan lainnya. 
      ` },

    { role: 'user', content: `Berikut adalah analisis lengkap dari dokumen hukum. Gunakan ini untuk membuat surat respon gugatan:\n\n${context}` },
  ];

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