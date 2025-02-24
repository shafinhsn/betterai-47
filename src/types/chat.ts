
import type { Tables } from '@/integrations/supabase/database.types';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  documentState?: string;
}

export interface ChatProps {
  onSendMessage: (message: string, sender: 'user' | 'ai', documentState?: string) => void;
  messages: Message[];
  documentContent?: string;
  onDocumentUpdate: (updatedContent: string) => void;
  isAdmin?: boolean;
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
}

export interface MessageUsage {
  messageCount: number;
  dailyMessageCount: number;
  subscription: Tables<'subscriptions'> | null;
}
