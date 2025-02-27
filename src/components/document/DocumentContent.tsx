
import { ScrollArea } from '@/components/ui/scroll-area';
import { CSSProperties } from 'react';

interface DocumentContentProps {
  content: string;
  isEditing: boolean;
  editedContent: string;
  format: 'none' | 'mla' | 'apa';
  style?: CSSProperties;
  fontFamily: string;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
  onEditedContentChange: (content: string) => void;
}

export const DocumentContent = ({
  content,
  isEditing,
  editedContent,
  format,
  style,
  fontFamily,
  fontSize,
  alignment,
  onEditedContentChange,
}: DocumentContentProps) => {
  const commonStyles = {
    ...style,
    fontFamily: format === 'mla' || format === 'apa' ? 'Times New Roman' : fontFamily,
    fontSize: format === 'mla' || format === 'apa' ? '12px' : `${fontSize}px`,
    lineHeight: format === 'mla' || format === 'apa' ? '2' : '1.5',
    textAlign: alignment,
  };

  // Display content with proper paragraph handling
  const displayContent = (baseContent: string) => {
    if (!baseContent) return null;
    
    const paragraphs = baseContent.split('\n');
    
    return paragraphs.map((paragraph, index) => (
      <p 
        key={`${index}-${paragraph.substring(0, 10)}`} 
        className="mb-4 text-emerald-50 whitespace-pre-wrap"
        style={commonStyles}
      >
        {paragraph}
      </p>
    ));
  };

  // Always use the most recent content as the base for comparisons
  const baseContent = editedContent || content;

  return (
    <ScrollArea className="h-[calc(100vh-10rem)] overflow-y-auto">
      {isEditing ? (
        <div className="p-4">
          <textarea
            value={editedContent}
            onChange={(e) => onEditedContentChange(e.target.value)}
            className="w-full h-full min-h-[calc(100vh-12rem)] bg-transparent text-emerald-50 border border-emerald-800/30 rounded-md p-4 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            style={commonStyles}
          />
        </div>
      ) : (
        <div className="prose max-w-none p-4 pb-24">
          {displayContent(baseContent)}
        </div>
      )}
    </ScrollArea>
  );
};
