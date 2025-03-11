
import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { useMessageUsage } from '@/hooks/use-message-usage';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { TrialBanner } from './TrialBanner';
import { useChatActions } from '@/hooks/useChatActions';
import type { ChatProps } from '@/types/chat';
import { 
  INITIAL_FREE_MESSAGES, 
  DAILY_FREE_MESSAGES, 
  DAILY_SUBSCRIPTION_LIMIT 
} from '@/constants/subscription';

export const ChatContainer = ({ 
  onSendMessage, 
  messages, 
  documentContent, 
  onDocumentUpdate,
  isAdmin = false 
}: ChatProps) => {
  const [input, setInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const { messageCount, dailyMessageCount, subscription } = useMessageUsage(isAdmin);
  const { session, chatPresets, navigate } = useChat(isAdmin);
  
  const { 
    isLoading, 
    handleSendMessage, 
    handleRestoreDocument 
  } = useChatActions(onSendMessage, documentContent, onDocumentUpdate, isAdmin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (!session) {
      navigate('/auth');
      return;
    }
    
    handleSendMessage(input, selectedPreset);
    setInput('');
    setSelectedPreset('');
  };

  // Message limits UI logic
  const renderMessageLimits = () => {
    if (isAdmin) return null;
    
    if (messageCount < INITIAL_FREE_MESSAGES && !subscription) {
      return (
        <div className="px-4 py-2 bg-emerald-900/20 text-emerald-50 text-sm border-t border-emerald-800/30">
          <span className="font-medium">{INITIAL_FREE_MESSAGES - messageCount}</span> initial free messages remaining
        </div>
      );
    }
    
    if (messageCount >= INITIAL_FREE_MESSAGES && !subscription) {
      return (
        <div className="px-4 py-2 bg-emerald-900/20 text-emerald-50 text-sm border-t border-emerald-800/30">
          <span className="font-medium">{DAILY_FREE_MESSAGES - dailyMessageCount}</span> free messages remaining today
        </div>
      );
    }
    
    if (subscription) {
      return (
        <div className="px-4 py-2 bg-emerald-900/20 text-emerald-50 text-sm border-t border-emerald-800/30">
          <span className="font-medium">{DAILY_SUBSCRIPTION_LIMIT - dailyMessageCount}</span> messages remaining today
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {subscription && !isAdmin && <TrialBanner subscription={subscription} />}
      <MessageList 
        messages={messages} 
        onRestoreDocument={handleRestoreDocument}
      />
      
      {renderMessageLimits()}
      
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
