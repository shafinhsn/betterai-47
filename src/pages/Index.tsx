
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
  const [updatedContent, setUpdatedContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<ProcessedDocument | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFile: File) => {
    setIsProcessing(true);
    setFile(selectedFile);
    setContent('');
    setUpdatedContent('');
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
    setUpdatedContent('');
    setCurrentDocument(null);
    setMessages([]);
  };

  const handleSendMessage = (message: string, sender: 'user' | 'ai') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: sender
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleDocumentUpdate = (newContent: string) => {
    setUpdatedContent(newContent);
    toast({
      title: "Document updated",
      description: "The document has been modified based on your request.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={20}>
          <DocumentSidebar
            isProcessing={isProcessing}
            currentDocument={currentDocument}
            content={content}
            updatedContent={updatedContent}
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
              onDocumentUpdate={handleDocumentUpdate}
            />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={35}>
          <div className="h-screen p-4">
            <div className="flex flex-col h-full gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-2">Original Document</h3>
                {content ? (
                  <DocumentPreview content={content} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {isProcessing ? 'Processing document...' : 'Upload a document to see preview'}
                  </div>
                )}
              </div>
              {updatedContent && (
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-2">Updated Document</h3>
                  <DocumentPreview content={updatedContent} />
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
