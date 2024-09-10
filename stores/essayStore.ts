import { defineStore } from 'pinia'

import type { Section, Essay, EssayState } from '@/types/essay'

export const useEssayStore = defineStore('essay', {
  state: (): EssayState => ({
    essay: {
      title: '',
      sections: [] as Section[]
    } as Essay,
    documentType: 'essay',
    topic: '',
  }),
  actions: {
    setTitle(title: string) {
      this.essay.title = title;
    },
    setDocumentType(type: string) {
      this.documentType = type;
    },
    setTopic(topic: string) {
      this.topic = topic;
    },
    setSections(sections: Section[]) {
      this.essay.sections = sections;
    },
    updateSection(index: number, updatedSection: Partial<Section>) {
      this.essay.sections[index] = { ...this.essay.sections[index], ...updatedSection };
    },
    clearEssay() {
      this.essay = { title: '', sections: [] };
      this.topic = '';
    },
    clearSections() {
      this.essay = { title: this.essay.title, sections: [] };
    },
    clearContents() {
      this.essay.sections.forEach(section => {
        section.content = '';
      });
    },
    setEssay(essay: Essay) {
      this.essay = essay;
    }
  }
})
