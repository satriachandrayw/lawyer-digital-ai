import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, streamText, generateObject, streamObject, CoreMessage } from "ai";

import { retryWithExponentialBackoff } from "@/utils/promise";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
});


const generateDefaultOptions = () => ({
  model: openrouter("openai/gpt-4o-mini"),
  headers: {
    "HTTP-Referer": "https://your-site.com",
    "X-Title": "Asisten Hukum Indonesia",
  },
});

export const processWithOpenAI = async (messages: CoreMessage[], options = {}) => {
  const defaultOptions = generateDefaultOptions();
  defaultOptions.stream = true;

  messages.unshift({
    role: "system",
    content: "Tolong berikan respons dalam bahasa Indonesia.",
  });

  const mergedOptions = { ...defaultOptions, ...options, messages };

  const response = await retryWithExponentialBackoff(() =>
    streamText(mergedOptions)
  );

  return response;
};

// New function for non-streaming response
export const processWithOpenAIFull = async (messages: CoreMessage[], options = {}) => {

  if (typeof messages !== "string" || !messages) {
    throw new Error("Invalid input: text must be a non-empty string");
  }

  const defaultOptions = generateDefaultOptions();
  defaultOptions.stream = false;

  const finalOptions = {
    ...defaultOptions,
    ...options,
    messages,
  };
  try {
    const response = await retryWithExponentialBackoff(() =>
      generateText(finalOptions)
    );
    return response;
  } catch (error) {
    console.error("Error processing final response:", error);
    throw error;
  }
};

export const processWithOpenAIStream = async (messages: CoreMessage[], options = {}) => {
  const defaultOptions = generateDefaultOptions();
  defaultOptions.model = openrouter("google/gemini-pro-1.5");
  defaultOptions.temperature = 0.8;
  defaultOptions.stream = true;

  const mergedOptions = { ...defaultOptions, ...options, messages };

  try {
    const response = await streamText(mergedOptions);

    return response;
  } catch (error) {
    console.error("Error processing final response:", error);
    throw error;
  }
};

export const processStructuredData = async (messages: CoreMessage[], options = {}) => {
  const defaultOptions = generateDefaultOptions();
  defaultOptions.temperature = 0.8;
  defaultOptions.stream = false;

  const mergedOptions = { ...defaultOptions, ...options, messages };

  try {
    const { object } = await retryWithExponentialBackoff(() =>
      generateObject(mergedOptions)
    );
    return object;
  } catch (error) {
    console.error("Error processing structured data:", error);
    throw error;
  }
};

export const processStructureDataStreaming = async (messages: CoreMessage[], options = {}) => {
  const defaultOptions = generateDefaultOptions();
  defaultOptions.temperature = 1.2;
  defaultOptions.stream = true;

  const mergedOptions = { ...defaultOptions, ...options, messages };

  try {
    const stream = await streamObject(mergedOptions);
    return stream;
  } catch (error) {
    console.error("Error processing final response:", error);
    throw error;
  }
};
