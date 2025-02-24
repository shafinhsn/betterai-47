
import { supabase } from '@/integrations/supabase/client';

export const fetchMessageUsage = async (userId: string) => {
  const { data: usage, error } = await supabase
    .from('message_usage')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching message usage:', error);
    return null;
  }

  return usage;
};

export const resetDailyCount = async (usageId: string) => {
  const { error } = await supabase
    .from('message_usage')
    .update({
      daily_message_count: 0,
      last_daily_reset: new Date().toISOString()
    })
    .eq('id', usageId);

  if (error) {
    console.error('Error resetting daily count:', error);
    throw error;
  }
};

export const createMessageUsage = async (userId: string) => {
  const { error } = await supabase
    .from('message_usage')
    .insert([{
      user_id: userId,
      message_count: 1,
      daily_message_count: 1,
      last_daily_reset: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error creating message usage:', error);
    throw error;
  }
};

export const updateMessageCount = async (usageId: string, currentCount: number, currentDailyCount: number) => {
  const { error } = await supabase
    .from('message_usage')
    .update({
      message_count: currentCount + 1,
      daily_message_count: currentDailyCount + 1
    })
    .eq('id', usageId);

  if (error) {
    console.error('Error updating message count:', error);
    throw error;
  }
};
