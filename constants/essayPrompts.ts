import type { CoreMessage } from "ai"

import { characteristicTone, languageTone } from "./utilPrompt"

const getEssaySystemMessage = (characteristic: string, language: string, searchContext?: string, draftEssay?: string): string => {
  return searchContext
    ? `I want you to act as an essay writer. 
      You will need to research a given topic, 
      Below is the context from internet research to enrich your article:
      \`
      ${searchContext}
      \`

      the essay structure is as follows:
      \`
      1. introduction
      the introduction contains something information about the opening of the topic.
      2. body
      the body contains the main content of the essay, it is the most important part of the essay.
      it consist of different section, each section is a paragraph that is related to each other.
      the section explain the topic in detail based  on the section title itself.
      use the context from internet research to enrich your essay only if it is relevant to the section you are writing.
      dont use the context if it not correlated with the section you are writing.
      3. conclusion
      the conclusion is the last part of the essay, it is the summary of the body of the essay. not take the context from the internet.
      \`
      ` + (
      draftEssay ? `here's the draft essay :
      \`
      ${draftEssay}
      \`
      use the draft for generating or updating section you are writing, ensuring consistency and coherence with the existing content.
      dont write the same content from the draft.
      ` : '') +
      `
      formulate a thesis statement using ${languageTone(language)}, 
      and create a piece of work that are ${characteristic} and ${characteristicTone(characteristic)}.
      `
    : 
    `I want you to act as an essay writer. 
      You will need to research a given topic, 
      formulate a thesis statement, 
      and create a persuasive piece of work that are ${characteristic} and ${characteristicTone(characteristic)}. `;
}

export const essayTitleMessage = (topic: string, language?: string, characteristic?: string): CoreMessage[] => {
  const systemContent = `You are a journalist specialist on law and politics that suggests essay titles based on given topics.` +
    (characteristic ? ` create a piece of work that are ${characteristicTone(characteristic)}` : '') +
    (language ? ` using ${languageTone(language)}.` : 'using Indonesian language.') +
    ` Just give me a title on 80 character max, dont add anything else.`;

  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: `Please suggest a title for an essay about: "${topic}"` },
  ];
}

export const essayContentMessage = (topic: string, language: string, characteristic: string, index: number, section: string, searchContext?: string, draftEssay?: string): CoreMessage[] => {
  const prompt = `
  Write a paragraph for section ${index + 1}: "${section}" 
  based on the topic: "${topic}".
`

  const systemContent = getEssaySystemMessage(characteristic, language, searchContext, draftEssay);

  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: prompt },
  ]
}

export const essaySectionMessage = (topic: string, documentType: string, language: string, characteristic: string, sectionIndex: number, currentSections: string[], searchContext?: string, draftEssay?: string): CoreMessage[] => {
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

  const systemContent = getEssaySystemMessage(characteristic, language, searchContext, draftEssay);

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

