
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
    fontFamily,
    fontSize: `${fontSize}px`,
    lineHeight: format === 'mla' || format === 'apa' ? '2' : '1.5',
    textAlign: alignment,
  };

  return (
    <ScrollArea className="h-[calc(100vh-6rem)]">
      {isEditing ? (
        <div className="p-4">
          <textarea
            value={editedContent}
            onChange={(e) => onEditedContentChange(e.target.value)}
            className="w-full h-full min-h-[500px] bg-transparent text-emerald-50 border border-emerald-800/30 rounded-md p-4 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            style={commonStyles}
          />
        </div>
      ) : (
        <div className="prose max-w-none p-4">
          {content.split('\n').map((paragraph, index) => (
            paragraph ? (
              <p 
                key={`${index}-${paragraph.substring(0, 10)}`} 
                className="mb-4 text-emerald-50 whitespace-pre-wrap"
                style={commonStyles}
              >
                {paragraph}
              </p>
            ) : <br key={index} />
          ))}
        </div>
      )}
    </ScrollArea>
  );
};
