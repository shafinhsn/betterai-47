
import { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface AIDetectionButtonProps {
  content?: string;
  isAIModified?: boolean;
}

export const AIDetectionButton = ({ content, isAIModified }: AIDetectionButtonProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handleAICheck = async () => {
    if (!isAIModified) {
      toast({
        title: "No AI changes",
        description: "This button is only active after requesting document changes through the chat",
        variant: "destructive"
      });
      return;
    }

    const trimmedContent = content?.trim();
    if (!trimmedContent) {
      toast({
        title: "No content",
        description: "There is no content to check for AI generation",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('detect-ai', {
        body: { text: trimmedContent }
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

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAICheck}
      disabled={isChecking || !isAIModified}
      className={`bg-emerald-900/20 border-emerald-800/30 text-emerald-50 ${isAIModified ? 'hover:bg-emerald-800/30' : 'opacity-50 cursor-not-allowed'}`}
    >
      <Bot className="w-4 h-4 mr-2" />
      {isChecking ? 'Checking...' : 'Check for AI'}
    </Button>
  );
};
