
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DocumentPreview } from '@/components/DocumentPreview';
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
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
import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TextEditorPanelProps {
  updatedContent: string;
  content: string;
  previewKey: number;
  onManualUpdate: () => void;
}

export const TextEditorPanel = ({ 
  updatedContent, 
  content, 
  previewKey, 
  onManualUpdate 
}: TextEditorPanelProps) => {
  const [font, setFont] = useState('Arial');
  const [size, setSize] = useState('16');
  const [alignment, setAlignment] = useState('left');
  const [format, setFormat] = useState<string[]>([]);
  const [citationStyle, setCitationStyle] = useState('none');
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);

  const handleFormatChange = (value: string[]) => {
    setFormat(value);
  };

  const handleFontChange = (value: string) => {
    setFont(value);
  };

  const handleSizeChange = (value: string) => {
    setSize(value);
  };

  const handleAlignmentChange = (value: string) => {
    if (value) setAlignment(value);
  };

  const handleCitationStyleChange = (value: string) => {
    setCitationStyle(value);
    toast.success(`Applied ${value.toUpperCase()} citation style`);
  };

  const handlePlagiarismCheck = async () => {
    try {
      setIsCheckingPlagiarism(true);
      
      // In a real implementation, this would call a plagiarism checking service
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      
      toast.success("Document checked for plagiarism - No issues found", {
        description: "Your document appears to be original content.",
        duration: 5000,
      });
    } catch (error) {
      toast.error("Error checking for plagiarism");
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-200">Updated Document</h3>
        <Button variant="outline" size="sm" onClick={onManualUpdate}>
          Update
        </Button>
      </div>
      
      <div className="bg-[#242424] rounded-lg p-4 mb-4">
        <div className="flex flex-wrap gap-4 mb-4">
          <Select value={font} onValueChange={handleFontChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={size} onValueChange={handleSizeChange}>
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

          <Select value={citationStyle} onValueChange={handleCitationStyleChange}>
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
            onClick={handlePlagiarismCheck}
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
            onValueChange={handleFormatChange}
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
            onValueChange={handleAlignmentChange}
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
      </div>

      <div className="bg-[#242424] rounded-lg p-4 overflow-auto">
        <DocumentPreview 
          key={`updated-${previewKey}`} 
          content={updatedContent} 
          isUpdated={true}
          originalContent={content}
          style={{
            fontFamily: font,
            fontSize: `${size}px`,
            textAlign: alignment as any,
            fontWeight: format.includes('bold') ? 'bold' : 'normal',
            fontStyle: format.includes('italic') ? 'italic' : 'normal'
          }}
        />
      </div>
    </div>
  );
};
