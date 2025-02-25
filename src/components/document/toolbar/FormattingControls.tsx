
import { Button } from '@/components/ui/button';
import { SpellCheck, TextQuote } from 'lucide-react';

interface FormattingControlsProps {
  isProcessing: boolean;
  onGrammarCheck: () => Promise<void>;
  onFormatMLA: () => Promise<void>;
  onFormatAPA: () => Promise<void>;
}

export const FormattingControls = ({
  isProcessing,
  onGrammarCheck,
  onFormatMLA,
  onFormatAPA,
}: FormattingControlsProps) => {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onGrammarCheck}
        disabled={isProcessing}
        className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
      >
        <SpellCheck className="w-4 h-4 mr-2" />
        Check Grammar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onFormatMLA}
        disabled={isProcessing}
        className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
      >
        <TextQuote className="w-4 h-4 mr-2" />
        MLA
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onFormatAPA}
        disabled={isProcessing}
        className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
      >
        <TextQuote className="w-4 h-4 mr-2" />
        APA
      </Button>
    </>
  );
};

