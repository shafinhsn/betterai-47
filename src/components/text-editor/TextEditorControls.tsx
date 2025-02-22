
import { TextAlignment, FormatOption, FontFamily } from '@/hooks/useTextEditor';
import { FontControls } from './controls/FontControls';
import { FormatControls } from './controls/FormatControls';
import { AlignmentControls } from './controls/AlignmentControls';

export interface TextEditorControlsProps {
  font: FontFamily;
  size: string;
  alignment: TextAlignment;
  format: FormatOption[];
  onFormatChange: (value: FormatOption[]) => void;
  onFontChange: (value: FontFamily) => void;
  onSizeChange: (value: string) => void;
  onAlignmentChange: (value: TextAlignment) => void;
}

export const TextEditorControls = ({
  font,
  size,
  alignment,
  format,
  onFormatChange,
  onFontChange,
  onSizeChange,
  onAlignmentChange,
}: TextEditorControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <FontControls
        font={font}
        size={size}
        onFontChange={onFontChange}
        onSizeChange={onSizeChange}
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
