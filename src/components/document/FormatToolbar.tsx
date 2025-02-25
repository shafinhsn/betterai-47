
import { Separator } from "@/components/ui/separator";
import { FontControls } from './toolbar/FontControls';
import { AlignmentControls } from './toolbar/AlignmentControls';
import { FormattingControls } from './toolbar/FormattingControls';
import { EditControls } from './toolbar/EditControls';

interface FormatToolbarProps {
  isEditing: boolean;
  isProcessing: boolean;
  fontSize: number;
  fontFamily: string;
  alignment: 'left' | 'center' | 'right';
  setFontSize: (size: number) => void;
  setFontFamily: (font: string) => void;
  setAlignment: (align: 'left' | 'center' | 'right') => void;
  onGrammarCheck: () => Promise<void>;
  onFormatMLA: () => Promise<void>;
  onFormatAPA: () => Promise<void>;
  onEditToggle: () => void;
  onSave: () => void;
}

export const FormatToolbar = ({
  isEditing,
  isProcessing,
  fontSize,
  fontFamily,
  alignment,
  setFontSize,
  setFontFamily,
  setAlignment,
  onGrammarCheck,
  onFormatMLA,
  onFormatAPA,
  onEditToggle,
  onSave,
}: FormatToolbarProps) => {
  return (
    <div className="sticky top-0 z-10 flex flex-col gap-2 p-2 bg-[#1a1a1a] border-b border-emerald-900/20">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <FontControls
            fontSize={fontSize}
            fontFamily={fontFamily}
            setFontSize={setFontSize}
            setFontFamily={setFontFamily}
          />

          <Separator orientation="vertical" className="h-6" />

          <AlignmentControls
            alignment={alignment}
            setAlignment={setAlignment}
          />

          <Separator orientation="vertical" className="h-6" />

          <FormattingControls
            isProcessing={isProcessing}
            onGrammarCheck={onGrammarCheck}
            onFormatMLA={onFormatMLA}
            onFormatAPA={onFormatAPA}
          />

          <EditControls
            isEditing={isEditing}
            isProcessing={isProcessing}
            onEditToggle={onEditToggle}
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
};

