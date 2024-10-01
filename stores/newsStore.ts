import { defineStore } from 'pinia'

import type { Section, News, NewsState } from '@/types/news'

export const useNewsStore = defineStore('news', {
  state: (): NewsState => ({
    news: {
      title: '',
      sections: [] as Section[]
    } as News,
    documentType: 'news',
    topic: '',
    language: '',
    newsType: '',
    browseResult: '',
  }),
  actions: {
    setTitle(title: string) {
      this.news.title = title;
    },
    setDocumentType(type: string) {
      this.documentType = type;
    },
    setTopic(topic: string) {
      this.topic = topic;
    },
    setLanguage(language: string) {
      this.language = language;
    },
    setNewsType(newsType: string) {
      this.newsType = newsType;
    },
    setBrowseResult(result: string) {
      this.browseResult = result;
    },
    setSections(sections: Section[]) {
      this.news.sections = sections;
    },
    clearNews() {
      this.news = {
        title: '',
        sections: [] as Section[]
      } as News;
      this.topic = '';
      this.language = '';
      this.newsType = '';
      this.browseResult = '';
    },
  },
});