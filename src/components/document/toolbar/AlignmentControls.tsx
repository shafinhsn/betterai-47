
import { Button } from '@/components/ui/button';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface AlignmentControlsProps {
  alignment: 'left' | 'center' | 'right';
  setAlignment: (align: 'left' | 'center' | 'right') => void;
}

export const AlignmentControls = ({
  alignment,
  setAlignment,
}: AlignmentControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAlignment('left')}
        className={`p-2 ${alignment === 'left' ? 'bg-emerald-800/30' : ''}`}
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAlignment('center')}
        className={`p-2 ${alignment === 'center' ? 'bg-emerald-800/30' : ''}`}
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAlignment('right')}
        className={`p-2 ${alignment === 'right' ? 'bg-emerald-800/30' : ''}`}
      >
        <AlignRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

