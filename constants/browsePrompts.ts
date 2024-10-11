import type { CoreMessage } from "ai"

export const browseTopic = (topic: string, language: string): CoreMessage[] => [
  {
    role: 'system',
    content: `As an AI assistant, your task is to browse the internet for up-to-date, credible information about a given topic. 
    Provide comprehensive, recent facts, developments, or discussions related to the topic in a clear, objective manner, including source citations. 
    If no information is found, state "No information found".`,
  },
  {
    role: 'user',
    content: `Please browse the internet following the topic: "${topic}". 
    Just directly provide the information in ${language}.`,
  },
]

export const browseTopicWithSection = (topic: string, section: string, language: string): CoreMessage[] => [
  {
    role: 'system',
    content: `As an AI assistant, your task is to browse the internet for up-to-date comprehensive information about 
    a specific section of a given topic. Provide the most important and recent facts, developments, 
    or discussions related to the specified section. 
    Use credible sources and present the information clearly and objectively, including source citations.`,
  },
  {
    role: 'user',
    content: `Please browse the internet about the following section of the topic: "${section}" 
    within "${topic}". 
    Just directly provide the information in ${language}.`,
  },
]