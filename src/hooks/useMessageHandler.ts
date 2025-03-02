
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
        
        // Check if we should replace only part of the document
        if (event.data.operation === 'replace_part' && event.data.range) {
          const { start, end } = event.data.range;
          const beforePart = currentContent.substring(0, start);
          const afterPart = currentContent.substring(end);
          const newContent = beforePart + event.data.content + afterPart;
          
          console.log('Partial document update applied');
          onUpdate(newContent);
        } 
        // Check if we should replace just one paragraph or sentence
        else if (event.data.operation === 'replace_paragraph' && event.data.paragraphIndex !== undefined) {
          const paragraphs = currentContent.split('\n\n');
          if (event.data.paragraphIndex < paragraphs.length) {
            paragraphs[event.data.paragraphIndex] = event.data.content;
            const newContent = paragraphs.join('\n\n');
            
            console.log('Paragraph replacement applied');
            onUpdate(newContent);
          }
        }
        // Add citation special case
        else if (event.data.operation === 'add_citation') {
          // Format the new citation with proper spacing
          const formattedCitation = event.data.content.trim();
          
          // Combine the current content with the new citation
          const newContent = currentContent.trim() + '\n\n' + formattedCitation + '\n';
          
          console.log('Citation added to document');
          onUpdate(newContent);
        }
        // Default case: full replacement or append
        else {
          if (event.data.operation === 'append') {
            const newContent = currentContent.trim() + '\n\n' + event.data.content.trim();
            console.log('Content appended to document');
            onUpdate(newContent);
          } else {
            // Full replacement (when no specific operation is specified)
            console.log('Full document replacement applied');
            onUpdate(event.data.content);
          }
        }
        
        onPreviewUpdate();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [content, updatedContent, onUpdate, onPreviewUpdate]);
};
