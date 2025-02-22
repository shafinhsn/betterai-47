
import { ScrollArea } from '@/components/ui/scroll-area';
import { forwardRef, memo, useMemo, CSSProperties } from 'react';
import * as DiffMatchPatch from 'diff-match-patch';

interface DocumentPreviewProps {
  content: string;
  isUpdated?: boolean;
  originalContent?: string;
  style?: CSSProperties;
}

const DocumentPreviewComponent = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ content, isUpdated = false, originalContent, style }, ref) => {
    console.log('DocumentPreview rendering with:', { content, isUpdated, originalContent });

    const diffs = useMemo(() => {
      if (!isUpdated || !originalContent) return null;

      const dmp = new DiffMatchPatch.diff_match_patch();
      return dmp.diff_main(originalContent, content);
    }, [content, originalContent, isUpdated]);

    if (!content) {
      console.log('No content to render');
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          No content available
        </div>
      );
    }

    const renderContent = () => {
      if (!isUpdated || !diffs) {
        return content.split('\n').map((paragraph, index) => (
          paragraph ? (
            <p 
              key={`${index}-${paragraph.substring(0, 10)}`} 
              className="mb-4 text-emerald-50 whitespace-pre-wrap"
              style={style}
            >
              {paragraph}
            </p>
          ) : <br key={index} />
        ));
      }

      return diffs.map((diff, index) => {
        const [type, text] = diff;
        let className = "mb-4 whitespace-pre-wrap ";
        
        switch (type) {
          case 1: // Insertion
            className += "bg-emerald-900/50 text-emerald-200";
            break;
          case -1: // Deletion
            className += "bg-red-900/50 text-red-200 line-through opacity-50";
            break;
          default: // No change
            className += "text-emerald-50";
        }

        return text ? (
          <p 
            key={`${index}-${text.substring(0, 10)}`}
            className={className}
            style={style}
          >
            {text}
          </p>
        ) : null;
      }).filter(Boolean);
    };

    return (
      <div className="document-preview h-full" ref={ref}>
        <ScrollArea className="h-[calc(100vh-2rem)]">
          <div className="prose max-w-none">
            {renderContent()}
          </div>
        </ScrollArea>
      </div>
    );
  }
);

DocumentPreviewComponent.displayName = 'DocumentPreview';

export const DocumentPreview = memo(DocumentPreviewComponent);
