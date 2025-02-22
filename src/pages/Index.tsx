
import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Chat } from '@/components/Chat';
import { DocumentPreview } from '@/components/DocumentPreview';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Trash } from "lucide-react";

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

  const handleRemoveDocument = async () => {
    if (!currentDocument) return;

    try {
      const { error } = await supabase.storage
        .from('documents')
        .remove([currentDocument.filePath]);

      if (error) throw error;

      setFile(null);
      setContent('');
      setCurrentDocument(null);
      setMessages([]);

      toast({
        title: "Document removed",
        description: "Successfully removed the document",
      });
    } catch (error) {
      console.error('Error removing document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove document. Please try again.",
      });
    }
  };

  const handleDownloadDocument = () => {
    if (!content) return;

    try {
      // Create a blob with the processed content
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentDocument ? `processed_${currentDocument.filename}.txt` : 'processed_document.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Document downloaded",
        description: "Successfully downloaded the processed document",
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download document. Please try again.",
      });
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
              <div className="mt-4">
                <div className="text-sm mb-2">
                  <p className="font-medium">Current document:</p>
                  <p className="text-muted-foreground">{currentDocument.filename}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadDocument}
                    className="w-full"
                    disabled={!content}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveDocument}
                    className="w-full"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
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
