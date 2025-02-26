
import { Citation } from '@/types/citation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Copy, Trash } from 'lucide-react';

interface CitationListProps {
  citations: Citation[];
  onDelete: (id: string) => void;
}

export const CitationList = ({ citations, onDelete }: CitationListProps) => {
  const { toast } = useToast();

  const generateCitation = useMutation({
    mutationFn: async (citation: Citation) => {
      const { data, error } = await supabase.functions.invoke('generate-citation', {
        body: { citation }
      });

      if (error) throw error;
      return data.citation;
    },
    onSuccess: (formattedCitation) => {
      navigator.clipboard.writeText(formattedCitation);
      toast({
        title: "Citation copied",
        description: "The formatted citation has been copied to your clipboard.",
      });
    },
    onError: (error) => {
      console.error('Error generating citation:', error);
      toast({
        title: "Error",
        description: "Failed to generate citation. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (!citations.length) {
    return (
      <div className="text-center p-8 text-emerald-50">
        No citations yet. Click "Add Citation" to create one.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {citations.map((citation) => (
        <Card key={citation.id} className="p-4 bg-secondary/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-50">{citation.title}</h3>
              <p className="text-sm text-emerald-300 mt-1">
                {citation.type.charAt(0).toUpperCase() + citation.type.slice(1)}
              </p>
              {citation.contributors && citation.contributors.length > 0 && (
                <p className="text-sm text-emerald-400 mt-2">
                  {citation.contributors
                    .filter(c => c.role === 'author')
                    .map(c => `${c.first_name} ${c.last_name}`)
                    .join(', ')}
                </p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => generateCitation.mutate(citation)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Citation
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => citation.id && onDelete(citation.id)}
                  className="text-red-500"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  );
};
