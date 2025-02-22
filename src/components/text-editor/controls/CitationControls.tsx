
import { Plus } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface CitationControlsProps {
  citationStyle: CitationStyle;
  onCitationStyleChange: (value: CitationStyle) => void;
  onAddSourceLink: (sourceLink: string, sourceTitle: string) => void;
}

export const CitationControls = ({
  citationStyle,
  onCitationStyleChange,
  onAddSourceLink,
}: CitationControlsProps) => {
  const [sourceLink, setSourceLink] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');

  const handleSubmit = () => {
    if (sourceLink && sourceTitle) {
      onAddSourceLink(sourceLink, sourceTitle);
      setSourceLink('');
      setSourceTitle('');
    }
  };

  return (
    <div className="flex gap-4">
      <Select value={citationStyle} onValueChange={onCitationStyleChange}>
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

      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="hover:bg-emerald-700/20"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Source Title</Label>
              <Input
                id="title"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                placeholder="Enter source title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Source Link</Label>
              <Input
                id="link"
                value={sourceLink}
                onChange={(e) => setSourceLink(e.target.value)}
                placeholder="Enter source link"
              />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              Add Source
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
