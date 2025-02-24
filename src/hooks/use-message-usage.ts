
import { useState, useEffect } from 'react';
import type { Tables } from '@/integrations/supabase/database.types';
import type { MessageUsage } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser, getMessageUsage, getSubscription, updateDailyMessageCount, 
         createProfile, updateMessageUsage, createMessageUsage } from '@/utils/message-usage-db';
import { shouldResetDailyCount, calculateMessageCounts, calculateNewMessageCounts } from '@/utils/message-usage-utils';

export const useMessageUsage = (isAdmin: boolean = false): MessageUsage & {
  updateMessageCount: () => Promise<void>;
} => {
  const [messageCount, setMessageCount] = useState(0);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [subscription, setSubscription] = useState<Tables<'subscriptions'> | null>(null);
  const { toast } = useToast();

  const checkMessageUsage = async () => {
    try {
      if (isAdmin) {
        setMessageCount(0);
        setDailyMessageCount(0);
        return;
      }

      const user = await getCurrentUser();
      if (!user) return;

      const usage = await getMessageUsage(user.id);

      if (shouldResetDailyCount(usage?.last_daily_reset)) {
        await updateDailyMessageCount(user.id, 0, new Date().toISOString());
        setDailyMessageCount(0);
      } else {
        const counts = calculateMessageCounts(usage, subscription);
        setMessageCount(counts.messageCount);
        setDailyMessageCount(counts.dailyMessageCount);
      }
    } catch (error) {
      console.error('Error checking message usage:', error);
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
      const user = await getCurrentUser();
      if (!user) return;

      const sub = await getSubscription(user.id);
      setSubscription(sub);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const updateMessageCount = async () => {
    if (isAdmin) return;
    
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('No user found');

      // Ensure profile exists
      const usage = await getMessageUsage(user.id);
      if (!usage) {
        await createProfile(user.id);
      }

      if (!usage) {
        await createMessageUsage(user.id);
        setMessageCount(1);
        setDailyMessageCount(1);
      } else {
        const newCounts = calculateNewMessageCounts(usage, subscription);
        await updateMessageUsage(user.id, newCounts.messageCount, newCounts.dailyMessageCount);
        setMessageCount(newCounts.messageCount);
        setDailyMessageCount(newCounts.dailyMessageCount);
      }
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
    checkMessageUsage();
    checkSubscription();
  }, [isAdmin]);

  return {
    messageCount,
    dailyMessageCount,
    subscription,
    updateMessageCount
  };
};
