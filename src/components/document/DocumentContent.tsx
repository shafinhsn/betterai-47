
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

  // Display content with proper paragraph and formatting handling
  const displayContent = (baseContent: string) => {
    if (!baseContent) return null;
    
    const paragraphs = baseContent.split('\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if this is a centered title (Works Cited or References)
      const isCenteredTitle = paragraph.trim() === "Works Cited" || 
                             paragraph.trim() === "References" ||
                             paragraph.includes("                                Works Cited") ||
                             paragraph.includes("                                References");
      
      // Check if this paragraph should have a hanging indent (part of a citation)
      const hasHangingIndent = paragraph.length > 0 && 
                              (index > 0 && 
                              (paragraphs[index-1].includes("Works Cited") || 
                               paragraphs[index-1].includes("References") ||
                               paragraphs[index-1].trim().length > 50));
      
      const paragraphStyle = {
        ...commonStyles,
        textAlign: isCenteredTitle ? 'center' : commonStyles.textAlign,
        paddingLeft: hasHangingIndent ? '2em' : '0',
        textIndent: hasHangingIndent ? '-2em' : '0',
        fontWeight: isCenteredTitle ? 'bold' : 'normal',
      };
      
      return (
        <p 
          key={`${index}-${paragraph.substring(0, 10)}`} 
          className="mb-4 text-emerald-50 whitespace-pre-wrap"
          style={paragraphStyle}
        >
          {paragraph}
        </p>
      );
    });
  };

  // Always use the most recent content
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
