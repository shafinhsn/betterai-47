
import { Button } from '@/components/ui/button';

interface Source {
  link: string;
  title: string;
  author?: string;
  publishDate?: string;
}

interface SourceListProps {
  sources: Source[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const SourceList = ({ sources, onEdit, onDelete }: SourceListProps) => {
  if (sources.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Added Sources:</h4>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {sources.map((source, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded">
            <div className="flex-1 mr-2">
              <p className="font-medium text-sm truncate">{source.title}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="ghost" onClick={() => onEdit(index)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(index)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
