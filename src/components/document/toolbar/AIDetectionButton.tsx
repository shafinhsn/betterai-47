
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

  // Add debug logs to track content and button state
  console.log('AIDetectionButton content:', content);
  console.log('AIDetectionButton disabled state:', isChecking || !content);

  const handleAICheck = async () => {
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
      console.log('Checking content for AI:', trimmedContent);
      const { data, error } = await supabase.functions.invoke('detect-ai', {
        body: { text: trimmedContent }
      });

      if (error) throw error;

      console.log('AI detection results:', data);
      toast({
        title: "AI Detection Results",
        description: `This text is ${data.aiScore}% likely to be AI-generated (${data.confidence} confidence)`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error checking for AI:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check for AI generation",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const isDisabled = isChecking || !content;
  console.log('Final button disabled state:', isDisabled);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAICheck}
      disabled={isDisabled}
      className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
    >
      <Bot className="w-4 h-4 mr-2" />
      {isChecking ? 'Checking...' : 'Check for AI'}
    </Button>
  );
};

