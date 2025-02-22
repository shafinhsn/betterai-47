
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CitationStyle } from '@/hooks/useTextEditor';
import { toast } from "sonner";

interface Source {
  link: string;
  title: string;
  author?: string;
  publishDate?: string;
}

interface SourceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentSource: Source;
  setCurrentSource: (source: Source) => void;
  handleSubmit: () => void;
  editingIndex: number | null;
  citationStyle: CitationStyle;
  isLoading?: boolean;
}

export const SourceDialog = ({
  isOpen,
  onOpenChange,
  currentSource,
  setCurrentSource,
  handleSubmit,
  editingIndex,
  citationStyle,
  isLoading
}: SourceDialogProps) => {
  const showManualFields = citationStyle === 'apa' || citationStyle === 'mla' || citationStyle === 'chicago';

  const handleInputChange = (field: keyof Source, value: string) => {
    setCurrentSource({
      ...currentSource,
      [field]: value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle>
            {editingIndex !== null ? "Edit Source" : "Add Source"} ({citationStyle.toUpperCase()})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Source Title</Label>
            <Input
              id="title"
              value={currentSource.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter source title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Source Link</Label>
            <Input
              id="link"
              value={currentSource.link}
              onChange={(e) => handleInputChange('link', e.target.value)}
              placeholder="Enter source link"
            />
          </div>
          {showManualFields && (
            <>
              <div className="space-y-2">
                <Label htmlFor="author">
                  Author Name
                  {(citationStyle === 'apa' || citationStyle === 'mla') && 
                    <span className="text-gray-400 text-sm ml-2">(Required for APA/MLA)</span>
                  }
                </Label>
                <Input
                  id="author"
                  value={currentSource.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="Enter author name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">
                  Publish Date
                  <span className="text-gray-400 text-sm ml-2">(Optional)</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={currentSource.publishDate}
                  onChange={(e) => handleInputChange('publishDate', e.target.value)}
                />
              </div>
            </>
          )}

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (editingIndex !== null ? 'Update Source' : 'Add Source')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

