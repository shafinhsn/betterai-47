
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
    citationPage = "                                Works Cited\n\n";
  } else if (format === 'apa') {
    citationPage = "                                References\n\n";
  }
  
  // Add each citation with proper hanging indentation
  citationPage += citations.map(citation => {
    // Apply hanging indent formatting by adding spaces to subsequent lines
    const lines = citation.split('\n');
    if (lines.length > 1) {
      return lines[0] + '\n' + lines.slice(1).map(line => `    ${line}`).join('\n');
    }
    return citation;
  }).join('\n\n');
  
  return citationPage;
};
