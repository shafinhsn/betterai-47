
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      onFileSelect(acceptedFiles[0]);
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
        'dropzone',
        isDragActive && 'dropzone-active'
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
