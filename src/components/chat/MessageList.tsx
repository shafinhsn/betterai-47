
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  onRestoreDocument?: (content: string) => void;
}

export const MessageList = ({ messages, onRestoreDocument }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 relative overflow-hidden">
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="space-y-4 p-4">
          {messages.map((message: Message) => (
            <div
              key={message.id}
              className={cn(
                'p-4 rounded-lg max-w-[80%] font-sans transform transition-all duration-200 ease-out',
                message.sender === 'user'
                  ? 'ml-auto bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'mr-auto bg-emerald-900/30 text-emerald-50 hover:bg-emerald-900/40',
                'animate-[slide-up_0.3s_ease-out,fade-in_0.2s_ease-out]'
              )}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">{message.content}</div>
                {message.sender === 'ai' && message.documentState && onRestoreDocument && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-emerald-800/50"
                    onClick={() => onRestoreDocument(message.documentState!)}
                    title="Restore document to previous state"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
