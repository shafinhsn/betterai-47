
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/database.types';
import type { MessageUsage } from '@/types/chat';
import { DAILY_MESSAGE_LIMIT, FREE_TIER_LIMIT } from '@/constants/subscription';

export const useMessageUsage = (isAdmin: boolean = false): MessageUsage & {
  updateMessageCount: () => Promise<void>;
} => {
  const [messageCount, setMessageCount] = useState(0);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [subscription, setSubscription] = useState<Tables<'subscriptions'> | null>(null);

  const checkMessageUsage = async () => {
    try {
      const { data: usage, error } = await supabase
        .from('message_usage')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      // Check if we need to reset daily count
      const lastReset = usage?.last_daily_reset ? new Date(usage.last_daily_reset) : null;
      const now = new Date();
      const needsReset = lastReset && 
        (lastReset.getDate() !== now.getDate() || 
         lastReset.getMonth() !== now.getMonth() || 
         lastReset.getFullYear() !== now.getFullYear());

      if (needsReset) {
        // Reset daily count if it's a new day
        const { error: resetError } = await supabase
          .from('message_usage')
          .update({ 
            daily_message_count: 0,
            last_daily_reset: now.toISOString()
          })
          .eq('id', usage.id);

        if (resetError) throw resetError;
        
        setDailyMessageCount(0);
      } else {
        setDailyMessageCount(usage?.daily_message_count || 0);
      }

      setMessageCount(usage?.message_count || 0);
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
      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('*')
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
      const { data: usage, error: selectError } = await supabase
        .from('message_usage')
        .select('*')
        .maybeSingle();

      if (selectError) throw selectError;

      // If user has a student subscription, only apply the 150 messages per day limit
      const isStudent = subscription?.plan_type === 'Student Plan' && subscription?.status === 'active';

      if (!usage) {
        const { error: insertError } = await supabase
          .from('message_usage')
          .insert([{ 
            message_count: 1,
            daily_message_count: 1,
            user_id: (await supabase.auth.getUser()).data.user?.id
          }]);
        if (insertError) throw insertError;
        
        setMessageCount(1);
        setDailyMessageCount(1);
      } else {
        const { error: updateError } = await supabase
          .from('message_usage')
          .update({ 
            message_count: usage.message_count + 1,
            daily_message_count: usage.daily_message_count + 1,
            last_message_at: new Date().toISOString()
          })
          .eq('id', usage.id);
        if (updateError) throw updateError;

        setMessageCount(prev => prev + 1);
        setDailyMessageCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating message count:', error);
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
