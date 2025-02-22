
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, memo } from 'react';

interface DocumentPreviewProps {
  content: string;
}

export const DocumentPreview = memo(({ content }: DocumentPreviewProps) => {
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
    <div className="document-preview h-full" ref={scrollRef}>
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
});

DocumentPreview.displayName = 'DocumentPreview';
