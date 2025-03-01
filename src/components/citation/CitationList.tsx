
import { useState } from 'react';
import { Citation } from '@/types/citation';
import { Button } from "@/components/ui/button";
import { ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CitationListTable } from './CitationListTable';
import { FormattedCitationDialog } from './FormattedCitationDialog';
import { generateFormattedCitations, createCitationPage } from './citationService';

interface CitationListProps {
  citations: Citation[];
  onDelete: (id: string) => void;
}

export const CitationList = ({ citations, onDelete }: CitationListProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [citationListFormat, setCitationListFormat] = useState<'mla' | 'apa'>('mla');
  const [formattedCitations, setFormattedCitations] = useState<string[]>([]);
  const [citationListDialogOpen, setCitationListDialogOpen] = useState(false);
  const { toast } = useToast();

  const generateCitationList = async (format: 'mla' | 'apa') => {
    setIsLoading(true);
    setCitationListFormat(format);
    try {
      const formattedResults = await generateFormattedCitations(citations, format);

      console.log('Generated formatted citations:', formattedResults);
      setFormattedCitations(formattedResults);
      setCitationListDialogOpen(true);
    } catch (error) {
      console.error('Error generating citation list:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate citation list. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const citationPage = createCitationPage(formattedCitations, citationListFormat);
    
    navigator.clipboard.writeText(citationPage)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Citation list has been copied to your clipboard.",
        });
        setCitationListDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy to clipboard. Please try again.",
        });
      });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button 
          variant="outline" 
          onClick={() => generateCitationList('mla')}
          disabled={isLoading || citations.length === 0}
          className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
        >
          <ClipboardList className="w-4 h-4 mr-2" />
          MLA Citation List
        </Button>
        <Button 
          variant="outline" 
          onClick={() => generateCitationList('apa')}
          disabled={isLoading || citations.length === 0}
          className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
        >
          <ClipboardList className="w-4 h-4 mr-2" />
          APA Citation List
        </Button>
      </div>
      
      <CitationListTable citations={citations} onDelete={onDelete} />

      <FormattedCitationDialog
        open={citationListDialogOpen}
        onOpenChange={setCitationListDialogOpen}
        format={citationListFormat}
        citations={formattedCitations}
        onCopy={copyToClipboard}
      />
    </div>
  );
};
