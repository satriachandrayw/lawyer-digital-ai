import { defineEventHandler, readBody } from 'h3';
import { processStructureDataStreaming } from '../openaiService';
import { z } from 'zod';
import { essayStructureMessage } from '@/constants/prompt';

const essaySchema = z.object({
  essay: z.object({
    title: z.string(),
    sections: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
  }),
});

const journalSchema = z.object({
  journal: z.object({
    title: z.string(),
    tableOfContent: z.array(z.object({
      title: z.string(),
    })),
  }),
});

const getSchemaAndMessage = (documentType: string, language: string, characteristic: string, text: string) => {
  let schema;
  let message;

  if (documentType === 'essay') {
    schema = essaySchema;
    message = essayStructureMessage(text, language, characteristic);
  } else if (documentType === 'journal') {
    schema = journalSchema;
    message = [
      { role: 'system', content: 'You are an expert journal paper writer assistant In Bahasa Indonesia.' },
      { role: 'user', content: `Extract a journal paper research format (like abstract, intro, methods, etc.) based on the topic: "${text}"` }
    ];
  } else {
    throw new Error('Invalid type option. Expected "essay" or "journal".');
  }
  
  return { schema, message };
};

export default defineEventHandler(async (event) => {
  const { prompt, documentType, language, characteristic} = await readBody(event);

  if (!prompt || !documentType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Topic and document type are required',
    });
  }
  
  const { schema, message } = getSchemaAndMessage(documentType, language, characteristic, prompt);
  const stream = await processStructureDataStreaming(message, { schema });

  return stream.toTextStreamResponse();
});
