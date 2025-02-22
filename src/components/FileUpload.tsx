
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Initialize PDF.js worker using the worker from node_modules
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

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
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({
        data: arrayBuffer,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
      }).promise;
      
      console.log('PDF loaded successfully with', pdf.numPages, 'pages');
      
      // Extract text from all pages
      const maxPages = pdf.numPages;
      const textContent = [];
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const text = await page.getTextContent();
        const pageText = text.items.map((item: any) => item.str).join(' ');
        textContent.push(pageText);
      }
      
      return textContent.join('\n\n');
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process PDF file. Please try again.",
      });
      throw new Error('Failed to process PDF file');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      const file = acceptedFiles[0];
      try {
        let content;
        // Check if file type matches selected document type
        if (documentType === 'pdf' && file.type === 'application/pdf') {
          content = await processPdf(file);
        } else if (documentType === 'docx' && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          content = await processDocx(file);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Please upload a ${documentType.toUpperCase()} file.`,
          });
          return;
        }
        onFileSelect(file, content);
        toast({
          title: "Success",
          description: `${file.name} has been processed successfully.`,
        });
      } catch (error) {
        console.error('Error processing file:', error);
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

