
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Message, ProcessedDocument } from '@/types/document';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/MainLayout';

const STORAGE_KEY = 'document_data';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [updatedContent, setUpdatedContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<ProcessedDocument | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setContent(parsedData.content || '');
      setUpdatedContent(parsedData.updatedContent || '');
      setCurrentDocument(parsedData.currentDocument || null);
      setMessages(parsedData.messages || []);
    }
  }, []);

  useEffect(() => {
    if (currentDocument) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        content,
        updatedContent,
        currentDocument,
        messages
      }));
    }
  }, [content, updatedContent, currentDocument, messages]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFileSelect = async (selectedFile: File, fileContent: string) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

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

  const handleSendMessage = (message: string, sender: 'user' | 'ai') => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: sender
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleDocumentUpdate = (newContent: string) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setUpdatedContent(newContent);
    setPreviewKey(prev => prev + 1);
    
    toast({
      title: "Document updated",
      description: "The document has been modified based on your request.",
    });
  };

  const handleManualUpdate = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setPreviewKey(prev => prev + 1);
    toast({
      title: "Document updated",
      description: "The document has been manually updated.",
    });
  };

  return (
    <MainLayout
      isAuthenticated={isAuthenticated}
      isProcessing={isProcessing}
      currentDocument={currentDocument}
      content={content}
      updatedContent={updatedContent}
      messages={messages}
      previewKey={previewKey}
      onFileSelect={handleFileSelect}
      onDocumentRemoved={handleDocumentRemoved}
      onSendMessage={handleSendMessage}
      onDocumentUpdate={handleDocumentUpdate}
      onManualUpdate={handleManualUpdate}
      onNavigate={() => navigate('/auth')}
    />
  );
};

export default Index;
