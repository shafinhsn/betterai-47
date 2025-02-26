
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Citation, CitationType, Contributor } from '@/types/citation';

interface NewCitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (citation: Citation) => void;
}

export const NewCitationDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit 
}: NewCitationDialogProps) => {
  const [type, setType] = useState<CitationType>('website');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [doi, setDoi] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [contributors, setContributors] = useState<Contributor[]>([{
    role: 'author',
    first_name: '',
    last_name: '',
  }]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const citation: Citation = {
      type,
      title,
      url,
      doi,
      isbn,
      publisher,
      publication_date: publicationDate,
      accessed_date: new Date().toISOString(),
      contributors: contributors.filter(c => c.first_name || c.last_name),
    };
    onSubmit(citation);
    resetForm();
  };

  const resetForm = () => {
    setType('website');
    setTitle('');
    setUrl('');
    setDoi('');
    setIsbn('');
    setPublisher('');
    setPublicationDate('');
    setContributors([{ role: 'author', first_name: '', last_name: '' }]);
  };

  const addContributor = () => {
    setContributors([...contributors, { role: 'author', first_name: '', last_name: '' }]);
  };

  const updateContributor = (index: number, field: keyof Contributor, value: string) => {
    const updated = [...contributors];
    updated[index] = { ...updated[index], [field]: value };
    setContributors(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Citation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              value={type} 
              onValueChange={(value: CitationType) => setType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="book">Book</SelectItem>
                <SelectItem value="journal">Journal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {type === 'website' && (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          )}

          {type === 'journal' && (
            <div className="space-y-2">
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
              />
            </div>
          )}

          {type === 'book' && (
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher</Label>
            <Input
              id="publisher"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publication-date">Publication Date</Label>
            <Input
              id="publication-date"
              type="date"
              value={publicationDate}
              onChange={(e) => setPublicationDate(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Contributors</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addContributor}
              >
                Add Contributor
              </Button>
            </div>
            {contributors.map((contributor, index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="First name"
                  value={contributor.first_name}
                  onChange={(e) => updateContributor(index, 'first_name', e.target.value)}
                />
                <Input
                  placeholder="Last name"
                  value={contributor.last_name}
                  onChange={(e) => updateContributor(index, 'last_name', e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Citation</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
