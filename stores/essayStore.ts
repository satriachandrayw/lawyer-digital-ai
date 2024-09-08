import { defineStore } from 'pinia'

export const useEssayStore = defineStore('essay', {
  state: () => ({
    topic: '',
    documentType: 'essay',
    sections: [] as string[],
    contents: [] as string[], // Property to store contents
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
      this.contents = new Array(sections.length).fill(''); // Initialize contents array
    },
    updateSection(index: number, updatedSection: string) {
      this.sections[index] = updatedSection;
    },
    updateContent(index: number, content: string) {
      this.contents[index] = content; // Update content for the specific section
    },
    updateFullContent(newContents: string[]) {
      this.contents = newContents; // Update the entire contents array
    },
    clearContents() {
      this.contents = [];
    },
    clearSections() {
      this.sections = [];
      this.contents = []; // Clear contents as well
    }
  }
})
