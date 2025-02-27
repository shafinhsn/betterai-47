
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
        console.log('Current content:', content);
        console.log('Current updatedContent:', updatedContent);
        
        // Use the most recent content as the base
        const baseContent = updatedContent || content;
        
        // Ensure we're adding the citation on a new line
        const newContent = baseContent + (baseContent.endsWith('\n\n') ? '' : '\n\n') + event.data.content;
        
        console.log('New content will be:', newContent);
        onUpdate(newContent);
        onPreviewUpdate();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [content, updatedContent, onUpdate, onPreviewUpdate]);
};
