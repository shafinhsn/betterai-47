
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <ScrollArea className="flex-1 p-4">
      {messages.map((message: Message) => (
        <div
          key={message.id}
          className={cn(
            'mb-4 p-4 rounded-lg max-w-[80%] font-sans',
            message.sender === 'user'
              ? 'ml-auto bg-emerald-600 text-white'
              : 'mr-auto bg-emerald-900/30 text-emerald-50'
          )}
        >
          {message.content}
        </div>
      ))}
    </ScrollArea>
  );
};
