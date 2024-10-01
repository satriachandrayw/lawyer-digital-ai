import { defineEventHandler, readBody } from "h3";
import { z } from "zod";

import { processStructureDataStreaming } from "@/server/api/openaiService";
import { articleTitleMessage, articleContentMessage, articleStructureMessage } from "@/constants/prompt";

import type { CoreMessage } from "ai";

const articleSchema = z.object({
  title: z.string(),
  content: z.string()
});

export default defineEventHandler(async event => {
  const body = await readBody(event);
  const { topic, language, newsType, generateType, browseResult } = body;

  // if (!topic || typeof topic !== "string") {
  //   throw createError({
  //     statusCode: 400,
  //     message: "Invalid topic data",
  //   });
  // }

  let messages: CoreMessage[];
  let schema: z.ZodType<any>;

  if (generateType === 'title') {
    messages = articleTitleMessage(topic, language, newsType) as CoreMessage[];
    schema = z.object({ title: z.string() });
  } else if (generateType === 'content') {
    messages = articleContentMessage(topic, language, newsType, browseResult) as CoreMessage[];
    schema = z.object({ content: z.string() });
  } else if (generateType === 'structure') {
    messages = articleStructureMessage(topic, language, newsType, browseResult) as CoreMessage[];
    schema = articleSchema;
  } else {
    throw createError({
      statusCode: 400,
      message: "Invalid generate type",
    });
  }

  const options = {
    schema,
  };

  try {
    const stream = await processStructureDataStreaming(messages, options);
    
    return stream.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating article content:", error);
    throw createError({
      statusCode: 500,
      message: "Error generating article content",
    });
  }
});
