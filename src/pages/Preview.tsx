
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TextEditorPanel } from '@/components/TextEditorPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Save } from 'lucide-react';
import { downloadUpdatedDocument, downloadOriginalDocument } from '@/utils/document';
import { ProcessedDocument } from '@/types/document';
import { useToast } from '@/hooks/use-toast';

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [updatedContent, setUpdatedContent] = useState('');
  const [filename, setFilename] = useState('');
  const [fileType, setFileType] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (location.state) {
      const { content, updatedContent, filename, fileType } = location.state;
      setContent(content || '');
      setUpdatedContent(updatedContent || content || '');
      setFilename(filename);
      setFileType(fileType);
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleSave = () => {
    navigate('/', {
      state: {
        content,
        updatedContent,
        filename,
        fileType
      }
    });
    toast({
      title: "Changes saved",
      description: "Your changes have been saved successfully."
    });
  };

  const handleUpdate = () => {
    if (updatedContent && filename && fileType) {
      downloadUpdatedDocument(updatedContent, filename, fileType);
    }
  };

  const handleDownloadOriginal = () => {
    if (content && filename && fileType) {
      const currentDocument: ProcessedDocument = {
        content,
        filename,
        fileType,
        filePath: ''
      };
      downloadOriginalDocument(currentDocument, content);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleDownloadOriginal}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Original
            </Button>
            <Button 
              onClick={handleUpdate}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Updated
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="h-[calc(100vh-8rem)]">
          <TextEditorPanel
            content={content}
            updatedContent={updatedContent}
            previewKey={0}
            onManualUpdate={handleUpdate}
            isEditable={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Preview;
