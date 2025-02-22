
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
      return null;
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

      const elements: JSX.Element[] = [];
      let currentParagraph = "";
      let paragraphClass = "";

      diffs.forEach((diff, index) => {
        const [type, text] = diff;
        const lines = text.split('\n');

        lines.forEach((line, lineIndex) => {
          let className = "whitespace-pre-wrap ";
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

          if (line) {
            currentParagraph += line;
            paragraphClass = className;
          }

          if (lineIndex < lines.length - 1 || index === diffs.length - 1) {
            if (currentParagraph) {
              elements.push(
                <p 
                  key={`${index}-${lineIndex}-${currentParagraph.substring(0, 10)}`}
                  className={`mb-4 ${paragraphClass}`}
                  style={style}
                >
                  {currentParagraph}
                </p>
              );
              currentParagraph = "";
            }
            if (!line) {
              elements.push(<br key={`${index}-${lineIndex}-br`} />);
            }
          }
        });
      });

      return elements;
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

