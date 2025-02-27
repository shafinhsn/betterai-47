
import { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface AIDetectionButtonProps {
  content?: string;
}

export const AIDetectionButton = ({ content }: AIDetectionButtonProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handleAICheck = async () => {
    const trimmedContent = content?.trim();
    if (!trimmedContent) {
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

  // The button should be disabled when there's no content or when checking is in progress
  const hasContent = Boolean(content?.trim());

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAICheck}
      disabled={isChecking || !hasContent}
      className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
    >
      <Bot className="w-4 h-4 mr-2" />
      {isChecking ? 'Checking...' : 'Check for AI'}
    </Button>
  );
};
