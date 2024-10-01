import { defineEventHandler } from 'h3';
import { processWithPerplexityStreamOnline } from '../openaiService';
import { browseTopic } from '@/constants/prompt';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { topic, language } = body;

  if (!topic) {
    throw new Error('Topic is required');
  }

  try {
    const messages = browseTopic(topic, language);
    const response = await processWithPerplexityStreamOnline(messages);
    return response.toTextStreamResponse();
  } catch (error) {
    console.error('Error browsing topic:', error);
    throw error;
  }
});
