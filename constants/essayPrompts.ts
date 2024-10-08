import type { CoreMessage } from "ai"

import { characteristicTone, languageTone } from "./utilPrompt"

const getEssaySystemMessage = (characteristic: string, language: string, searchContext?: string): string => {
  return searchContext
    ? `I want you to act as an essay writer. 
      You will need to research a given topic, 
      formulate a thesis statement using ${languageTone(language)}, 
      and create a piece of work that are ${characteristic} and ${characteristicTone(characteristic)}. 
      Below is the context from internet research to enrich your article:
      
      ${searchContext}
      
      use the context only if it is relevant to section you are writing.`
    : `I want you to act as an essay writer. 
      You will need to research a given topic, 
      formulate a thesis statement, 
      and create a persuasive piece of work that are ${characteristic} and ${characteristicTone(characteristic)}. `;
}

export const essayTitleMessage = (topic: string, language?: string, characteristic?: string): CoreMessage[] => {
  const systemContent = `You are a helpful assistant that suggests essay titles based on given topics.` +
    (characteristic ? ` create a piece of work that are ${characteristic} and ${characteristicTone(characteristic)}.` : '') +
    (language ? ` using ${languageTone(language)}.` : 'using Indonesian language.') +
    ` Just give me a title, dont add anything else.
    Example 1:
    User: Donald Trump
    Assistant: Donald Trump and His Impact on the 2024 Presidential Election

    Example 2 :
    User: Joko Widodo
    Assistant: Joko Widodo and His Vision for Indonesia's Future
    `;

  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: `Please suggest a concise and engaging title for an essay about: "${topic}"` },
  ];
}

export const essayContentMessage = (topic: string, language: string, characteristic: string, index: number, section: string, searchContext?: string): CoreMessage[] => {
  const prompt = `
  Write a paragraph for section ${index + 1}: "${section}" 
  based on the topic: "${topic}".
`

  const systemContent = getEssaySystemMessage(characteristic, language, searchContext);

  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: prompt },
  ]
}

export const essaySectionMessage = (topic: string, documentType: string, language: string, characteristic: string, sectionIndex: number, currentSections: string[], searchContext?: string): CoreMessage[] => {
  const prompt = `
    Given an essay on the topic "${topic}" of type "${documentType}", 
    with the following current section titles:
    ${currentSections.map((title, index) => `${index + 1}. ${title}`).join('\n')}

    Please regenerate the section at index ${sectionIndex + 1} (currently "${currentSections[sectionIndex]}").
    Provide a new title and brief content for this section that fits well with the other sections 
    and maintains the overall flow and coherence of the essay.
    Ensure the essay is written with a ${characteristic} tone, 
    focusing on ${characteristicTone(characteristic)}.
    write down the description just 1 sentence max 100 character.
  `

  const systemContent = getEssaySystemMessage(characteristic, language, searchContext);

  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: prompt },
  ]
}

export const essayStructureMessage = (topic: string, language: string, characteristic: string, searchContext?: string): CoreMessage[] => {
  const prompt = `
    Generate a structured outline for an essay based on the topic: "${topic}". 
    Include main ideas and subpoints that logically flow together.
    Ensure the essay is written with a ${characteristic} tone, 
    focusing on ${characteristicTone(characteristic)}.
    write down the description just 1 sentence max 100 character.
  `
  const systemContent = getEssaySystemMessage(characteristic, language, searchContext);
  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: prompt },
  ]
}

