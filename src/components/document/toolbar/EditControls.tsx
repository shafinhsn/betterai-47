
import { Button } from '@/components/ui/button';
import { Pencil, Save } from 'lucide-react';

interface EditControlsProps {
  isEditing: boolean;
  isProcessing: boolean;
  onEditToggle: () => void;
  onSave: () => void;
}

export const EditControls = ({
  isEditing,
  isProcessing,
  onEditToggle,
  onSave,
}: EditControlsProps) => {
  if (!isEditing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onEditToggle}
        disabled={isProcessing}
        className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
      >
        <Pencil className="w-4 h-4 mr-2" />
        Edit
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onSave}
      disabled={isProcessing}
      className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
    >
      <Save className="w-4 h-4 mr-2" />
      Save Changes
    </Button>
  );
};
