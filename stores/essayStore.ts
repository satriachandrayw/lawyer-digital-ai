import { defineStore } from 'pinia'

export const useEssayStore = defineStore('essay', {
  state: () => ({
    topic: '',
    documentType: 'essay',
    sections: [] as string[]
  }),
  actions: {
    setTopic(topic: string) {
      this.topic = topic
    },
    setDocumentType(type: string) {
      this.documentType = type
    },
    setSections(sections: string[]) {
      this.sections = sections
    }
  }
})
