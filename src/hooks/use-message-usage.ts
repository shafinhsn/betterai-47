
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

export const useMessageUsage = (isAdmin: boolean = false): MessageUsage & {
  updateMessageCount: () => Promise<void>;
} => {
  const [messageCount, setMessageCount] = useState(0);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [subscription, setSubscription] = useState<Tables<'subscriptions'> | null>(null);
  const { toast } = useToast();

  const loadMessageUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: usage, error } = await supabase
        .from('message_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (usage) {
        // Check if we need to reset daily count
        const lastReset = new Date(usage.last_daily_reset);
        const now = new Date();
        
        if (lastReset.getDate() !== now.getDate() || 
            lastReset.getMonth() !== now.getMonth() || 
            lastReset.getFullYear() !== now.getFullYear()) {
          // Reset daily count
          const { error: updateError } = await supabase
            .from('message_usage')
            .update({
              daily_message_count: 0,
              last_daily_reset: now.toISOString()
            })
            .eq('user_id', user.id);

          if (updateError) throw updateError;
          
          setDailyMessageCount(0);
        } else {
          setDailyMessageCount(usage.daily_message_count);
        }
        
        setMessageCount(usage.initial_messages_used);
      } else {
        // Create new usage record
        const { error: insertError } = await supabase
          .from('message_usage')
          .insert([{
            user_id: user.id,
            initial_messages_used: 0,
            daily_message_count: 0,
            last_daily_reset: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error loading message usage:', error);
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

      const { data: usage, error: usageError } = await supabase
        .from('message_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (usageError) throw usageError;

      if (usage.initial_messages_used < INITIAL_FREE_MESSAGES) {
        const { error: updateError } = await supabase
          .from('message_usage')
          .update({ initial_messages_used: usage.initial_messages_used + 1 })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        setMessageCount(usage.initial_messages_used + 1);
      } else {
        // Check subscription and daily limits
        const dailyLimit = subscription ? DAILY_SUBSCRIPTION_LIMIT : DAILY_FREE_MESSAGES;
        
        if (usage.daily_message_count >= dailyLimit) {
          toast({
            variant: "destructive",
            title: "Daily limit reached",
            description: subscription 
              ? `You've reached your daily limit of ${DAILY_SUBSCRIPTION_LIMIT} messages.`
              : `You've reached your daily limit of ${DAILY_FREE_MESSAGES} messages. Consider upgrading for more messages.`,
          });
          return;
        }

        const { error: updateError } = await supabase
          .from('message_usage')
          .update({ daily_message_count: usage.daily_message_count + 1 })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        setDailyMessageCount(usage.daily_message_count + 1);
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
    loadMessageUsage();
    checkSubscription();
  }, [isAdmin]);

  return {
    messageCount,
    dailyMessageCount,
    subscription,
    updateMessageCount
  };
};
