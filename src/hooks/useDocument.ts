
import { useState } from 'react';
import { ProcessedDocument, Message } from '@/types/document';
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = 'document_data';

export const useDocument = () => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [updatedContent, setUpdatedContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<ProcessedDocument | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFile: File, fileContent: string) => {
    setIsProcessing(true);
    setFile(selectedFile);
    setContent('');
    setUpdatedContent('');
    setCurrentDocument(null);
    
    try {
      setContent(fileContent);
      const newDocument: ProcessedDocument = {
        content: fileContent,
        filePath: URL.createObjectURL(selectedFile),
        filename: selectedFile.name,
        fileType: selectedFile.type
      };
      setCurrentDocument(newDocument);
      
      toast({
        title: "Document uploaded",
        description: `Successfully processed ${selectedFile.name}`,
      });
    } catch (error) {
      console.error('Error processing document:', error);
      setContent('');
      setCurrentDocument(null);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process document. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDocumentRemoved = () => {
    setFile(null);
    setContent('');
    setUpdatedContent('');
    setCurrentDocument(null);
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleDocumentUpdate = (newContent: string) => {
    console.log('Previous document state:', updatedContent || content);
    console.log('Applying new changes to:', newContent);
    
    setUpdatedContent(newContent);
    setPreviewKey(prev => prev + 1);
    
    toast({
      title: "Document updated",
      description: "The document has been modified based on your request.",
    });
  };

  const handleManualUpdate = (newContent: string) => {
    console.log('Manual update with content:', newContent);
    setUpdatedContent(newContent);
    setPreviewKey(prev => prev + 1);
    
    toast({
      title: "Changes saved",
      description: "Your manual edits have been saved successfully.",
    });
  };

  const handleSendMessage = (message: string, sender: 'user' | 'ai', documentState?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: sender,
      documentState: documentState
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return {
    file,
    content,
    updatedContent,
    messages,
    isProcessing,
    currentDocument,
    previewKey,
    handleFileSelect,
    handleDocumentRemoved,
    handleSendMessage,
    handleDocumentUpdate,
    handleManualUpdate,
  };
};
