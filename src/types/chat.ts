
import type { Tables } from '@/integrations/supabase/database.types';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
}

export interface ChatProps {
  onSendMessage: (message: string, sender: 'user' | 'ai') => void;
  messages: Message[];
  documentContent?: string;
  onDocumentUpdate: (updatedContent: string) => void;
}

export type SubscriptionPlan = {
  name: string;
  price: number;
  messages: number;
  features: string[];
};

export interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: (plan: SubscriptionPlan) => void;
}

export interface MessageUsage {
  messageCount: number;
  subscription: Tables<'subscriptions'> | null;
}
