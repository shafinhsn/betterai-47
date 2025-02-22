
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import mammoth from 'mammoth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FileUploadProps {
  onFileSelect: (file: File, content: string) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [documentType, setDocumentType] = useState<'docx' | 'pdf'>('docx');
  const [isDragging, setIsDragging] = useState(false);

  const processDocx = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('Error processing DOCX:', error);
      throw new Error('Failed to process DOCX file');
    }
  };

  const processPdf = async (file: File) => {
    try {
      // For now, return a placeholder message
      return "PDF support coming soon. This is a placeholder for PDF content.";
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF file');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      const file = acceptedFiles[0];
      try {
        let content;
        if (file.type === 'application/pdf') {
          content = await processPdf(file);
        } else {
          content = await processDocx(file);
        }
        onFileSelect(file, content);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-4">
      <Select value={documentType} onValueChange={(value: 'docx' | 'pdf') => setDocumentType(value)}>
        <SelectTrigger className="w-full bg-background">
          <SelectValue placeholder="Select document type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="docx">Word Document (.docx)</SelectItem>
          <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
        </SelectContent>
      </Select>

      <div
        {...getRootProps()}
        className={cn(
          'dropzone border-2 border-dashed border-gray-600 rounded-lg p-8 cursor-pointer hover:border-gray-500 transition-colors',
          isDragActive && 'border-emerald-500 bg-emerald-500/10'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-lg font-medium">Drop your document here</p>
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

