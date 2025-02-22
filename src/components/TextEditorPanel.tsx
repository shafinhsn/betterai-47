
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
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
  AlignJustify 
} from 'lucide-react';
import { useState } from 'react';

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
          <Select
            value={font}
            onValueChange={handleFontChange}
            items={[
              { value: 'Arial', label: 'Arial' },
              { value: 'Times New Roman', label: 'Times New Roman' },
              { value: 'Courier New', label: 'Courier New' }
            ]}
          />
          
          <Select
            value={size}
            onValueChange={handleSizeChange}
            items={[
              { value: '12', label: '12px' },
              { value: '14', label: '14px' },
              { value: '16', label: '16px' },
              { value: '18', label: '18px' },
              { value: '20', label: '20px' }
            ]}
          />

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
