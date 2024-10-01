export interface News {
  title?: string;
  sections: Section[];
}

export interface Section {
  title: string;
  description: string;
  content?: string;
  isProcessing?: boolean;
  isRegenerating?: boolean;
  editing?: boolean;
  editTitle?: string;
}

export interface NewsState {
  news: News;
  documentType: string;
  topic: string;
  language: string;
  newsType: string;
  browseResult?: string;
}