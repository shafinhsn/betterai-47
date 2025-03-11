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
        
        // Always use the most recent document state
        const currentContent = updatedContent || content;
        console.log('Current document state before modification:', currentContent);
        
        let documentModified = false;
        let newContent = currentContent;
        
        // Check if we should replace only part of the document
        if (event.data.operation === 'replace_part' && event.data.range) {
          const { start, end } = event.data.range;
          const beforePart = currentContent.substring(0, start);
          const afterPart = currentContent.substring(end);
          newContent = beforePart + event.data.content + afterPart;
          documentModified = true;
        } 
        // Handle adding content after specific words
        else if (event.data.operation === 'add_after_word' && event.data.word) {
          const wordToFind = event.data.word;
          const wordIndex = currentContent.indexOf(wordToFind);
          
          if (wordIndex !== -1) {
            const insertPosition = wordIndex + wordToFind.length;
            const beforePart = currentContent.substring(0, insertPosition);
            const afterPart = currentContent.substring(insertPosition);
            newContent = beforePart + event.data.content + afterPart;
            documentModified = true;
          }
        }
        // Handle keeping only specific content
        else if (event.data.operation === 'keep_only') {
          if (event.data.what === 'first_word') {
            const words = currentContent.trim().split(/\s+/);
            if (words.length > 0) {
              newContent = words[0];
              documentModified = true;
            }
          } else if (event.data.contentToKeep) {
            newContent = event.data.contentToKeep;
            documentModified = true;
          }
        }
        // Handle paragraph replacements
        else if (event.data.operation === 'replace_paragraph' && event.data.paragraphIndex !== undefined) {
          const paragraphs = currentContent.split('\n\n');
          if (event.data.paragraphIndex < paragraphs.length) {
            paragraphs[event.data.paragraphIndex] = event.data.content;
            newContent = paragraphs.join('\n\n');
            documentModified = true;
          }
        }
        // Handle adding citations
        else if (event.data.operation === 'add_citation') {
          const formattedCitation = event.data.content.trim();
          newContent = currentContent.trim() + '\n\n' + formattedCitation + '\n';
          documentModified = true;
        }
        // Handle random content additions
        else if (event.data.operation === 'add_random') {
          const randomContent = event.data.content || 'Random content';
          newContent = currentContent.trim() + '\n\n' + randomContent;
          documentModified = true;
        }
        // Handle full document operations
        else {
          if (event.data.operation === 'append') {
            newContent = currentContent.trim() + '\n\n' + event.data.content.trim();
            documentModified = true;
          } else if (event.data.operation === 'prepend') {
            newContent = event.data.content.trim() + '\n\n' + currentContent.trim();
            documentModified = true;
          } else {
            // Full replacement or modification
            newContent = event.data.content;
            documentModified = true;
          }
        }
        
        // Only update if changes were made
        if (documentModified) {
          console.log('Updated document state:', newContent);
          onUpdate(newContent);
          onPreviewUpdate();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [content, updatedContent, onUpdate, onPreviewUpdate]);
};
