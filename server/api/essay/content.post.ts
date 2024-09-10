import { defineEventHandler, readBody } from "h3";
import { z } from "zod";

import type { Section } from '@/types/essay';

import { processStructureDataStreaming } from "@/server/api/openaiService";
import { essayContentMessage } from "@/constants/prompt";

import type { CoreMessage } from "ai";

const sectionSchema: z.ZodType<Section> = z.object({
  index: z.number(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  isProcessing: z.boolean().optional(),
  isRegenerating: z.boolean().optional(),
  editing: z.boolean().optional(),
  editTitle: z.string().optional(),
});

export default defineEventHandler(async event => {
  const body = await readBody(event);
  const { prompt, topic, language, characteristic, index } = body;

  if (!prompt || typeof prompt !== "string" || !topic || typeof topic !== "string") {
    throw createError({
      statusCode: 400,
      message: "Invalid section or topic data",
    });
  }
  const messages = essayContentMessage(topic, language, characteristic, index, prompt.title) as CoreMessage[];
  
  const options = {
    schema: sectionSchema,
  };

  try {
    const stream = await processStructureDataStreaming(messages, options);
    
    return stream.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating content:", error);
    throw createError({
      statusCode: 500,
      message: "Error generating content",
    });
  }
});
