import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentSidebar } from '@/components/DocumentSidebar';
import { Chat } from '@/components/Chat';
import { DocumentPreview } from '@/components/DocumentPreview';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import { Message, ProcessedDocument } from '@/types/document';
import { TextEditor } from '@/components/TextEditor';
import { Button } from '@/components/ui/button';
import { ProfileMenu } from '@/components/ProfileMenu';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [updatedContent, setUpdatedContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<ProcessedDocument | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleFileSelect = async (selectedFile: File, fileContent: string, filePath: string = '') => {
    setIsProcessing(true);
    setFile(selectedFile);
    setContent('');
    setUpdatedContent('');
    setCurrentDocument(null);
    
    try {
      setContent(fileContent);
      setCurrentDocument({
        content: fileContent,
        filePath: filePath || URL.createObjectURL(selectedFile),
        filename: selectedFile.name,
        fileType: selectedFile.type
      });
      
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
    setPreviewKey(prev => prev + 1);
    toast({
      title: "Document updated",
      description: "The document has been modified based on your request.",
    });
  };

  const handleManualUpdate = () => {
    setPreviewKey(prev => prev + 1);
    toast({
      title: "Document updated",
      description: "The document has been manually updated.",
    });
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUpdatedContent(event.target.value);
  };

  return (
    <div className="h-screen bg-[#121212] text-white overflow-hidden flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ProfileMenu />
      </div>
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={25} minSize={20} className="bg-[#1a1a1a] border-r border-[#2a2a2a]">
            <DocumentSidebar
              isProcessing={isProcessing}
              currentDocument={currentDocument}
              content={content}
              updatedContent={updatedContent}
              onFileSelect={handleFileSelect}
              onDocumentRemoved={handleDocumentRemoved}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-[#2a2a2a]" />
          
          <ResizablePanel defaultSize={75}>
            <div className="h-full flex flex-col">
              <div className="flex-1 border-x border-[#2a2a2a] bg-[#1a1a1a]">
                <ResizablePanelGroup direction="vertical" className="h-full">
                  <ResizablePanel defaultSize={70}>
                    <div className="h-full p-4">
                      <ResizablePanelGroup direction="vertical" className="h-full gap-4">
                        <ResizablePanel defaultSize={50}>
                          <div className="h-full">
                            <h3 className="text-sm font-medium mb-2 text-gray-200">Original Document</h3>
                            {content ? (
                              <div className="bg-[#242424] rounded-lg p-4 h-[calc(100%-2rem)] overflow-auto">
                                <DocumentPreview key={`original-${previewKey}`} content={content} isUpdated={false} />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                {isProcessing ? 'Processing document...' : 'Upload a document to see preview'}
                              </div>
                            )}
                          </div>
                        </ResizablePanel>
                        
                        {updatedContent && (
                          <>
                            <ResizableHandle withHandle className="bg-[#2a2a2a]" />
                            <ResizablePanel defaultSize={50}>
                              <div className="h-full">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-sm font-medium text-gray-200">Updated Document</h3>
                                  <Button variant="outline" size="sm" onClick={handleManualUpdate}>
                                    Update
                                  </Button>
                                </div>
                                <TextEditor
                                  onFormatChange={() => {}}
                                  onFontChange={() => {}}
                                  onSizeChange={() => {}}
                                  onAlignmentChange={() => {}}
                                />
                                <div className="bg-[#242424] rounded-lg p-4 h-[calc(100%-6rem)] overflow-auto">
                                  <textarea
                                    value={updatedContent}
                                    onChange={handleContentChange}
                                    className="w-full h-full bg-transparent text-emerald-50 focus:outline-none resize-none whitespace-pre-wrap"
                                  />
                                </div>
                              </div>
                            </ResizablePanel>
                          </>
                        )}
                      </ResizablePanelGroup>
                    </div>
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle className="bg-[#2a2a2a]" />
                  
                  <ResizablePanel defaultSize={30}>
                    <div className="h-full border-t border-[#2a2a2a] bg-[#1a1a1a]">
                      <Chat
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        documentContent={content}
                        onDocumentUpdate={handleDocumentUpdate}
                      />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
