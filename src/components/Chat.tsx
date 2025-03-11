
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useMessageUsage } from '@/hooks/use-message-usage';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './chat/MessageList';
import { ChatInput } from './chat/ChatInput';
import { TrialBanner } from './chat/TrialBanner';
import { 
  determineRequestType, 
  extractOperationType, 
  extractTargetInfo, 
  requestTypeToMessage 
} from '@/utils/chatRequestUtils';
import type { ChatProps } from '@/types/chat';
import { 
  INITIAL_FREE_MESSAGES, 
  DAILY_FREE_MESSAGES, 
  DAILY_SUBSCRIPTION_LIMIT 
} from '@/constants/subscription';

export const Chat = ({ 
  onSendMessage, 
  messages, 
  documentContent, 
  onDocumentUpdate,
  isAdmin = false 
}: ChatProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const { messageCount, dailyMessageCount, subscription, updateMessageCount } = useMessageUsage(isAdmin);
  const { session, chatPresets, navigate } = useChat(isAdmin);
  const { toast } = useToast();

  const handleSendMessage = async (content: string) => {
    if (!session) {
      navigate('/auth');
      return;
    }

    try {
      setIsLoading(true);
      
      // Add user message to chat
      onSendMessage(content, 'user');
      
      // Determine request types and details
      const requestType = determineRequestType(content);
      const operationType = extractOperationType(content);
      
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: content,
          context: documentContent || '',
          preset: selectedPreset,
          requestType: requestType,
          requestDetails: {
            originalContent: documentContent,
            operation: operationType,
            targetInfo: extractTargetInfo(content, documentContent || '')
          }
        },
      });

      if (error) {
        console.error('Chat function error:', error);
        onSendMessage("I'm sorry, but I encountered an error while processing your request.", 'ai');
        return;
      }

      if (data?.updatedDocument) {
        console.log('Received updated document from AI:', data.updatedDocument);
        onDocumentUpdate(data.updatedDocument);
        
        toast({
          title: "Document Updated",
          description: requestTypeToMessage(requestType),
        });
      }

      if (data?.reply) {
        onSendMessage(
          data.reply, 
          'ai',
          data?.updatedDocument ? data.updatedDocument : undefined
        );
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

  const handleRestoreDocument = (documentState: string) => {
    console.log('Restoring document to the AI-generated content:', documentState);
    if (onDocumentUpdate) {
      onDocumentUpdate(documentState);
      toast({
        title: "Document Restored",
        description: "The document has been restored to the AI-generated content.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {subscription && !isAdmin && <TrialBanner subscription={subscription} />}
      <MessageList 
        messages={messages} 
        onRestoreDocument={handleRestoreDocument}
      />
      
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
