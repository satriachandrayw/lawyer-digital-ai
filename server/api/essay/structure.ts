import { defineEventHandler, readBody } from 'h3';
import { processStructuredData } from '../openaiService';

export default defineEventHandler(async (event) => {
  const { topic, documentType } = await readBody(event);

  if (!topic || !documentType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Topic is required',
    });
  }

  const response = await processStructuredData(topic, documentType);
  return response;
});
