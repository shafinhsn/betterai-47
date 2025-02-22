
import { useState } from 'react';
import { DocumentSidebar } from '@/components/DocumentSidebar';
import { Chat } from '@/components/Chat';
import { DocumentPreview } from '@/components/DocumentPreview';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message, ProcessedDocument } from '@/types/document';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<ProcessedDocument | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFile: File) => {
    setIsProcessing(true);
    setFile(selectedFile);
    setContent('');
    setCurrentDocument(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      if (!data || !data.content) {
        throw new Error('No content received from document processing');
      }

      if (typeof data.content !== 'string' || data.content.trim() === '') {
        throw new Error('Invalid or empty document content received');
      }

      setContent(data.content);
      setCurrentDocument(data);
      
      toast({
        title: "Document uploaded",
        description: `Successfully processed ${data.filename}`,
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
    setCurrentDocument(null);
    setMessages([]);
  };

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="min-h-screen bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={20}>
          <DocumentSidebar
            isProcessing={isProcessing}
            currentDocument={currentDocument}
            content={content}
            onFileSelect={handleFileSelect}
            onDocumentRemoved={handleDocumentRemoved}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={40}>
          <div className="h-screen border-x">
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              documentContent={content}
            />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={35}>
          <div className="h-screen p-4">
            {content ? (
              <DocumentPreview content={content} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {isProcessing ? 'Processing document...' : 'Upload a document to see preview'}
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
