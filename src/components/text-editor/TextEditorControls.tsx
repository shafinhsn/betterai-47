
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Check,
  FileStack
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

interface TextEditorControlsProps {
  font: string;
  size: string;
  alignment: string;
  format: string[];
  citationStyle: string;
  isCheckingPlagiarism: boolean;
  onFormatChange: (value: string[]) => void;
  onFontChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onAlignmentChange: (value: string) => void;
  onCitationStyleChange: (value: string) => void;
  onPlagiarismCheck: () => void;
}

export const TextEditorControls = ({
  font,
  size,
  alignment,
  format,
  citationStyle,
  isCheckingPlagiarism,
  onFormatChange,
  onFontChange,
  onSizeChange,
  onAlignmentChange,
  onCitationStyleChange,
  onPlagiarismCheck,
}: TextEditorControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <Select value={font} onValueChange={onFontChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Arial">Arial</SelectItem>
          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          <SelectItem value="Courier New">Courier New</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={size} onValueChange={onSizeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="12">12px</SelectItem>
          <SelectItem value="14">14px</SelectItem>
          <SelectItem value="16">16px</SelectItem>
          <SelectItem value="18">18px</SelectItem>
          <SelectItem value="20">20px</SelectItem>
        </SelectContent>
      </Select>

      <Select value={citationStyle} onValueChange={onCitationStyleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Citation Style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Citation Style</SelectItem>
          <SelectItem value="apa">APA</SelectItem>
          <SelectItem value="mla">MLA</SelectItem>
          <SelectItem value="chicago">Chicago</SelectItem>
        </SelectContent>
      </Select>

      <Button 
        variant="outline" 
        size="icon" 
        onClick={onPlagiarismCheck}
        disabled={isCheckingPlagiarism}
      >
        {isCheckingPlagiarism ? (
          <FileStack className="h-4 w-4 animate-pulse" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>

      <ToggleGroup
        type="multiple"
        value={format}
        onValueChange={onFormatChange}
        className="flex gap-1"
      >
        <ToggleGroupItem value="bold" aria-label="Toggle bold">
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic">
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup
        type="single"
        value={alignment}
        onValueChange={onAlignmentChange}
        className="flex gap-1"
      >
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="justify" aria-label="Align justify">
          <AlignJustify className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
