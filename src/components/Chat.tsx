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
      
      // Store the current document state before processing
      const currentState = documentContent;
      
      // Add user message to chat
      onSendMessage(content, 'user');
      
      // Determine the request type for better handling
      const requestType = determineRequestType(content);
      const operationType = extractOperationType(content);
      
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: content,
          context: documentContent || '',
          preset: selectedPreset,
          requestType: requestType,
          // Add additional context about the request
          requestDetails: {
            originalContent: documentContent,
            operation: operationType,
            // Add specific targeting information based on the request
            targetInfo: extractTargetInfo(content, documentContent || '')
          }
        },
      });

      if (error) {
        console.error('Chat function error:', error);
        onSendMessage("I'm sorry, but I encountered an error while processing your request.", 'ai');
        return;
      }

      // If we have document updates, apply them intelligently based on request type
      if (data?.updatedDocument) {
        console.log('Received updated document from AI:', data.updatedDocument);
        
        // Store document state for restoration
        const updatedState = data.updatedDocument;
        
        // Update the document while preserving formatting
        onDocumentUpdate(data.updatedDocument);
        
        toast({
          title: "Document Updated",
          description: requestTypeToMessage(requestType),
        });
      }

      // Then show the explanation in chat
      if (data?.reply) {
        // Store the actual updated document with the message
        onSendMessage(
          data.reply, 
          'ai',
          // Store the updated content that the user would want to restore
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

  const determineRequestType = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('delete') || lowerInput.includes('remove')) {
      return 'document_remove';
    } else if (lowerInput.includes('keep only') || lowerInput.includes('retain only')) {
      return 'document_filter';
    } else if (lowerInput.includes('add') || lowerInput.includes('write') || lowerInput.includes('insert')) {
      return 'document_add';
    } else if (lowerInput.includes('rewrite') || lowerInput.includes('change')) {
      return 'document_rewrite';
    } else if (lowerInput.includes('format') || lowerInput.includes('mla') || lowerInput.includes('apa')) {
      return 'document_format';
    } else if (lowerInput.includes('summarize') || lowerInput.includes('summary')) {
      return 'document_summarize';
    } else if (lowerInput.includes('modify')) {
      return 'document_modify';
    } else {
      return 'chat';
    }
  };
  
  const extractOperationType = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('first word') || lowerInput.includes('only the first word')) {
      return 'keep_first_word';
    } else if (lowerInput.includes('after') && lowerInput.includes('word')) {
      return 'add_after_word';
    } else if (lowerInput.includes('paragraph')) {
      return 'paragraph_operation';
    } else if (lowerInput.includes('sentence')) {
      return 'sentence_operation';
    } else if (lowerInput.includes('first') || lowerInput.includes('beginning')) {
      return 'begin_operation';
    } else if (lowerInput.includes('last') || lowerInput.includes('end')) {
      return 'end_operation';
    } else if (lowerInput.includes('randomly') || lowerInput.includes('random')) {
      return 'random_operation';
    } else {
      return 'full_document';
    }
  };
  
  const extractTargetInfo = (input: string, documentContent: string): any => {
    const lowerInput = input.toLowerCase();
    const targetInfo: any = {};
    
    // Extract word to add content after
    if (lowerInput.includes('after')) {
      const afterMatch = lowerInput.match(/after\s+(?:the\s+)?(?:word\s+)?["']?(\w+)["']?/i);
      if (afterMatch && afterMatch[1]) {
        targetInfo.afterWord = afterMatch[1];
      }
    }
    
    // Extract content to keep
    if (lowerInput.includes('keep') || lowerInput.includes('retain')) {
      if (lowerInput.includes('first word')) {
        targetInfo.keepType = 'first_word';
      }
    }
    
    // Random word generation
    if (lowerInput.includes('random') && (lowerInput.includes('word') || lowerInput.includes('words'))) {
      targetInfo.randomType = 'words';
      
      // Try to extract number of words
      const numMatch = lowerInput.match(/(\d+)\s+(?:random\s+)?words?/i);
      if (numMatch && numMatch[1]) {
        targetInfo.wordCount = parseInt(numMatch[1], 10);
      } else {
        targetInfo.wordCount = 2; // Default to 2 words if not specified
      }
    }
    
    return targetInfo;
  };
  
  const requestTypeToMessage = (requestType: string): string => {
    switch (requestType) {
      case 'document_rewrite':
        return "Your document has been rewritten as requested.";
      case 'document_format':
        return "Your document has been reformatted.";
      case 'document_filter':
        return "Your document has been filtered to the specified content.";
      case 'document_summarize':
        return "Your document has been summarized.";
      case 'document_add':
        return "Content has been added to your document.";
      case 'document_remove':
        return "Content has been removed from your document.";
      case 'document_modify':
        return "Your document has been modified as requested.";
      default:
        return "The document has been modified based on your request.";
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


