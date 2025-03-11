
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useMessageUsage } from '@/hooks/use-message-usage';
import { 
  determineRequestType, 
  extractOperationType, 
  extractTargetInfo, 
  requestTypeToMessage 
} from '@/utils/chatRequestUtils';

export const useChatActions = (
  onSendMessage: (message: string, sender: 'user' | 'ai', documentState?: string) => void,
  documentContent: string | undefined,
  onDocumentUpdate: (updatedContent: string) => void,
  isAdmin: boolean = false
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { updateMessageCount } = useMessageUsage(isAdmin);
  const { toast } = useToast();

  const handleSendMessage = async (content: string, selectedPreset: string) => {
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

  return {
    isLoading,
    handleSendMessage,
    handleRestoreDocument
  };
};
