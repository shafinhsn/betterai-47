
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { FileTypeSelector } from './file-upload/FileTypeSelector';
import { processPdf } from '@/utils/pdf-processor';
import { processDocx } from '@/utils/docx-processor';

interface FileUploadProps {
  onFileSelect: (file: File, content: string) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [documentType, setDocumentType] = useState<'docx' | 'pdf'>('docx');
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      const file = acceptedFiles[0];
      try {
        let content;

        if (documentType === 'pdf' && file.type === 'application/pdf') {
          console.log('Processing PDF file:', file.name);
          content = await processPdf(file);
        } else if (documentType === 'docx' && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          console.log('Processing DOCX file:', file.name);
          content = await processDocx(file);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Please upload a ${documentType.toUpperCase()} file.`,
          });
          return;
        }

        if (content) {
          onFileSelect(file, content);
          toast({
            title: "Success",
            description: `${file.name} has been processed successfully.`,
          });
        }
      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to process ${documentType.toUpperCase()} file. Please try again.`,
        });
      }
    }
  }, [onFileSelect, documentType, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: documentType === 'pdf' 
      ? { 'application/pdf': ['.pdf'] }
      : { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    noClick: false,
    noKeyboard: false
  });

  return (
    <div className="space-y-4">
      <FileTypeSelector value={documentType} onChange={setDocumentType} />

      <div
        {...getRootProps()}
        className={cn(
          'dropzone border-2 border-dashed border-gray-600 rounded-lg p-8 cursor-pointer transition-colors hover:border-emerald-500/50 hover:bg-emerald-950/20',
          isDragActive && 'border-emerald-500 bg-emerald-500/10'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-lg font-medium text-emerald-50">
              {isDragActive ? 'Drop your document here' : 'Drag & drop your document here'}
            </p>
            <p className="text-sm text-muted-foreground">or click to select</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Supports {documentType === 'docx' ? '.docx' : '.pdf'} files
          </p>
        </div>
      </div>
    </div>
  );
};
