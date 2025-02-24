
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/database.types';
import type { MessageUsage } from '@/types/chat';
import { 
  INITIAL_FREE_MESSAGES, 
  DAILY_FREE_MESSAGES, 
  DAILY_SUBSCRIPTION_LIMIT 
} from '@/constants/subscription';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'message_usage';

interface StoredMessageUsage {
  initialMessagesUsed: number;
  dailyMessageCount: number;
  lastDailyReset: string;
}

export const useMessageUsage = (isAdmin: boolean = false): MessageUsage & {
  updateMessageCount: () => Promise<void>;
} => {
  const [messageCount, setMessageCount] = useState(0);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [subscription, setSubscription] = useState<Tables<'subscriptions'> | null>(null);
  const { toast } = useToast();

  const loadStoredUsage = () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const usage: StoredMessageUsage = JSON.parse(storedData);
        const lastReset = new Date(usage.lastDailyReset);
        const now = new Date();
        
        // Check if we need to reset daily count
        if (lastReset.getDate() !== now.getDate() || 
            lastReset.getMonth() !== now.getMonth() || 
            lastReset.getFullYear() !== now.getFullYear()) {
          // Reset daily count
          usage.dailyMessageCount = 0;
          usage.lastDailyReset = now.toISOString();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
        }
        
        setMessageCount(usage.initialMessagesUsed);
        setDailyMessageCount(usage.dailyMessageCount);
      }
    } catch (error) {
      console.error('Error loading stored usage:', error);
      // Reset storage if corrupted
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const checkSubscription = async () => {
    if (isAdmin) {
      setSubscription({
        plan_type: 'Business Pro',
        status: 'active'
      } as Tables<'subscriptions'>);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      setSubscription(sub);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const updateMessageCount = async () => {
    if (isAdmin) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please sign in to continue.",
        });
        return;
      }

      let storedData = localStorage.getItem(STORAGE_KEY);
      let usage: StoredMessageUsage;

      if (!storedData) {
        usage = {
          initialMessagesUsed: 0,
          dailyMessageCount: 0,
          lastDailyReset: new Date().toISOString()
        };
      } else {
        usage = JSON.parse(storedData);
      }

      // Check if initial free messages are still available
      if (usage.initialMessagesUsed < INITIAL_FREE_MESSAGES) {
        usage.initialMessagesUsed++;
        setMessageCount(usage.initialMessagesUsed);
      } else {
        // Check subscription and daily limits
        const dailyLimit = subscription ? DAILY_SUBSCRIPTION_LIMIT : DAILY_FREE_MESSAGES;
        
        if (usage.dailyMessageCount >= dailyLimit) {
          toast({
            variant: "destructive",
            title: "Daily limit reached",
            description: subscription 
              ? `You've reached your daily limit of ${DAILY_SUBSCRIPTION_LIMIT} messages.`
              : `You've reached your daily limit of ${DAILY_FREE_MESSAGES} messages. Consider upgrading for more messages.`,
          });
          return;
        }

        usage.dailyMessageCount++;
        setDailyMessageCount(usage.dailyMessageCount);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
    } catch (error) {
      console.error('Error updating message count:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update message count. Please try again.",
      });
    }
  };

  useEffect(() => {
    loadStoredUsage();
    checkSubscription();
  }, [isAdmin]);

  return {
    messageCount,
    dailyMessageCount,
    subscription,
    updateMessageCount
  };
};

