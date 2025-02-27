
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
        
        // Get the current content, preferring updatedContent if it exists
        const currentContent = updatedContent || content;
        console.log('Current content before update:', currentContent);
        
        // Ensure we have content to append to
        const baseContent = currentContent || '';
        
        // Append the new citation with proper spacing
        const newContent = baseContent + event.data.content;
        console.log('New content after update:', newContent);
        
        // Update the document with the combined content
        onUpdate(newContent);
        onPreviewUpdate();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [content, updatedContent, onUpdate, onPreviewUpdate]);
};
