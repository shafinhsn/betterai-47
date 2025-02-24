
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useMessageUsage } from '@/hooks/use-message-usage';
import { INITIAL_FREE_MESSAGES, DAILY_FREE_MESSAGES, DAILY_SUBSCRIPTION_LIMIT } from '@/constants/subscription';
import { MessageList } from './chat/MessageList';
import { ChatInput } from './chat/ChatInput';
import { TrialBanner } from './chat/TrialBanner';
import type { ChatProps } from '@/types/chat';

export const Chat = ({ 
  onSendMessage, 
  messages, 
  documentContent, 
  onDocumentUpdate,
  isAdmin = false 
}: ChatProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatPresets, setChatPresets] = useState<string[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [session, setSession] = useState<boolean>(false);
  const { messageCount, dailyMessageCount, subscription, updateMessageCount } = useMessageUsage(isAdmin);
  const { toast } = useToast();
  const navigate = useNavigate();

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

    if (subscription?.plan_type === 'Business Pro' || isAdmin) {
      loadChatPresets();
    }
  }, [subscription, isAdmin]);

  const handleSendMessage = async (content: string) => {
    if (!session) {
      navigate('/auth');
      return;
    }

    try {
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

  return (
    <div className="flex flex-col h-full">
      {subscription && !isAdmin && <TrialBanner subscription={subscription} />}
      <MessageList messages={messages} />
      
      {!isAdmin && messageCount < INITIAL_FREE_MESSAGES && !subscription && (
        <div className="px-4 py-2 bg-emerald-900/20 text-emerald-50 text-sm border-t border-emerald-800/30">
          <span className="font-medium">{INITIAL_FREE_MESSAGES - messageCount}</span> initial free messages remaining
        </div>
      )}
      
      {!isAdmin && messageCount >= INITIAL_FREE_MESSAGES && !subscription && (
        <div className="px-4 py-2 bg-emerald-900/20 text-emerald-50 text-sm border-t border-emerald-800/30">
          <span className="font-medium">{DAILY_FREE_MESSAGES - dailyMessageCount}</span> free messages remaining today
        </div>
      )}
      
      {!isAdmin && subscription && (
        <div className="px-4 py-2 bg-emerald-900/20 text-emerald-50 text-sm border-t border-emerald-800/30">
          <span className="font-medium">{DAILY_SUBSCRIPTION_LIMIT - dailyMessageCount}</span> messages remaining today
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
    </div>
  );
};

