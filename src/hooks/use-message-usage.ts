
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/database.types';
import type { MessageUsage } from '@/types/chat';

export const useMessageUsage = (): MessageUsage & {
  updateMessageCount: () => Promise<void>;
} => {
  const [messageCount, setMessageCount] = useState(0);
  const [subscription, setSubscription] = useState<Tables<'subscriptions'> | null>(null);

  const checkMessageUsage = async () => {
    try {
      const { data: usage, error } = await supabase
        .from('message_usage')
        .select('*')
        .maybeSingle();

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
        .maybeSingle();

      if (error) throw error;
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
        .maybeSingle();

      if (selectError) throw selectError;

      if (!usage) {
        const { error: insertError } = await supabase
          .from('message_usage')
          .insert([{ 
            message_count: 1,
            user_id: (await supabase.auth.getUser()).data.user?.id
          }]);
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from('message_usage')
          .update({ 
            message_count: usage.message_count + 1, 
            last_message_at: new Date().toISOString() 
          })
          .eq('id', usage.id);
        if (updateError) throw updateError;
      }

      setMessageCount(prev => prev + 1);
    } catch (error) {
      console.error('Error updating message count:', error);
    }
  };

  useEffect(() => {
    checkMessageUsage();
    checkSubscription();
  }, []);

  return {
    messageCount,
    subscription,
    updateMessageCount
  };
};
