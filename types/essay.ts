export interface Section {
  title: string
  description: string
  content?: string
  isProcessing?: boolean
  isRegenerating?: boolean
  editing?: boolean
  editTitle?: string
}

export interface Essay {
  title?: string
  sections: Section[]
}

export interface EssaySectionResponse {
  sections: Section
}

export interface EssayState {
  essay: Essay
  documentType: string
  topic: string
  language: string
  characteristic: string
  useWebSearch: boolean
}
