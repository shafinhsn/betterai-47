
import { Button } from '@/components/ui/button';
import { Pencil, Save, Bot } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditControlsProps {
  isEditing: boolean;
  isProcessing: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  content?: string;
}

export const EditControls = ({
  isEditing,
  isProcessing,
  onEditToggle,
  onSave,
  content,
}: EditControlsProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handleAICheck = async () => {
    if (!content) {
      toast({
        title: "No content",
        description: "Please add some content to check for AI generation",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('detect-ai', {
        body: { text: content }
      });

      if (error) throw error;

      toast({
        title: "AI Detection Results",
        description: `This text is ${data.aiScore}% likely to be AI-generated (${data.confidence} confidence)`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error checking for AI:', error);
      toast({
        title: "Error",
        description: "Failed to check for AI generation",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (!isEditing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onEditToggle}
        disabled={isProcessing}
        className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
      >
        <Pencil className="w-4 h-4 mr-2" />
        Edit
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleAICheck}
        disabled={isChecking || !content}
        className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
      >
        <Bot className="w-4 h-4 mr-2" />
        {isChecking ? 'Checking...' : 'Check for AI'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
        disabled={isProcessing}
        className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Changes
      </Button>
    </div>
  );
};
