
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FontFamily } from '@/hooks/useTextEditor';

interface FontControlsProps {
  font: FontFamily;
  size: string;
  onFontChange: (value: FontFamily) => void;
  onSizeChange: (value: string) => void;
}

export const FontControls = ({
  font,
  size,
  onFontChange,
  onSizeChange,
}: FontControlsProps) => {
  return (
    <div className="flex gap-4">
      <Select value={font} onValueChange={onFontChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Arial">Arial</SelectItem>
          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          <SelectItem value="Courier New">Courier New</SelectItem>
          <SelectItem value="Georgia">Georgia</SelectItem>
          <SelectItem value="Verdana">Verdana</SelectItem>
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
          <SelectItem value="24">24px</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

