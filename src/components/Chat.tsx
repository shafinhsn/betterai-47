
import { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

type SubscriptionPlan = {
  name: string;
  price: number;
  messages: number;
  features: string[];
};

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Basic',
    price: 10,
    messages: 1000,
    features: ['1,000 messages per month', 'Basic support', 'Standard response time']
  },
  {
    name: 'Premium',
    price: 25,
    messages: 5000,
    features: ['5,000 messages per month', 'Priority support', 'Faster response time', 'Advanced document analysis']
  },
  {
    name: 'Enterprise',
    price: 100,
    messages: 25000,
    features: ['25,000 messages per month', '24/7 Support', 'Fastest response time', 'Custom features']
  }
];

const FREE_TIER_LIMIT = 100;

export const Chat = ({ onSendMessage, messages, documentContent, onDocumentUpdate }: ChatProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkMessageUsage();
    checkSubscription();
  }, []);

  const checkMessageUsage = async () => {
    try {
      const { data: usage, error } = await supabase
        .from('message_usage')
        .select('message_count')
        .single();

      if (error) throw error;
      setMessageCount(usage?.message_count || 0);
    } catch (error) {
      console.error('Error checking message usage:', error);
    }
  };

  const checkSubscription = async () => {
    try {
      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSubscription(sub);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const updateMessageCount = async () => {
    try {
      const { data: usage, error: selectError } = await supabase
        .from('message_usage')
        .select('*')
        .single();

      if (selectError && selectError.code !== 'PGRST116') throw selectError;

      if (!usage) {
        const { error: insertError } = await supabase
          .from('message_usage')
          .insert([{ message_count: 1 }]);
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from('message_usage')
          .update({ message_count: usage.message_count + 1, last_message_at: new Date().toISOString() })
          .eq('id', usage.id);
        if (updateError) throw updateError;
      }

      setMessageCount(prev => prev + 1);
    } catch (error) {
      console.error('Error updating message count:', error);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    // In a real implementation, this would integrate with a payment provider like Stripe
    toast({
      title: "Subscription Feature",
      description: "This is a demo of the subscription feature. In production, this would integrate with Stripe for payments.",
    });
    setShowSubscriptionDialog(false);
  };

  const checkUsageLimit = async () => {
    if (subscription) return true; // Subscribed users can send unlimited messages
    
    if (messageCount >= FREE_TIER_LIMIT) {
      setShowSubscriptionDialog(true);
      return false;
    }
    
    return true;
  };

  const handleSendMessage = async (content: string) => {
    try {
      const canSendMessage = await checkUsageLimit();
      if (!canSendMessage) return;

      setIsLoading(true);
      
      // Add user message to chat
      onSendMessage(content, 'user');
      
      // Make request to chat function
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: content,
          context: documentContent || '',
        },
      });

      if (error) throw error;

      console.log('Chat response:', data);

      // Handle document update if provided
      if (data?.updatedDocument) {
        console.log('Updating document with new content');
        onDocumentUpdate(data.updatedDocument);
        onSendMessage("I've updated the document based on your request. You can see the changes in the preview panel.", 'ai');
      } else if (data?.reply) {
        if (documentContent) {
          onDocumentUpdate(documentContent);
        }
        onSendMessage(data.reply, 'ai');
      }

      await updateMessageCount();

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
      
      {messageCount < FREE_TIER_LIMIT && !subscription && (
        <div className="px-4 py-2 bg-emerald-900/20 text-emerald-50 text-sm">
          {FREE_TIER_LIMIT - messageCount} messages remaining in free tier
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-emerald-900/20">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your document..."
            className="flex-1 bg-emerald-900/20 border-emerald-800/30 text-emerald-50 placeholder:text-emerald-500/50"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading} className="bg-emerald-700 hover:bg-emerald-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              You've reached the limit of your free tier. Choose a plan to continue using our service.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div key={plan.name} className="border rounded-lg p-4 flex flex-col">
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold my-2">${plan.price}/mo</p>
                <ul className="text-sm space-y-2 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i}>✓ {feature}</li>
                  ))}
                </ul>
                <Button
                  className="mt-4"
                  onClick={() => handleSubscribe(plan)}
                >
                  Subscribe
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

