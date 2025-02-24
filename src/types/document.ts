
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  documentState?: string;
}

export interface ProcessedDocument {
  content: string;
  filePath: string;
  filename: string;
  fileType: string;
}
