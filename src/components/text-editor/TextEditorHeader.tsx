
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

export interface TextEditorHeaderProps {
  /** Callback function to trigger manual content update */
  onManualUpdate: () => void;
}

export const TextEditorHeader = ({ onManualUpdate }: TextEditorHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-200">Document Editor</h3>
      <Button 
        variant="default" 
        size="sm" 
        onClick={onManualUpdate}
        className="gap-2"
      >
        <FileDown className="h-4 w-4" />
        Update Document
      </Button>
    </div>
  );
};
