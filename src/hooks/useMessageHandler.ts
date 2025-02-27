
import { useEffect } from 'react';

type MessageHandlerProps = {
  content: string;
  updatedContent: string;
  onUpdate: (content: string) => void;
  onPreviewUpdate: () => void;
};

export const useMessageHandler = ({
  content,
  updatedContent,
  onUpdate,
  onPreviewUpdate,
}: MessageHandlerProps) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_DOCUMENT') {
        console.log('Received UPDATE_DOCUMENT message:', event.data);
        
        // Get the current document content
        const currentContent = updatedContent || content || '';
        console.log('Current document content:', currentContent);
        
        // Format the new citation with proper spacing
        const formattedCitation = event.data.content.trim();
        console.log('Citation to be added:', formattedCitation);
        
        // Combine the current content with the new citation
        // Make sure there's a line break before and after the citation
        const newContent = currentContent.trim() + '\n\n' + formattedCitation + '\n';
        console.log('Updated document content:', newContent);
        
        // Update the document
        onUpdate(newContent);
        onPreviewUpdate();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [content, updatedContent, onUpdate, onPreviewUpdate]);
};
