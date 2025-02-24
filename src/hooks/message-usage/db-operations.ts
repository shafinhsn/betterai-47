
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/database.types';

export const fetchMessageUsage = async (userId: string) => {
  const { data: usage, error } = await supabase
    .from('message_usage')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return usage;
};

export const resetDailyCount = async (usageId: string) => {
  const { error } = await supabase
    .from('message_usage')
    .update({ 
      daily_message_count: 0,
      last_daily_reset: new Date().toISOString()
    })
    .eq('id', usageId)
    .select()
    .single();

  if (error) throw error;
};

export const createMessageUsage = async (userId: string) => {
  const { error } = await supabase
    .from('message_usage')
    .insert([{ 
      user_id: userId,
      message_count: 1,
      daily_message_count: 1,
      last_message_at: new Date().toISOString(),
      last_daily_reset: new Date().toISOString(),
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
};

export const updateMessageCount = async (usageId: string, messageCount: number, dailyMessageCount: number) => {
  const { error } = await supabase
    .from('message_usage')
    .update({ 
      message_count: messageCount + 1,
      daily_message_count: dailyMessageCount + 1,
      last_message_at: new Date().toISOString()
    })
    .eq('id', usageId)
    .select()
    .single();

  if (error) throw error;
};
