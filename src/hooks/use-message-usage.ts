
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

      const sub = await getSubscription(user.id);
      setSubscription(sub);

      const usage = await getMessageUsage(user.id);
      
      if (!usage) {
        await createMessageUsage(user.id);
        setMessageCount(0);
        setDailyMessageCount(0);
        return;
      }

      if (shouldResetDailyCount(usage.last_daily_reset)) {
        await updateDailyMessageCount(user.id, 0);
        const counts = calculateMessageCounts({ ...usage, daily_message_count: 0 }, sub);
        setMessageCount(counts.messageCount);
        setDailyMessageCount(0);
      } else {
        const counts = calculateMessageCounts(usage, sub);
        setMessageCount(counts.messageCount);
        setDailyMessageCount(counts.dailyMessageCount);
      }
    } catch (error) {
      console.error('Error checking message usage:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check message usage. Please try again.",
      });
    }
  };

  const updateMessageCount = async () => {
    if (isAdmin) return;
    
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('No user found');

      let usage = await getMessageUsage(user.id);
      
      if (!usage) {
        await createProfile(user.id);
        await createMessageUsage(user.id);
        usage = await getMessageUsage(user.id);
        if (!usage) throw new Error('Failed to create message usage');
      }

      if (shouldResetDailyCount(usage.last_daily_reset)) {
        await updateDailyMessageCount(user.id, 0);
        usage.daily_message_count = 0;
      }

      const newCounts = calculateNewMessageCounts(usage, subscription);
      await updateMessageUsage(user.id, newCounts.messageCount, newCounts.dailyMessageCount);
      
      setMessageCount(newCounts.messageCount);
      setDailyMessageCount(newCounts.dailyMessageCount);
      
    } catch (error) {
      console.error('Error updating message count:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update message count. Please try again.",
      });
      throw error;
    }
  };

  useEffect(() => {
    checkMessageUsage();
  }, [isAdmin]);

  return {
    messageCount,
    dailyMessageCount,
    subscription,
    updateMessageCount
  };
};
