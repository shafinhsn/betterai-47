
import { Citation } from '@/types/citation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

interface CitationListTableProps {
  citations: Citation[];
  onDelete: (id: string) => void;
}

export const CitationListTable = ({ citations, onDelete }: CitationListTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Publisher</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {citations.map((citation) => (
          <TableRow key={citation.id}>
            <TableCell>{citation.type}</TableCell>
            <TableCell>{citation.title}</TableCell>
            <TableCell>{citation.publisher}</TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => citation.id && onDelete(citation.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
