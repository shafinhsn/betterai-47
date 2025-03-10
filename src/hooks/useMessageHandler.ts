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
        
        // Get the current document content - always use most recent state
        const currentContent = updatedContent || content || '';
        
        // Track if we've made changes to send preview update only when needed
        let documentModified = false;
        
        // Check if we should replace only part of the document
        if (event.data.operation === 'replace_part' && event.data.range) {
          const { start, end } = event.data.range;
          const beforePart = currentContent.substring(0, start);
          const afterPart = currentContent.substring(end);
          const newContent = beforePart + event.data.content + afterPart;
          
          console.log('Partial document update applied');
          onUpdate(newContent);
          documentModified = true;
        } 
        // Handle specific word operations (like adding after a specific word)
        else if (event.data.operation === 'add_after_word' && event.data.word) {
          const wordToFind = event.data.word;
          const wordIndex = currentContent.indexOf(wordToFind);
          
          if (wordIndex !== -1) {
            const insertPosition = wordIndex + wordToFind.length;
            const beforePart = currentContent.substring(0, insertPosition);
            const afterPart = currentContent.substring(insertPosition);
            const newContent = beforePart + event.data.content + afterPart;
            
            console.log(`Added content after word "${wordToFind}"`);
            onUpdate(newContent);
            documentModified = true;
          }
        }
        // Check if we should keep only specific content (like first word)
        else if (event.data.operation === 'keep_only') {
          if (event.data.what === 'first_word') {
            const words = currentContent.trim().split(/\s+/);
            if (words.length > 0) {
              const newContent = words[0];
              console.log('Keeping only first word:', newContent);
              onUpdate(newContent);
              documentModified = true;
            }
          } else if (event.data.contentToKeep) {
            const newContent = event.data.contentToKeep;
            console.log('Keeping only specified content:', newContent);
            onUpdate(newContent);
            documentModified = true;
          }
        }
        // Check if we should replace just one paragraph or sentence
        else if (event.data.operation === 'replace_paragraph' && event.data.paragraphIndex !== undefined) {
          const paragraphs = currentContent.split('\n\n');
          if (event.data.paragraphIndex < paragraphs.length) {
            paragraphs[event.data.paragraphIndex] = event.data.content;
            const newContent = paragraphs.join('\n\n');
            
            console.log('Paragraph replacement applied');
            onUpdate(newContent);
            documentModified = true;
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
          documentModified = true;
        }
        // Add random content to the document
        else if (event.data.operation === 'add_random') {
          const randomContent = event.data.content || 'Random content';
          const newContent = currentContent.trim() + '\n\n' + randomContent;
          
          console.log('Random content added to document');
          onUpdate(newContent);
          documentModified = true;
        }
        // Default case: full replacement or append
        else {
          if (event.data.operation === 'append') {
            const newContent = currentContent.trim() + '\n\n' + event.data.content.trim();
            console.log('Content appended to document');
            onUpdate(newContent);
            documentModified = true;
          } else if (event.data.operation === 'prepend') {
            const newContent = event.data.content.trim() + '\n\n' + currentContent.trim();
            console.log('Content prepended to document');
            onUpdate(newContent);
            documentModified = true;
          } else {
            // Full replacement (when no specific operation is specified)
            console.log('Full document replacement applied');
            onUpdate(event.data.content);
            documentModified = true;
          }
        }
        
        // Only trigger preview update if we actually modified the document
        if (documentModified) {
          onPreviewUpdate();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [content, updatedContent, onUpdate, onPreviewUpdate]);
};
