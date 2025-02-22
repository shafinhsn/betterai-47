
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
}

export interface ProcessedDocument {
  content: string;
  filePath: string;
  filename: string;
}
