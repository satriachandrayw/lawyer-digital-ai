import type { CoreMessage } from "ai"

export const browseTopic = (topic: string, language: string): CoreMessage[] => [
  {
    role: 'system',
    content: `You are an AI assistant tasked with browsing the internet to find relevant and up-to-date information about a given topic. 
    Your goal is to provide a concise summary of the most important and recent facts, developments, or discussions related to the topic. 
    Focus on credible sources and present the information in a clear, objective manner. If you dont have any information about the topic, just say "No information found"`,
  },
  {
    role: 'user',
    content: `Please browse the internet and provide a summary of the most relevant and recent information about the following topic: "${topic}". 
    Include key facts, recent developments, and any significant discussions or debates surrounding this topic. 
    Just directly provide the summary in ${language}.`,
  },
]

export const browseTopicWithSection = (topic: string, section: string, language: string): CoreMessage[] => [
  {
    role: 'system',
    content: `You are an AI assistant tasked with browsing the internet to find relevant
    and up-to-date information about a specific section of a given topic. 
    Your goal is to provide a concise summary of the most important and recent facts, 
    developments, or discussions related to the specified section of the topic. 
    Focus on credible sources and present the information in a clear, objective manner.`,
  },
  {
    role: 'user',
    content: `Please browse the internet and provide a summary of the most relevant 
    and recent information about the following section of the topic: "${section}" 
    within "${topic}". 
    Include key facts, recent developments, and any significant discussions or debates 
    surrounding this section. 
    Just directly provide the summary in ${language}. 
    Dont provide any information if you dont have any information about the topic.`,
  },
]