
import { ScrollArea } from '@/components/ui/scroll-area';
import { forwardRef, memo, CSSProperties } from 'react';

interface DocumentPreviewProps {
  content: string;
  style?: CSSProperties;
}

const DocumentPreviewComponent = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ content, style }, ref) => {
    if (!content) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          No content available
        </div>
      );
    }

    return (
      <div className="document-preview h-full" ref={ref}>
        <ScrollArea className="h-[calc(100vh-2rem)]">
          <div className="prose max-w-none">
            {content.split('\n').map((paragraph, index) => (
              paragraph ? (
                <p 
                  key={`${index}-${paragraph.substring(0, 10)}`} 
                  className="mb-4 text-emerald-50 whitespace-pre-wrap"
                  style={style}
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

