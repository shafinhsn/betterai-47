
import { Button } from '@/components/ui/button';

interface TextEditorHeaderProps {
  onManualUpdate: () => void;
}

export const TextEditorHeader = ({ onManualUpdate }: TextEditorHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-gray-200">Updated Document</h3>
      <Button variant="outline" size="sm" onClick={onManualUpdate}>
        Update
      </Button>
    </div>
  );
};
