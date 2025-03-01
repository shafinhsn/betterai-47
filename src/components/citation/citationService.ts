
import { Citation } from '@/types/citation';
import { supabase } from '@/integrations/supabase/client';

export const generateFormattedCitations = async (citations: Citation[], format: 'mla' | 'apa'): Promise<string[]> => {
  const formattedResults: string[] = [];

  // Process citations in sequence
  for (const citation of citations) {
    const { data, error } = await supabase.functions.invoke('generate-citation', {
      body: { citation, format }
    });

    if (error) throw error;
    
    if (data.citation) {
      formattedResults.push(data.citation.trim());
    }
  }

  return formattedResults;
};

export const createCitationPage = (citations: string[], format: 'mla' | 'apa'): string => {
  // Create the formatted citation page with the proper header
  let citationPage = "";
  
  if (format === 'mla') {
    citationPage = "Works Cited\n\n";
  } else if (format === 'apa') {
    citationPage = "References\n\n";
  }
  
  // Add each citation with proper indentation
  citationPage += citations.join('\n\n');
  
  return citationPage;
};
