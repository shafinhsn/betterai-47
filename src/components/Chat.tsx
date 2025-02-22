
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
  onSendMessage: (message: string, sender: 'user' | 'ai') => void;
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
      
      // Add user message to chat
      onSendMessage(content, 'user');
      
      // Check if this is an edit request
      const isEditRequest = content.toLowerCase().includes('edit') || 
                          content.toLowerCase().includes('update') || 
                          content.toLowerCase().includes('change') ||
                          content.toLowerCase().includes('modify') ||
                          content.toLowerCase().includes('replace');

      // Make request to chat function
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: content,
          context: documentContent || '',
          shouldUpdateDocument: isEditRequest,
        },
      });

      if (error) throw error;

      console.log('Chat response:', data);

      // Handle document update if provided
      if (data?.updatedDocument) {
        console.log('Updating document with new content');
        onDocumentUpdate(data.updatedDocument);
      }
      
      // Add AI response to chat
      if (data?.reply) {
        onSendMessage(data.reply, 'ai');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      onSendMessage('Sorry, I encountered an error while processing your request.', 'ai');
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
              'mb-4 p-4 rounded-lg max-w-[80%]',
              message.sender === 'user'
                ? 'ml-auto bg-[#1EAEDB] text-white'
                : 'mr-auto bg-[#F1F0FB] text-gray-800'
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
