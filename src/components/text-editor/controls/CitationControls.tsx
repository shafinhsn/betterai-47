
import { FileStack, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CitationStyle } from '@/hooks/useTextEditor';

interface CitationControlsProps {
  citationStyle: CitationStyle;
  isCheckingPlagiarism: boolean;
  onCitationStyleChange: (value: CitationStyle) => void;
  onPlagiarismCheck: () => void;
}

export const CitationControls = ({
  citationStyle,
  isCheckingPlagiarism,
  onCitationStyleChange,
  onPlagiarismCheck,
}: CitationControlsProps) => {
  return (
    <div className="flex gap-4">
      <Select value={citationStyle} onValueChange={onCitationStyleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Citation Style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Citation Style</SelectItem>
          <SelectItem value="apa">APA</SelectItem>
          <SelectItem value="mla">MLA</SelectItem>
          <SelectItem value="chicago">Chicago</SelectItem>
          <SelectItem value="harvard">Harvard</SelectItem>
        </SelectContent>
      </Select>

      <Button 
        variant="outline" 
        size="icon" 
        onClick={onPlagiarismCheck}
        disabled={isCheckingPlagiarism}
        className="hover:bg-emerald-700/20"
      >
        {isCheckingPlagiarism ? (
          <FileStack className="h-4 w-4 animate-pulse" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

