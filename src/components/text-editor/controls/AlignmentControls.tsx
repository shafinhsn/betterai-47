
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { TextAlignment } from '@/hooks/useTextEditor';

interface AlignmentControlsProps {
  alignment: TextAlignment;
  onAlignmentChange: (value: TextAlignment) => void;
}

export const AlignmentControls = ({
  alignment,
  onAlignmentChange,
}: AlignmentControlsProps) => {
  return (
    <ToggleGroup
      type="single"
      value={alignment}
      onValueChange={onAlignmentChange}
      className="flex gap-1"
    >
      <ToggleGroupItem value="left" aria-label="Align left" className="hover:bg-emerald-700/20">
        <AlignLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center" className="hover:bg-emerald-700/20">
        <AlignCenter className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right" className="hover:bg-emerald-700/20">
        <AlignRight className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="justify" aria-label="Align justify" className="hover:bg-emerald-700/20">
        <AlignJustify className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

