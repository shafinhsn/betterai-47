
import { useState } from 'react';
import { Citation } from '@/types/citation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Copy, Clipboard, ClipboardList } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CitationListProps {
  citations: Citation[];
  onDelete: (id: string) => void;
}

export const CitationList = ({ citations, onDelete }: CitationListProps) => {
  const [formatDialogOpen, setFormatDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [citationListFormat, setCitationListFormat] = useState<'mla' | 'apa'>('mla');
  const [formattedCitations, setFormattedCitations] = useState<string[]>([]);
  const [citationListDialogOpen, setCitationListDialogOpen] = useState(false);
  const { toast } = useToast();

  const generateCitationList = async (format: 'mla' | 'apa') => {
    setIsLoading(true);
    setCitationListFormat(format);
    try {
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
    // Create the formatted citation page with the proper header
    let citationPage = "";
    
    if (citationListFormat === 'mla') {
      citationPage = "Works Cited\n\n";
    } else if (citationListFormat === 'apa') {
      citationPage = "References\n\n";
    }
    
    // Add each citation with proper indentation
    citationPage += formattedCitations.join('\n\n');
    
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
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Publisher</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {citations.map((citation) => (
            <TableRow key={citation.id}>
              <TableCell>{citation.type}</TableCell>
              <TableCell>{citation.title}</TableCell>
              <TableCell>{citation.publisher}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => citation.id && onDelete(citation.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={citationListDialogOpen} onOpenChange={setCitationListDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              {citationListFormat === 'mla' ? 'Works Cited' : 'References'}
            </DialogTitle>
            <DialogDescription>
              Your formatted citation list is ready to copy
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2 max-h-[400px] overflow-y-auto p-4 border rounded-md bg-emerald-950/30">
            {formattedCitations.length === 0 ? (
              <p className="text-emerald-300">No citations available</p>
            ) : (
              <div className="space-y-4">
                {formattedCitations.map((citation, index) => (
                  <p key={index} className="text-emerald-50 font-mono text-sm pl-8 -indent-8">
                    {citation}
                  </p>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <Button onClick={copyToClipboard} className="bg-emerald-600 hover:bg-emerald-700">
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
