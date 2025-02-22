
import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Chat } from '@/components/Chat';
import { DocumentPreview } from '@/components/DocumentPreview';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
}

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setIsProcessing(true);
    setFile(selectedFile);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/supabase/functions/v1/process-document', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to process document');
      }

      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error('Error processing document:', error);
      setContent('Error processing document. Please try again.');
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
                Upload a document to see preview
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
