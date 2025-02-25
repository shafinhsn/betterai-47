
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Pencil, 
  Save, 
  SpellCheck, 
  TextQuote, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline 
} from 'lucide-react';
import { forwardRef, memo, CSSProperties, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface DocumentPreviewProps {
  content: string;
  style?: CSSProperties;
  onContentUpdate?: (newContent: string) => void;
}

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 48, 72];

const DocumentPreviewComponent = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ content, style, onContentUpdate }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fontSize, setFontSize] = useState(16);
    const [fontFamily, setFontFamily] = useState('Inter');
    const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
    const [format, setFormat] = useState<'none' | 'mla' | 'apa'>('none');
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

    const setDocumentFormat = (newFormat: 'none' | 'mla' | 'apa') => {
      setFormat(newFormat);
      if (newFormat === 'mla') {
        setFontFamily('Times New Roman');
        setFontSize(12);
      } else if (newFormat === 'apa') {
        setFontFamily('Times New Roman');
        setFontSize(12);
      }
    };

    const handleFormatMLA = async () => {
      setIsProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke('document-format', {
          body: {
            content: editedContent || content,
            action: 'mla',
            metadata: {
              authorName: 'Your Name',
              professorName: 'Professor Name',
              courseName: 'Course Name',
              title: 'Document Title'
            }
          }
        });

        if (error) throw error;
        
        if (onContentUpdate && data.content) {
          onContentUpdate(data.content);
          setDocumentFormat('mla');
          toast({
            title: "MLA Format Applied",
            description: "Document has been formatted using MLA style.",
          });
        }
      } catch (error) {
        console.error('Error formatting MLA:', error);
        toast({
          title: "Error",
          description: "Failed to apply MLA formatting. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    const handleFormatAPA = async () => {
      setIsProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke('document-format', {
          body: {
            content: editedContent || content,
            action: 'apa',
            metadata: {
              authorName: 'Your Name',
              institution: 'Institution Name',
              title: 'Document Title'
            }
          }
        });

        if (error) throw error;
        
        if (onContentUpdate && data.content) {
          onContentUpdate(data.content);
          setDocumentFormat('apa');
          toast({
            title: "APA Format Applied",
            description: "Document has been formatted using APA style.",
          });
        }
      } catch (error) {
        console.error('Error formatting APA:', error);
        toast({
          title: "Error",
          description: "Failed to apply APA formatting. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    const handleGrammarCheck = async () => {
      setIsProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke('document-format', {
          body: {
            content: editedContent || content,
            action: 'grammar'
          }
        });

        if (error) throw error;
        
        if (onContentUpdate && data.content) {
          onContentUpdate(data.content);
          toast({
            title: "Grammar Check Complete",
            description: "Your document has been checked and corrected.",
          });
        }
      } catch (error) {
        console.error('Error checking grammar:', error);
        toast({
          title: "Error",
          description: "Failed to check grammar. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
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
        <div className="sticky top-0 z-10 flex flex-col gap-2 p-2 bg-[#1a1a1a] border-b border-emerald-900/20">
          <div className="flex items-center gap-2">
            <Select
              value={fontFamily}
              onValueChange={setFontFamily}
            >
              <SelectTrigger className="w-[180px] bg-[#2a2a2a] text-emerald-50 border-emerald-800/30 hover:bg-emerald-800/30">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Playfair Display">Playfair Display</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={fontSize.toString()}
              onValueChange={(value) => setFontSize(Number(value))}
            >
              <SelectTrigger className="w-[80px] bg-[#2a2a2a] text-emerald-50 border-emerald-800/30 hover:bg-emerald-800/30">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAlignment('left')}
                className={`p-2 ${alignment === 'left' ? 'bg-emerald-800/30' : ''}`}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAlignment('center')}
                className={`p-2 ${alignment === 'center' ? 'bg-emerald-800/30' : ''}`}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAlignment('right')}
                className={`p-2 ${alignment === 'right' ? 'bg-emerald-800/30' : ''}`}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleGrammarCheck}
              disabled={isProcessing}
              className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
            >
              <SpellCheck className="w-4 h-4 mr-2" />
              Check Grammar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFormatMLA}
              disabled={isProcessing}
              className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
            >
              <TextQuote className="w-4 h-4 mr-2" />
              MLA
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFormatAPA}
              disabled={isProcessing}
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
                disabled={isProcessing}
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
                disabled={isProcessing}
                className="bg-emerald-900/20 border-emerald-800/30 text-emerald-50 hover:bg-emerald-800/30"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-6rem)]">
          {isEditing ? (
            <div className="p-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-full min-h-[500px] bg-transparent text-emerald-50 border border-emerald-800/30 rounded-md p-4 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                style={{
                  ...style,
                  fontFamily,
                  fontSize: `${fontSize}px`,
                  lineHeight: format === 'mla' || format === 'apa' ? '2' : '1.5',
                  textAlign: alignment,
                }}
              />
            </div>
          ) : (
            <div className="prose max-w-none p-4">
              {content.split('\n').map((paragraph, index) => (
                paragraph ? (
                  <p 
                    key={`${index}-${paragraph.substring(0, 10)}`} 
                    className="mb-4 text-emerald-50 whitespace-pre-wrap"
                    style={{
                      ...style,
                      fontFamily,
                      fontSize: `${fontSize}px`,
                      lineHeight: format === 'mla' || format === 'apa' ? '2' : '1.5',
                      textAlign: alignment,
                    }}
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

