
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { SubscriptionDialog } from '@/components/SubscriptionDialog';
import { useMessageUsage } from '@/hooks/use-message-usage';
import { FREE_TIER_LIMIT } from '@/constants/subscription';
import { AuthHoverCard } from './AuthHoverCard';
import { MessageList } from './chat/MessageList';
import { ChatInput } from './chat/ChatInput';
import { TrialBanner } from './chat/TrialBanner';
import type { ChatProps, SubscriptionPlan } from '@/types/chat';

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
      <div className="flex flex-col h-full">
        {messages.length > 0 && <MessageList messages={messages} />}
        <div className="p-4 border-t border-emerald-900/20">
          <AuthHoverCard />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {subscription && <TrialBanner subscription={subscription} />}
      <MessageList messages={messages} />
      
      {messageCount < FREE_TIER_LIMIT && !subscription && (
        <div className="px-4 py-2 bg-emerald-900/20 text-emerald-50 text-sm">
          {FREE_TIER_LIMIT - messageCount} messages remaining in free tier
        </div>
      )}
      
      <ChatInput
        input={input}
        isLoading={isLoading}
        chatPresets={chatPresets}
        selectedPreset={selectedPreset}
        subscription={subscription}
        onInputChange={setInput}
        onPresetChange={setSelectedPreset}
        onSubmit={handleSubmit}
      />

      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
};
