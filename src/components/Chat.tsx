
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
      
      // Get the current document content - this is crucial for maintaining state
      const currentDocumentContent = documentContent || '';
      
      console.log('Sending message with current document content:', currentDocumentContent.substring(0, 100));
      
      // Check if document exists in Supabase and update or create it
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save documents",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      const { data: existingDocument } = await supabase
        .from('documents')
        .select('id, content, versions, current_version')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      let documentId = null;
      
      // If document exists, update its versions array
      if (existingDocument) {
        documentId = existingDocument.id;
        
        // Only add to versions if the content has changed
        if (existingDocument.content !== currentDocumentContent) {
          const newVersion = existingDocument.current_version + 1;
          const updatedVersions = [
            ...(existingDocument.versions || []),
            { version: newVersion, content: existingDocument.content, timestamp: new Date().toISOString() }
          ];
          
          await supabase
            .from('documents')
            .update({ 
              content: currentDocumentContent, 
              versions: updatedVersions,
              current_version: newVersion,
              updated_at: new Date().toISOString()
            })
            .eq('id', documentId);
        }
      } else if (currentDocumentContent) {
        // Create new document if it doesn't exist
        const { data: newDocument } = await supabase
          .from('documents')
          .insert([{ 
            content: currentDocumentContent, 
            content_type: 'text/plain',
            file_path: 'document.txt',
            filename: 'document.txt',
            user_id: userId,
            versions: [],
            current_version: 0
          }])
          .select()
          .single();
          
        if (newDocument) {
          documentId = newDocument.id;
        }
      }
      
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: content,
          context: currentDocumentContent,
          preset: selectedPreset,
          requestType: requestType,
          requestDetails: {
            originalContent: documentContent,
            operation: operationType,
            targetInfo: extractTargetInfo(content, currentDocumentContent),
            documentId: documentId
          }
        },
      });

      if (error) {
        console.error('Chat function error:', error);
        onSendMessage("I'm sorry, but I encountered an error while processing your request.", 'ai');
        return;
      }

      if (data?.updatedDocument) {
        console.log('Received updated document from AI:', data.updatedDocument.substring(0, 100));
        
        // Update document in Supabase with new content
        if (documentId) {
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (!sessionData.session) {
            console.error("No session found when updating document");
            toast({
              title: "Authentication Error",
              description: "You must be logged in to save documents",
              variant: "destructive"
            });
          } else {
            const { data: documentData } = await supabase
              .from('documents')
              .select('versions, current_version')
              .eq('id', documentId)
              .single();
              
            if (documentData) {
              const newVersion = documentData.current_version + 1;
              const updatedVersions = [
                ...(documentData.versions || []),
                { 
                  version: newVersion, 
                  content: currentDocumentContent, 
                  timestamp: new Date().toISOString(),
                  requestType,
                  operation: operationType
                }
              ];
              
              await supabase
                .from('documents')
                .update({ 
                  content: data.updatedDocument, 
                  versions: updatedVersions,
                  current_version: newVersion,
                  updated_at: new Date().toISOString()
                })
                .eq('id', documentId);
            }
          }
        }
        
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
      // Ensure loading state is always reset
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

  const handleRestoreDocument = async (documentState: string) => {
    console.log('Restoring document to the AI-generated content:', documentState.substring(0, 100));
    
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session && documentState) {
      try {
        // Get the latest document record
        const { data: existingDocument } = await supabase
          .from('documents')
          .select('id, versions, current_version')
          .eq('user_id', sessionData.session.user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
          
        if (existingDocument) {
          const newVersion = existingDocument.current_version + 1;
          const updatedVersions = [
            ...(existingDocument.versions || []),
            { 
              version: newVersion, 
              content: documentContent || '', 
              timestamp: new Date().toISOString(),
              operation: 'restore'
            }
          ];
          
          // Update the document with the restored state
          await supabase
            .from('documents')
            .update({ 
              content: documentState, 
              versions: updatedVersions,
              current_version: newVersion,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingDocument.id);
        }
      } catch (error) {
        console.error('Error saving document history:', error);
      }
    }
    
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
