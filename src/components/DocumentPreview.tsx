
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, forwardRef, memo, useState } from 'react';

interface DocumentPreviewProps {
  content: string;
}

const DocumentPreviewComponent = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ content }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [displayedContent, setDisplayedContent] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }, [content]);

    useEffect(() => {
      if (!content) {
        setDisplayedContent('');
        return;
      }

      setIsTyping(true);
      let currentIndex = 0;
      const contentLength = content.length;
      
      const typingInterval = setInterval(() => {
        if (currentIndex <= contentLength) {
          setDisplayedContent(content.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 20); // Adjust speed by changing this value (milliseconds)

      return () => clearInterval(typingInterval);
    }, [content]);

    if (!content) {
      return null;
    }

    return (
      <div className="document-preview h-full" ref={ref}>
        <ScrollArea className="h-[calc(100vh-2rem)]">
          <div className="prose max-w-none">
            {displayedContent.split('\n').map((paragraph, index) => (
              paragraph ? (
                <p 
                  key={`${index}-${paragraph.substring(0, 10)}`} 
                  className={`mb-4 text-emerald-50 whitespace-pre-wrap ${
                    isTyping ? 'border-r-2 border-emerald-400 animate-pulse' : ''
                  }`}
                >
                  {paragraph}
                </p>
              ) : <br key={index} />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }
);

DocumentPreviewComponent.displayName = 'DocumentPreview';

export const DocumentPreview = memo(DocumentPreviewComponent);
