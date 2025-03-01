
import { ClipboardList, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

interface FormattedCitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  format: 'mla' | 'apa';
  citations: string[];
  onCopy: () => void;
}

export const FormattedCitationDialog = ({ 
  open, 
  onOpenChange, 
  format, 
  citations, 
  onCopy 
}: FormattedCitationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            {format === 'mla' ? 'Works Cited' : 'References'}
          </DialogTitle>
          <DialogDescription>
            Your formatted citation list is ready to copy
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 max-h-[400px] overflow-y-auto p-4 border rounded-md bg-emerald-950/30">
          {citations.length === 0 ? (
            <p className="text-emerald-300">No citations available</p>
          ) : (
            <div className="space-y-4">
              {citations.map((citation, index) => (
                <p key={index} className="text-emerald-50 font-mono text-sm pl-8 -indent-8">
                  {citation}
                </p>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <Button onClick={onCopy} className="bg-emerald-600 hover:bg-emerald-700">
            <Copy className="w-4 h-4 mr-2" />
            Copy to Clipboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
