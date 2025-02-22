
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentPreviewProps {
  content: string;
}

export const DocumentPreview = ({ content }: DocumentPreviewProps) => {
  return (
    <div className="document-preview h-full">
      <ScrollArea className="h-[calc(100vh-2rem)]">
        <div className="prose max-w-none">
          {content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
