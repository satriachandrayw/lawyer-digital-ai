export const characteristicTone = (characteristic: string) => {
  return {
    creative: 'imaginative and engaging storytelling',
    analytical: 'detailed analysis and logical reasoning',
    persuasive: 'convincing arguments and persuasive language',
    informative: 'clear explanations and concise information',
    descriptive: 'vivid descriptions and sensory details',
  }[characteristic]
}

export const languageTone = (language: string) => language === 'id' ? 'Bahasa Indonesia' : 'English'