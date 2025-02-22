
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, forwardRef, memo } from 'react';

interface DocumentPreviewProps {
  content: string;
  isUpdated?: boolean;
}

const DocumentPreviewComponent = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ content, isUpdated = false }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingRef = useRef<string>('');
    const intervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
      // Reset scroll position when content changes
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // If there's no content, reset everything
      if (!content) {
        typingRef.current = '';
        return;
      }

      // For non-updated content, display it immediately
      if (!isUpdated) {
        typingRef.current = content;
        return;
      }

      // For updated content, animate it
      typingRef.current = '';
      let currentIndex = 0;
      
      intervalRef.current = setInterval(() => {
        if (currentIndex <= content.length) {
          typingRef.current = content.slice(0, currentIndex);
          // Force re-render
          scrollRef.current?.setAttribute('data-content', typingRef.current);
          currentIndex++;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }, 20);

      // Cleanup
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [content, isUpdated]);

    if (!content) {
      return null;
    }

    const displayContent = isUpdated ? typingRef.current : content;

    return (
      <div className="document-preview h-full" ref={ref}>
        <ScrollArea className="h-[calc(100vh-2rem)]">
          <div className="prose max-w-none" ref={scrollRef}>
            {displayContent.split('\n').map((paragraph, index) => (
              paragraph ? (
                <p 
                  key={`${index}-${paragraph.substring(0, 10)}`} 
                  className={`mb-4 text-emerald-50 whitespace-pre-wrap ${
                    isUpdated && typingRef.current !== content ? 'border-r-2 border-emerald-400 animate-pulse' : ''
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
