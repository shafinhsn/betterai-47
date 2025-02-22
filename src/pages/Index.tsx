
import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Chat } from '@/components/Chat';
import { DocumentPreview } from '@/components/DocumentPreview';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
}

interface ProcessedDocument {
  content: string;
  filePath: string;
  filename: string;
}

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
    // Clear previous content immediately when processing starts
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

      // Basic validation of the received content
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
          <div className="h-screen p-4">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold mb-2">Document Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Upload a document and start chatting
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} />
            {isProcessing && (
              <div className="mt-4 text-sm text-muted-foreground">
                Processing document...
              </div>
            )}
            {currentDocument && !isProcessing && (
              <div className="mt-4 text-sm">
                <p className="font-medium">Current document:</p>
                <p className="text-muted-foreground">{currentDocument.filename}</p>
              </div>
            )}
          </div>
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
