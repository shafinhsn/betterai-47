
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
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
    <div className="flex-1 min-h-0"> {/* Add min-h-0 to enable proper flex behavior */}
      <ScrollArea className="h-[calc(100vh-180px)] px-4">
        <div className="space-y-4 py-4">
          {messages.map((message: Message) => (
            <div
              key={message.id}
              className={cn(
                'p-4 rounded-lg max-w-[80%] font-sans animate-fade-in',
                message.sender === 'user'
                  ? 'ml-auto bg-emerald-600 text-white'
                  : 'mr-auto bg-emerald-900/30 text-emerald-50'
              )}
            >
              {message.content}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
