
import { Bold, Italic } from 'lucide-react';
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { FormatOption } from '@/hooks/useTextEditor';

interface FormatControlsProps {
  format: FormatOption[];
  onFormatChange: (value: FormatOption[]) => void;
}

export const FormatControls = ({
  format,
  onFormatChange,
}: FormatControlsProps) => {
  return (
    <ToggleGroup
      type="multiple"
      value={format}
      onValueChange={onFormatChange}
      className="flex gap-1"
    >
      <ToggleGroupItem value="bold" aria-label="Toggle bold" className="hover:bg-emerald-700/20">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic" className="hover:bg-emerald-700/20">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

