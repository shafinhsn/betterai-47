
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
        
        // Get the current content
        const baseContent = updatedContent || content;
        console.log('Current document content:', baseContent);
        
        // Add the new citation with proper spacing
        const newContent = baseContent + (baseContent.endsWith('\n\n') ? '' : '\n\n') + event.data.content.trim();
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

