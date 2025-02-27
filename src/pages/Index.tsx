
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { CitationsView } from '@/components/document/CitationsView';
import { useDocument } from '@/hooks/useDocument';
import { useAuthState } from '@/hooks/useAuthState';
import { useMessageHandler } from '@/hooks/useMessageHandler';

const STORAGE_KEY = 'document_data';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthState();
  const [showCitations, setShowCitations] = useState(false);
  
  const {
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
  } = useDocument();

  useMessageHandler({
    content,
    updatedContent,
    onUpdate: handleDocumentUpdate,
    onPreviewUpdate: () => {},
  });

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (currentDocument) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          content,
          updatedContent,
          currentDocument,
          messages
        }));
      }
    }
  }, [content, updatedContent, currentDocument, messages]);

  const handleAuthCheck = (callback: () => void) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    callback();
  };

  const handleFileSelectWithAuth = (file: File, content: string) => {
    handleAuthCheck(() => handleFileSelect(file, content));
  };

  const handleSendMessageWithAuth = (message: string, sender: 'user' | 'ai', documentState?: string) => {
    handleAuthCheck(() => handleSendMessage(message, sender, documentState));
  };

  const handleDocumentUpdateWithAuth = (content: string) => {
    handleAuthCheck(() => handleDocumentUpdate(content));
  };

  const handleManualUpdateWithAuth = (content: string) => {
    handleAuthCheck(() => handleManualUpdate(content));
  };

  return (
    <div className="h-screen bg-[#121212] text-white overflow-hidden">
      {showCitations ? (
        <CitationsView onBack={() => setShowCitations(false)} />
      ) : (
        <MainLayout
          isAuthenticated={isAuthenticated}
          isProcessing={isProcessing}
          currentDocument={currentDocument}
          content={content}
          updatedContent={updatedContent}
          messages={messages}
          previewKey={previewKey}
          onFileSelect={handleFileSelectWithAuth}
          onDocumentRemoved={handleDocumentRemoved}
          onSendMessage={handleSendMessageWithAuth}
          onDocumentUpdate={handleDocumentUpdateWithAuth}
          onManualUpdate={handleManualUpdateWithAuth}
          onNavigate={() => navigate('/auth')}
          onCitationsOpen={() => setShowCitations(true)}
        />
      )}
    </div>
  );
};

export default Index;
