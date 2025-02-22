
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, forwardRef, memo } from 'react';

interface DocumentPreviewProps {
  content: string;
}

const DocumentPreviewComponent = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ content }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }, [content]);

    if (!content) {
      return null;
    }

    return (
      <div className="document-preview h-full" ref={ref}>
        <ScrollArea className="h-[calc(100vh-2rem)]">
          <div className="prose max-w-none">
            {content.split('\n').map((paragraph, index) => (
              paragraph ? (
                <p key={`${index}-${paragraph.substring(0, 10)}`} className="mb-4 text-emerald-50 whitespace-pre-wrap">
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

