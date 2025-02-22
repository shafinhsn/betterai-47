
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

interface DocumentPreviewProps {
  content: string;
}

export const DocumentPreview = ({ content }: DocumentPreviewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [content]);

  // Try to decode the content if it appears to be a hex string
  const getDecodedContent = (str: string) => {
    try {
      // Check if the string looks like hex (pairs of hex characters)
      if (/^[0-9A-Fa-f\s]+$/.test(str)) {
        // Convert hex to string
        const bytes = str.split(/\s+/).map(byte => parseInt(byte, 16));
        return new TextDecoder().decode(new Uint8Array(bytes));
      }
      return str;
    } catch (error) {
      console.error('Error decoding content:', error);
      return str;
    }
  };

  const decodedContent = getDecodedContent(content);

  return (
    <div className="document-preview h-full" ref={scrollRef}>
      <ScrollArea className="h-[calc(100vh-2rem)]">
        <div className="prose max-w-none">
          {decodedContent.split('\n').map((paragraph, index) => (
            paragraph ? (
              <p key={index} className="mb-4 text-emerald-50">
                {paragraph}
              </p>
            ) : <br key={index} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
