
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
import { Trash2, Plus } from 'lucide-react';
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
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CitationListProps {
  citations: Citation[];
  onDelete: (id: string) => void;
  onAddToDocument?: (citation: string) => void;
}

export const CitationList = ({ citations, onDelete, onAddToDocument }: CitationListProps) => {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [formatDialogOpen, setFormatDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddCitation = async (citation: Citation, format: 'mla' | 'apa') => {
    setIsLoading(true);
    try {
      console.log('Generating citation with format:', format);
      const { data, error } = await supabase.functions.invoke('generate-citation', {
        body: { citation, format }
      });

      if (error) throw error;

      console.log('Generated citation:', data.citation);
      if (data.citation && onAddToDocument) {
        // Add newlines to ensure proper formatting
        const formattedCitation = `\n\n${data.citation}`;
        console.log('Adding citation to document:', formattedCitation);
        window.parent.postMessage({ 
          type: 'UPDATE_DOCUMENT', 
          content: formattedCitation 
        }, '*');
        toast({
          title: "Citation added",
          description: "The citation has been added to your document.",
        });
      }
    } catch (error) {
      console.error('Error generating citation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate citation. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setFormatDialogOpen(false);
      setSelectedCitation(null);
    }
  };

  return (
    <>
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
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCitation(citation);
                    setFormatDialogOpen(true);
                  }}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Citation
                </Button>
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

      <AlertDialog open={formatDialogOpen} onOpenChange={setFormatDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose Citation Format</AlertDialogTitle>
            <AlertDialogDescription>
              Select the format for your citation
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCitation && handleAddCitation(selectedCitation, 'mla')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              MLA
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => selectedCitation && handleAddCitation(selectedCitation, 'apa')}
              className="bg-green-600 hover:bg-green-700"
            >
              APA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
