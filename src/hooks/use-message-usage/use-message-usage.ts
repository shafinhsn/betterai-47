
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/database.types';
import { useToast } from '@/hooks/use-toast';
import { DAILY_MESSAGE_LIMIT, FREE_TIER_LIMIT, DAILY_FREE_MESSAGES } from '@/constants/subscription';
import { fetchMessageUsage, resetDailyCount, createMessageUsage, updateMessageCount } from './db-operations';
import { ensureProfile } from './profile-operations';
import { fetchSubscription, getAdminSubscription } from './subscription-operations';

export const useMessageUsage = (isAdmin: boolean = false) => {
  const [messageCount, setMessageCount] = useState(0);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [subscription, setSubscription] = useState<Tables<'subscriptions'> | null>(null);
  const { toast } = useToast();

  const checkMessageUsage = async () => {
    if (isAdmin) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const usage = await fetchMessageUsage(user.id);
      if (!usage) return;

      const lastReset = usage.last_daily_reset ? new Date(usage.last_daily_reset) : null;
      const now = new Date();
      const needsReset = !lastReset || 
        (lastReset.getDate() !== now.getDate() || 
         lastReset.getMonth() !== now.getMonth() || 
         lastReset.getFullYear() !== now.getFullYear());

      if (needsReset) {
        await resetDailyCount(usage.id);
        setDailyMessageCount(0);
      } else {
        setDailyMessageCount(usage.daily_message_count || 0);
      }

      setMessageCount(usage.message_count || 0);
    } catch (error) {
      console.error('Error checking message usage:', error);
    }
  };

  const checkSubscription = async () => {
    if (isAdmin) {
      setSubscription(getAdminSubscription());
      return;
    }

    try {
      const sub = await fetchSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleMessageUpdate = async () => {
    if (isAdmin) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to send messages.",
        });
        return;
      }

      const profileExists = await ensureProfile(user.id);
      if (!profileExists) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to update message count. Please try again.",
        });
        return;
      }

      const usage = await fetchMessageUsage(user.id);

      if (!subscription) {
        if (usage && usage.message_count >= FREE_TIER_LIMIT) {
          toast({
            variant: "destructive",
            title: "Message limit reached",
            description: "You've reached your lifetime message limit. Please upgrade to continue.",
          });
          return;
        }
        if (usage && usage.daily_message_count >= DAILY_FREE_MESSAGES) {
          toast({
            variant: "destructive",
            title: "Daily limit reached",
            description: "You've reached your daily message limit. Please try again tomorrow or upgrade to continue.",
          });
          return;
        }
      }

      if (!usage) {
        await createMessageUsage(user.id);
        setMessageCount(1);
        setDailyMessageCount(1);
      } else {
        await updateMessageCount(usage.id, usage.message_count || 0, usage.daily_message_count || 0);
        setMessageCount(prev => prev + 1);
        setDailyMessageCount(prev => prev + 1);
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
    updateMessageCount: handleMessageUpdate
  };
};
