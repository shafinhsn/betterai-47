
import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
}

interface ChatProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  documentContent?: string;
  onDocumentUpdate: (updatedContent: string) => void;
}

export const Chat = ({ onSendMessage, messages, documentContent, onDocumentUpdate }: ChatProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      onSendMessage(content);
      
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: content,
          context: documentContent || '',
          shouldUpdateDocument: content.toLowerCase().includes('edit') || 
                              content.toLowerCase().includes('update') || 
                              content.toLowerCase().includes('change'),
        },
      });

      if (error) throw error;

      if (data?.updatedDocument) {
        onDocumentUpdate(data.updatedDocument);
      } else if (data?.reply) {
        onSendMessage(data.reply);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      onSendMessage('Sorry, I encountered an error while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'mb-4 p-4 rounded-lg',
              message.sender === 'user'
                ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]'
                : 'bg-muted/70 text-muted-foreground mr-auto max-w-[80%]'
            )}
          >
            {message.content}
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your document..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
