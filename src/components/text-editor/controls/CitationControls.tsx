
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CitationStyle } from '@/hooks/useTextEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from "sonner";

interface Source {
  link: string;
  title: string;
  author?: string;
  publishDate?: string;
}

interface CitationControlsProps {
  citationStyle: CitationStyle;
  onCitationStyleChange: (value: CitationStyle) => void;
  onAddSourceLink: (sourceLink: string, sourceTitle: string, authorName?: string, publishDate?: string) => void;
  isLoading?: boolean;
}

export const CitationControls = ({
  citationStyle,
  onCitationStyleChange,
  onAddSourceLink,
  isLoading = false,
}: CitationControlsProps) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [currentSource, setCurrentSource] = useState<Source>({ link: '', title: '', author: '', publishDate: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Open dialog when a citation style is selected for the first time
  useEffect(() => {
    if (citationStyle !== 'none' && sources.length === 0) {
      setIsDialogOpen(true);
    }
  }, [citationStyle, sources.length]);

  const handleSubmit = () => {
    if (!currentSource.title || !currentSource.link) {
      toast.error("Source title and link are required");
      return;
    }

    if (editingIndex !== null) {
      // Update existing source
      const updatedSources = [...sources];
      updatedSources[editingIndex] = currentSource;
      setSources(updatedSources);
      toast.success("Source updated successfully");
    } else {
      // Add new source
      setSources(prev => [...prev, currentSource]);
      toast.success("Source added successfully");
    }

    // Send to parent component
    onAddSourceLink(
      currentSource.link, 
      currentSource.title, 
      currentSource.author, 
      currentSource.publishDate
    );

    // Reset form
    setCurrentSource({ link: '', title: '', author: '', publishDate: '' });
    setEditingIndex(null);
    setIsDialogOpen(false); // Close dialog after submission
  };

  const handleEdit = (index: number) => {
    setCurrentSource(sources[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    setSources(prev => prev.filter((_, i) => i !== index));
    toast.success("Source removed");
  };

  const handleStyleChange = (value: CitationStyle) => {
    if (value !== 'none' && sources.length === 0) {
      setIsDialogOpen(true);
    }
    onCitationStyleChange(value);
  };

  const showManualFields = citationStyle === 'apa' || citationStyle === 'mla' || citationStyle === 'chicago';

  return (
    <div className="flex gap-4">
      <Select value={citationStyle} onValueChange={handleStyleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Citation Style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Citation Style</SelectItem>
          <SelectItem value="apa">APA</SelectItem>
          <SelectItem value="mla">MLA</SelectItem>
          <SelectItem value="chicago">Chicago</SelectItem>
          <SelectItem value="harvard">Harvard</SelectItem>
        </SelectContent>
      </Select>

      {citationStyle !== 'none' && (
        <Button 
          variant="outline" 
          onClick={() => setIsDialogOpen(true)}
          className="flex gap-2 items-center"
        >
          Manage Sources ({sources.length})
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                onChange={(e) => setCurrentSource(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter source title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Source Link</Label>
              <Input
                id="link"
                value={currentSource.link}
                onChange={(e) => setCurrentSource(prev => ({ ...prev, link: e.target.value }))}
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
                    onChange={(e) => setCurrentSource(prev => ({ ...prev, author: e.target.value }))}
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
                    onChange={(e) => setCurrentSource(prev => ({ ...prev, publishDate: e.target.value }))}
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

            {sources.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Added Sources:</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {sources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded">
                      <div className="truncate flex-1">
                        <p className="font-medium truncate">{source.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{source.link}</p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(index)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(index)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

