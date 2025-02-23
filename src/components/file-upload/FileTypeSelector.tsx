
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FileTypeSelectorProps {
  value: 'docx' | 'pdf';
  onChange: (value: 'docx' | 'pdf') => void;
}

export const FileTypeSelector = ({ value, onChange }: FileTypeSelectorProps) => {
  return (
    <Select value={value} onValueChange={(value: 'docx' | 'pdf') => onChange(value)}>
      <SelectTrigger className="w-full bg-background">
        <SelectValue placeholder="Select document type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="docx">Word Document (.docx)</SelectItem>
        <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
      </SelectContent>
    </Select>
  );
}
