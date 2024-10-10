export const cleanIndonesianText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[""]/g, '"')
    .replace(/['']/g, '\'')
    .trim()
}

export const splitTextIntoChunks = (text: string, maxChunkSize: number = 4000): string[] => {
  const chunks: string[] = []
  let currentChunk = ''

  text.split('\n').forEach((paragraph) => {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      chunks.push(currentChunk.trim())
      currentChunk = ''
    }
    currentChunk += paragraph + '\n'
  })

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}
