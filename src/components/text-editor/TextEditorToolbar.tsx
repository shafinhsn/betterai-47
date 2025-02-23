
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Bold, Italic, Undo, Redo } from 'lucide-react';

interface TextEditorToolbarProps {
  onFormatting: (command: string) => void;
  onFontSize: (size: string) => void;
  onFontFamily: (font: string) => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const TextEditorToolbar = ({
  onFormatting,
  onFontSize,
  onFontFamily,
  onUndo,
  onRedo
}: TextEditorToolbarProps) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-t-lg">
      <Select onValueChange={onFontSize}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36].map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}px
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={onFontFamily}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Arial">Arial</SelectItem>
          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          <SelectItem value="Courier New">Courier New</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onFormatting('bold')}
        className="hover:bg-emerald-900/20"
      >
        <Bold className="h-4 w-4 text-emerald-500" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onFormatting('italic')}
        className="hover:bg-emerald-900/20"
      >
        <Italic className="h-4 w-4 text-emerald-500" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onUndo}
        className="hover:bg-emerald-900/20"
      >
        <Undo className="h-4 w-4 text-emerald-500" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRedo}
        className="hover:bg-emerald-900/20"
      >
        <Redo className="h-4 w-4 text-emerald-500" />
      </Button>
    </div>
  );
};
