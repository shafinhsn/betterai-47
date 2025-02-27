
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { NewCitationDialog } from './NewCitationDialog';
import { CitationList } from './CitationList';
import { Citation } from '@/types/citation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const CitationManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: citations, isLoading } = useQuery({
    queryKey: ['citations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('citations')
        .select(`
          *,
          contributors:citation_contributors(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Citation[];
    }
  });

  const createCitation = useMutation({
    mutationFn: async (citation: Citation) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Creating citation with user_id:', user.id);

      const { data: citationData, error: citationError } = await supabase
        .from('citations')
        .insert([{
          type: citation.type,
          title: citation.title,
          url: citation.url,
          doi: citation.doi,
          isbn: citation.isbn,
          publisher: citation.publisher,
          publication_date: citation.publication_date,
          accessed_date: citation.accessed_date,
          user_id: user.id
        }])
        .select()
        .single();

      if (citationError) {
        console.error('Citation creation error:', citationError);
        throw citationError;
      }

      if (citation.contributors?.length) {
        const { error: contributorsError } = await supabase
          .from('citation_contributors')
          .insert(
            citation.contributors.map(contributor => ({
              ...contributor,
              citation_id: citationData.id
            }))
          );

        if (contributorsError) {
          console.error('Contributors creation error:', contributorsError);
          throw contributorsError;
        }
      }

      return citationData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citations'] });
      toast({
        title: "Citation created",
        description: "Your citation has been saved successfully.",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error creating citation:', error);
      toast({
        title: "Error",
        description: "Failed to create citation. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteCitation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('citations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citations'] });
      toast({
        title: "Citation deleted",
        description: "The citation has been removed.",
      });
    },
    onError: (error) => {
      console.error('Error deleting citation:', error);
      toast({
        title: "Error",
        description: "Failed to delete citation. Please try again.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-emerald-50">Citations</h2>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Add Citation
        </Button>
      </div>

      {isLoading ? (
        <div className="text-emerald-50">Loading citations...</div>
      ) : (
        <CitationList 
          citations={citations || []} 
          onDelete={(id) => deleteCitation.mutate(id)}
        />
      )}

      <NewCitationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={(citation) => createCitation.mutate(citation)}
      />
    </div>
  );
};
