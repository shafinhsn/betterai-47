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
        
        // If we have explicit new content, use it directly
        if (event.data.updatedDocument) {
          console.log('Applying new document content:', event.data.updatedDocument);
          onUpdate(event.data.updatedDocument);
          onPreviewUpdate();
          return;
        }
        
        // Otherwise, append the response to the existing content
        const baseContent = updatedContent || content;
        const newContent = baseContent + (baseContent.endsWith('\n\n') ? '' : '\n\n') + event.data.content;
        
        console.log('Appending content:', newContent);
        onUpdate(newContent);
        onPreviewUpdate();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [content, updatedContent, onUpdate, onPreviewUpdate]);
};
