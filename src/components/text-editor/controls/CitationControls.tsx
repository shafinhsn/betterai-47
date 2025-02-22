
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
  const [sourceLink, setSourceLink] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasAddedFirstSource, setHasAddedFirstSource] = useState(false);

  // Open dialog when a citation style is selected
  useEffect(() => {
    if (citationStyle !== 'none') {
      if (!hasAddedFirstSource) {
        setIsDialogOpen(true);
      }
    } else {
      setIsDialogOpen(false);
    }
  }, [citationStyle, hasAddedFirstSource]);

  const handleSubmit = () => {
    if (!sourceTitle) {
      toast.error("Source title is required");
      return;
    }

    if (!sourceLink) {
      toast.error("Source link is required");
      return;
    }

    // For APA and MLA styles, author name is required
    if ((citationStyle === 'apa' || citationStyle === 'mla') && !authorName) {
      toast.error("Author name is required for APA and MLA citations");
      return;
    }

    // For all academic styles, publish date is highly recommended
    if (!publishDate && (citationStyle === 'apa' || citationStyle === 'mla' || citationStyle === 'chicago')) {
      toast.warning("Adding a publish date is recommended for proper citation formatting");
    }

    onAddSourceLink(sourceLink, sourceTitle, authorName, publishDate);
    setSourceLink('');
    setSourceTitle('');
    setAuthorName('');
    setPublishDate('');
    setIsDialogOpen(false);
    setHasAddedFirstSource(true);
    toast.success("Source added successfully");
  };

  const handleStyleChange = (value: CitationStyle) => {
    if (value !== 'none' && !hasAddedFirstSource) {
      toast.info("Please add at least one source first");
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Source ({citationStyle.toUpperCase()})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Source Title<span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                placeholder="Enter source title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Source Link<span className="text-red-500">*</span></Label>
              <Input
                id="link"
                value={sourceLink}
                onChange={(e) => setSourceLink(e.target.value)}
                placeholder="Enter source link"
                required
              />
            </div>
            {showManualFields && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="author">
                    Author Name
                    {(citationStyle === 'apa' || citationStyle === 'mla') && 
                      <span className="text-red-500">*</span>
                    }
                  </Label>
                  <Input
                    id="author"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Enter author name"
                    required={citationStyle === 'apa' || citationStyle === 'mla'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Publish Date 
                    <span className="text-gray-400 text-sm ml-2">(Recommended)</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                  />
                </div>
              </>
            )}
            <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : 'Add Source'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
