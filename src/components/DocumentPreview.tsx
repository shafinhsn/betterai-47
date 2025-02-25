
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Pencil, Save, SpellCheck, TextQuote } from 'lucide-react';
import { forwardRef, memo, CSSProperties, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface DocumentPreviewProps {
  content: string;
  style?: CSSProperties;
  onContentUpdate?: (newContent: string) => void;
}

const DocumentPreviewComponent = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ content, style, onContentUpdate }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const { toast } = useToast();

    const handleSave = () => {
      if (onContentUpdate) {
        onContentUpdate(editedContent);
        setIsEditing(false);
        toast({
          title: "Changes saved",
          description: "Your edits have been saved successfully.",
        });
      }
    };

    const handleFormatMLA = () => {
      // Basic MLA formatting example
      const mlaFormatted = `Your Name\nProfessor Name\nCourse Name\n${new Date().toLocaleDateString()}\n\n${content}`;
      if (onContentUpdate) {
        onContentUpdate(mlaFormatted);
        toast({
          title: "MLA Format Applied",
          description: "Document has been formatted using MLA style.",
        });
      }
    };

    const handleFormatAPA = () => {
      // Basic APA formatting example
      const apaFormatted = `Running head: TITLE\n\nTitle\n\nAuthor Name\nInstitution\n\n${content}`;
      if (onContentUpdate) {
        onContentUpdate(apaFormatted);
        toast({
          title: "APA Format Applied",
          description: "Document has been formatted using APA style.",
        });
      }
    };

    const handleGrammarCheck = () => {
      // For now, just show a toast - this would be connected to a grammar checking service
      toast({
        title: "Grammar Check",
        description: "Grammar checking feature will be implemented soon.",
      });
    };

    if (!content) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          No content available
        </div>
      );
    }

    return (
      <div className="document-preview h-full" ref={ref}>
        <div className="sticky top-0 z-10 flex justify-end gap-2 p-2 bg-[#1a1a1a] border-b border-emerald-900/20">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGrammarCheck}
            className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
          >
            <SpellCheck className="w-4 h-4 mr-2" />
            Check Grammar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFormatMLA}
            className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
          >
            <TextQuote className="w-4 h-4 mr-2" />
            MLA
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFormatAPA}
            className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
          >
            <TextQuote className="w-4 h-4 mr-2" />
            APA
          </Button>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(100vh-6rem)]">
          {isEditing ? (
            <div className="p-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-full min-h-[500px] bg-transparent text-emerald-50 border border-emerald-800/30 rounded-md p-4 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                style={style}
              />
            </div>
          ) : (
            <div className="prose max-w-none p-4">
              {content.split('\n').map((paragraph, index) => (
                paragraph ? (
                  <p 
                    key={`${index}-${paragraph.substring(0, 10)}`} 
                    className="mb-4 text-emerald-50 whitespace-pre-wrap"
                    style={style}
                  >
                    {paragraph}
                  </p>
                ) : <br key={index} />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  }
);

DocumentPreviewComponent.displayName = 'DocumentPreview';

export const DocumentPreview = memo(DocumentPreviewComponent);

