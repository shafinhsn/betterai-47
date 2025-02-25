
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FontControlsProps {
  fontSize: number;
  fontFamily: string;
  setFontSize: (size: number) => void;
  setFontFamily: (font: string) => void;
}

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 48, 72];

export const FontControls = ({
  fontSize,
  fontFamily,
  setFontSize,
  setFontFamily,
}: FontControlsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={fontFamily}
        onValueChange={setFontFamily}
      >
        <SelectTrigger className="w-[180px] bg-[#2a2a2a] text-emerald-50 border-emerald-800/30 hover:bg-emerald-800/30">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Inter">Inter</SelectItem>
          <SelectItem value="Arial">Arial</SelectItem>
          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          <SelectItem value="Playfair Display">Playfair Display</SelectItem>
          <SelectItem value="Sans Serif">Sans Serif</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={fontSize.toString()}
        onValueChange={(value) => setFontSize(Number(value))}
      >
        <SelectTrigger className="w-[80px] bg-[#2a2a2a] text-emerald-50 border-emerald-800/30 hover:bg-emerald-800/30">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map((size) => (
            <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

