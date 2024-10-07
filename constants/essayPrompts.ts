import type { CoreMessage } from "ai"

import { characteristicTone, languageTone } from "./utilPrompt"

const getEssaySystemMessage = (characteristic: string, searchContext?: string): string => {
  return searchContext
    ? `I want you to act as an essay writer. 
      You will need to research a given topic, 
      formulate a thesis statement, 
      and create a piece of work that are ${characteristic} and ${characteristicTone(characteristic)}. 
      Use the following context from internet research to enrich your article:
      ${searchContext}`
    : `I want you to act as an essay writer. 
      You will need to research a given topic, 
      formulate a thesis statement, 
      and create a persuasive piece of work that are ${characteristic} and ${characteristicTone(characteristic)}. `;
}

export const essayContentMessage = (topic: string, language: string, characteristic: string, index: number, section: string, searchContext?: string): CoreMessage[] => {
  const prompt = `
  Write a detailed and structured paragraph for section ${index + 1}: "${section}" 
  based on the topic: "${topic}".
  Write the response in ${languageTone(language)}.
`

  const systemContent = getEssaySystemMessage(characteristic, searchContext);

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
    write the answer in ${languageTone(language)}.
  `

  const systemContent = getEssaySystemMessage(characteristic, searchContext);

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
    Write the response in ${languageTone(language)}.
  `
  const systemContent = getEssaySystemMessage(characteristic, searchContext);
  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: prompt },
  ]
}

