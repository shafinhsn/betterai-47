
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';

interface TextEditorProps {
  onFormatChange: (format: string) => void;
  onFontChange: (font: string) => void;
  onSizeChange: (size: string) => void;
  onAlignmentChange: (alignment: string) => void;
}

export const TextEditor = ({ 
  onFormatChange,
  onFontChange,
  onSizeChange,
  onAlignmentChange
}: TextEditorProps) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-[#242424] rounded-lg mb-2">
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onFormatChange('bold')}
          className="h-8 w-8"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onFormatChange('italic')}
          className="h-8 w-8"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onFormatChange('underline')}
          className="h-8 w-8"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-[#2a2a2a]" />

      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onAlignmentChange('left')}
          className="h-8 w-8"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onAlignmentChange('center')}
          className="h-8 w-8"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onAlignmentChange('right')}
          className="h-8 w-8"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onAlignmentChange('justify')}
          className="h-8 w-8"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-[#2a2a2a]" />

      <select 
        className="bg-[#1a1a1a] text-sm rounded px-2 py-1 border border-[#2a2a2a]"
        onChange={(e) => onFontChange(e.target.value)}
      >
        <option value="inter">Inter</option>
        <option value="arial">Arial</option>
        <option value="times">Times New Roman</option>
        <option value="georgia">Georgia</option>
      </select>

      <select 
        className="bg-[#1a1a1a] text-sm rounded px-2 py-1 border border-[#2a2a2a] w-20"
        onChange={(e) => onSizeChange(e.target.value)}
      >
        {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72].map((size) => (
          <option key={size} value={size}>
            {size}px
          </option>
        ))}
      </select>
    </div>
  );
};
