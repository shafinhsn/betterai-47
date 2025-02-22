
import { TextAlignment, FormatOption, CitationStyle, FontFamily } from '@/hooks/useTextEditor';
import { FontControls } from './controls/FontControls';
import { CitationControls } from './controls/CitationControls';
import { FormatControls } from './controls/FormatControls';
import { AlignmentControls } from './controls/AlignmentControls';

export interface TextEditorControlsProps {
  font: FontFamily;
  size: string;
  alignment: TextAlignment;
  format: FormatOption[];
  citationStyle: CitationStyle;
  isLoading?: boolean;
  onFormatChange: (value: FormatOption[]) => void;
  onFontChange: (value: FontFamily) => void;
  onSizeChange: (value: string) => void;
  onAlignmentChange: (value: TextAlignment) => void;
  onCitationStyleChange: (value: CitationStyle) => void;
  onAddSourceLink: (sourceLink: string, sourceTitle: string, authorName?: string, publishDate?: string) => void;
}

export const TextEditorControls = ({
  font,
  size,
  alignment,
  format,
  citationStyle,
  isLoading,
  onFormatChange,
  onFontChange,
  onSizeChange,
  onAlignmentChange,
  onCitationStyleChange,
  onAddSourceLink,
}: TextEditorControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <FontControls
        font={font}
        size={size}
        onFontChange={onFontChange}
        onSizeChange={onSizeChange}
      />
      
      <CitationControls
        citationStyle={citationStyle}
        isLoading={isLoading}
        onCitationStyleChange={onCitationStyleChange}
        onAddSourceLink={onAddSourceLink}
      />

      <FormatControls
        format={format}
        onFormatChange={onFormatChange}
      />

      <AlignmentControls
        alignment={alignment}
        onAlignmentChange={onAlignmentChange}
      />
    </div>
  );
};
