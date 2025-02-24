
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/database.types';
import type { MessageUsage } from '@/types/chat';
import { DAILY_MESSAGE_LIMIT, FREE_TIER_LIMIT } from '@/constants/subscription';
import { useToast } from '@/hooks/use-toast';

export const useMessageUsage = (isAdmin: boolean = false): MessageUsage & {
  updateMessageCount: () => Promise<void>;
} => {
  const [messageCount, setMessageCount] = useState(0);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [subscription, setSubscription] = useState<Tables<'subscriptions'> | null>(null);
  const { toast } = useToast();

  const checkMessageUsage = async () => {
    if (isAdmin) return;

    try {
      const { data: usage, error } = await supabase
        .from('message_usage')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      // Check if we need to reset daily count
      const lastReset = usage?.last_daily_reset ? new Date(usage.last_daily_reset) : null;
      const now = new Date();
      const needsReset = !lastReset || 
        (lastReset.getDate() !== now.getDate() || 
         lastReset.getMonth() !== now.getMonth() || 
         lastReset.getFullYear() !== now.getFullYear());

      if (needsReset) {
        const { error: resetError } = await supabase
          .from('message_usage')
          .update({ 
            daily_message_count: 0,
            last_daily_reset: now.toISOString()
          })
          .eq('id', usage?.id || '');

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

  const ensureProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // If profile doesn't exist, create it and initialize message usage
      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;

        // Initialize message usage for new user
        const { error: usageError } = await supabase
          .from('message_usage')
          .insert([{
            user_id: user.id,
            message_count: 0,
            daily_message_count: 0,
            last_daily_reset: new Date().toISOString()
          }]);

        if (usageError) throw usageError;
      }

      return true;
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
      return false;
    }
  };

  const updateMessageCount = async () => {
    if (isAdmin) return;
    
    try {
      // Ensure profile exists before updating message count
      const profileExists = await ensureProfile();
      if (!profileExists) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to update message count. Please try again.",
        });
        return;
      }

      const { data: usage, error: selectError } = await supabase
        .from('message_usage')
        .select('*')
        .maybeSingle();

      if (selectError) throw selectError;

      // Check both lifetime and daily limits
      if (!subscription) {
        if (usage && usage.message_count >= FREE_TIER_LIMIT && usage.daily_message_count >= DAILY_FREE_MESSAGES) {
          toast({
            variant: "destructive",
            title: "Message limit reached",
            description: "You've reached both your lifetime and daily message limits. Consider upgrading to continue.",
          });
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (!usage) {
        const { error: insertError } = await supabase
          .from('message_usage')
          .insert([{ 
            message_count: 1,
            daily_message_count: 1,
            user_id: user.id,
            last_message_at: new Date().toISOString(),
            last_daily_reset: new Date().toISOString()
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
