
import { ScrollArea } from '@/components/ui/scroll-area';
import { forwardRef, memo, useMemo } from 'react';
import * as DiffMatchPatch from 'diff-match-patch';

interface DocumentPreviewProps {
  content: string;
  isUpdated?: boolean;
  originalContent?: string;
}

const DocumentPreviewComponent = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ content, isUpdated = false, originalContent }, ref) => {
    const diffs = useMemo(() => {
      if (!isUpdated || !originalContent) return null;

      const dmp = new DiffMatchPatch.diff_match_patch();
      return dmp.diff_main(originalContent, content);
    }, [content, originalContent, isUpdated]);

    if (!content) {
      return null;
    }

    const renderContent = () => {
      if (!isUpdated || !diffs) {
        return content.split('\n').map((paragraph, index) => (
          paragraph ? (
            <p 
              key={`${index}-${paragraph.substring(0, 10)}`} 
              className="mb-4 text-emerald-50 whitespace-pre-wrap"
            >
              {paragraph}
            </p>
          ) : <br key={index} />
        ));
      }

      return diffs.map((diff, index) => {
        const [type, text] = diff;
        const key = `${index}-${text.substring(0, 10)}`;

        let className = "whitespace-pre-wrap ";
        switch (type) {
          case 1: // Insertion
            className += "bg-emerald-900/50 text-emerald-200";
            break;
          case -1: // Deletion
            className += "bg-red-900/50 text-red-200 line-through";
            break;
          default: // No change
            className += "text-emerald-50";
        }

        return text.split('\n').map((line, lineIndex) => (
          line ? (
            <p 
              key={`${key}-${lineIndex}`} 
              className={`mb-4 ${className}`}
            >
              {line}
            </p>
          ) : <br key={`${key}-${lineIndex}`} />
        ));
      });
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
