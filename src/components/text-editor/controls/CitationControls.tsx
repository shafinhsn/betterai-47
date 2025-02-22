
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CitationStyle } from '@/hooks/useTextEditor';
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { SourceDialog } from './citation/SourceDialog';
import { SourceList } from './citation/SourceList';

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
      const updatedSources = [...sources];
      updatedSources[editingIndex] = currentSource;
      setSources(updatedSources);
      toast.success("Source updated successfully");
    } else {
      setSources(prev => [...prev, currentSource]);
      toast.success("Source added successfully");
    }

    onAddSourceLink(
      currentSource.link, 
      currentSource.title, 
      currentSource.author, 
      currentSource.publishDate
    );

    setCurrentSource({ link: '', title: '', author: '', publishDate: '' });
    setEditingIndex(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (index: number) => {
    setCurrentSource(sources[index]);
    setEditingIndex(index);
    setIsDialogOpen(true);
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

      <SourceDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentSource={currentSource}
        setCurrentSource={setCurrentSource}
        handleSubmit={handleSubmit}
        editingIndex={editingIndex}
        citationStyle={citationStyle}
        isLoading={isLoading}
      />

      <SourceList
        sources={sources}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
