
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import mammoth from 'mammoth';

interface FileUploadProps {
  onFileSelect: (file: File, content: string) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      const file = acceptedFiles[0];
      try {
        const content = await processDocx(file);
        onFileSelect(file, content);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  return (
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
        <p className="text-xs text-muted-foreground">Supports DOCX files</p>
      </div>
    </div>
  );
};
