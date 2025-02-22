
import { useState, useEffect } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { SubscriptionDialog } from '@/components/SubscriptionDialog';
import { useMessageUsage } from '@/hooks/use-message-usage';
import { FREE_TIER_LIMIT } from '@/constants/subscription';
import type { ChatProps, Message, SubscriptionPlan } from '@/types/chat';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthHoverCard } from './AuthHoverCard';

export const Chat = ({ onSendMessage, messages, documentContent, onDocumentUpdate }: ChatProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [chatPresets, setChatPresets] = useState<string[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [session, setSession] = useState<boolean>(false);
  const { messageCount, subscription, updateMessageCount } = useMessageUsage();
  const { toast } = useToast();

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(!!session);
    };
    
    loadSession();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadChatPresets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('chat_presets')
        .select('name')
        .eq('user_id', user.id);

      if (data) {
        setChatPresets(['summarize', 'formal', 'casual', ...(data.map(p => p.name))]);
      } else {
        setChatPresets(['summarize', 'formal', 'casual']);
      }
    };

    if (subscription?.plan_type === 'Student Pro') {
      loadChatPresets();
    }
  }, [subscription]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    toast({
      description: "This is a demo of the subscription feature. In production, this would integrate with Stripe for payments.",
    });
    setShowSubscriptionDialog(false);
  };

  const checkUsageLimit = async () => {
    if (subscription) return true;
    
    if (messageCount >= FREE_TIER_LIMIT) {
      setShowSubscriptionDialog(true);
      return false;
    }
    
    return true;
  };

  const renderTrialMessage = () => {
    if (!subscription) return null;
    if (subscription.trial_end_at) {
      const trialEnd = new Date(subscription.trial_end_at);
      const now = new Date();
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 3600 * 24));

      if (daysLeft <= 0) return null;

      return (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {daysLeft <= 3 
              ? `⚠️ Your trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}! Subscribe to continue using the service.`
              : `Your trial period ends in ${daysLeft} days.`}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  const handleSendMessage = async (content: string) => {
    try {
      const canSendMessage = await checkUsageLimit();
      if (!canSendMessage) return;

      setIsLoading(true);
      
      onSendMessage(content, 'user');
      
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: content,
          context: documentContent || '',
          preset: selectedPreset,
        },
      });

      if (error) throw error;

      console.log('Chat response:', data);

      if (data?.updatedDocument) {
        console.log('Updating document with new content');
        onDocumentUpdate(data.updatedDocument);
        onSendMessage("I've updated the document based on your request. You can see the changes in the preview panel.", 'ai');
      } else if (data?.reply) {
        if (documentContent) {
          onDocumentUpdate(documentContent);
        }
        onSendMessage(data.reply, 'ai');
      }

      await updateMessageCount();

    } catch (error) {
      console.error('Error sending message:', error);
      onSendMessage('Sorry, I encountered an error while processing your request.', 'ai');
    } finally {
      setIsLoading(false);
      setSelectedPreset('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSendMessage(input);
      setInput('');
    }
  };

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center">
        <AuthHoverCard />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {renderTrialMessage()}
        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={cn(
              'mb-4 p-4 rounded-lg max-w-[80%] font-sans',
              message.sender === 'user'
                ? 'ml-auto bg-emerald-600 text-white'
                : 'mr-auto bg-emerald-900/30 text-emerald-50'
            )}
          >
            {message.content}
          </div>
        ))}
      </ScrollArea>
      
      {messageCount < FREE_TIER_LIMIT && !subscription && (
        <div className="px-4 py-2 bg-emerald-900/20 text-emerald-50 text-sm">
          {FREE_TIER_LIMIT - messageCount} messages remaining in free tier
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-emerald-900/20">
        <div className="flex flex-col gap-2">
          {subscription?.plan_type === 'Student Pro' && (
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select chat preset (optional)" />
              </SelectTrigger>
              <SelectContent>
                {chatPresets.map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your document..."
              className="flex-1 bg-emerald-900/20 border-emerald-800/30 text-emerald-50 placeholder:text-emerald-500/50"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading} className="bg-emerald-700 hover:bg-emerald-600">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>

      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
};
