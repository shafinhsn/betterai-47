
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
  pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker.PDFWorker();
}

interface FileUploadProps {
  onFileSelect: (file: File, content: string) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [documentType, setDocumentType] = useState<'docx' | 'pdf'>('docx');
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const processDocx = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('Error processing DOCX:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process DOCX file. Please try again.",
      });
      throw new Error('Failed to process DOCX file');
    }
  };

  const processPdf = async (file: File) => {
    try {
      console.log('Processing PDF file:', file.name);
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded successfully with', pdf.numPages, 'pages');
      
      const textContent: string[] = [];
      
      // Process each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ');
        textContent.push(pageText);
      }
      
      return textContent.join('\n\n');
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process PDF file. Please check if the file is valid and try again.",
      });
      throw new Error('Failed to process PDF file');
    }
  };

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

