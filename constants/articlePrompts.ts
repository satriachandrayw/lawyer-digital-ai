import type { CoreMessage } from 'ai'

export const articleTitleMessage = (topic: string, language: string, newsType: string): CoreMessage[] => [
  {
    role: 'system',
    content: `You are an AI assistant specialized in generating news article titles. 
    Create a compelling and informative title for a ${newsType} article about ${topic}. 
    The title should be in ${language}.`,
  },
  {
    role: 'user',
    content: `Generate a title for a ${newsType} article about ${topic} in ${language}.`,
  },
]

export const articleContentMessage = (topic: string, language: string, newsType: string, browseResult: string): CoreMessage[] => [
  {
    role: 'system',
    content: `You are an AI assistant specialized in writing news articles. 
    Create a well-structured ${newsType} article about ${topic}. 
    The article should be informative, engaging, and written in ${language}. 
    Include relevant details, quotes if applicable, and maintain a journalistic style 
    appropriate for the news type. 
    Use the following context from internet research to enrich your article:

${browseResult}

Incorporate this information naturally into your article, ensuring a coherent and well-rounded piece.`,
  },
  {
    role: 'user',
    content: `Write a ${newsType} article content about ${topic} in ${language}. 
    Provide a comprehensive and well-structured content, 
    incorporating the provided context from internet research.`,
  },
]

export const articleStructureMessage = (topic: string, language: string, newsType: string, browseResult: string): CoreMessage[] => [
  {
    role: 'system',
    content: `You are an AI assistant specialized in generating news article structures. 
    Create an article for a ${newsType} article about ${topic}. 
    The outline should be informative, engaging, and written in ${language}. 
    Include relevant details, quotes if applicable, and maintain a journalistic style appropriate for the news type. 
    Consider the following context from internet research when creating your structure:

${browseResult}

Use this information to gaining context of the article and ensure a comprehensive coverage of the topic.`,
  },
  {
    role: 'user',
    content: `Create an article for a ${newsType} article about ${topic} in ${language}. 
    Provide a comprehensive and well-structured outline, incorporating the provided context from internet research. 
    Include a title and main sections with brief descriptions.`,
  },
]