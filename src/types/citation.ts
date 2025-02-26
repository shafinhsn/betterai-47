
export type CitationType = 'website' | 'book' | 'journal';

export interface Contributor {
  id?: string;
  citation_id?: string;
  role: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
}

export interface Citation {
  id?: string;
  user_id?: string;
  type: CitationType;
  title: string;
  url?: string;
  doi?: string;
  isbn?: string;
  publisher?: string;
  publication_date?: string;
  accessed_date?: string;
  contributors?: Contributor[];
}
