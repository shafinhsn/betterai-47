
export type DocumentFormat = 'none' | 'mla' | 'apa';
export type DocumentAlignment = 'left' | 'center' | 'right';

export interface DocumentFormattingOptions {
  fontSize: number;
  fontFamily: string;
  alignment: DocumentAlignment;
  format: DocumentFormat;
}
