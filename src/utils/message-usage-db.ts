
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/database.types';

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getMessageUsage = async (userId: string) => {
  const { data: usage, error } = await supabase
    .from('message_usage')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return usage;
};

export const getSubscription = async (userId: string) => {
  const { data: sub, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return sub;
};

export const updateDailyMessageCount = async (userId: string, count: number) => {
  const { error } = await supabase
    .from('message_usage')
    .update({ 
      daily_message_count: count,
      last_daily_reset: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) throw error;
};

export const createProfile = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .insert([{ 
      id: userId,
      created_at: new Date().toISOString()
    }]);

  if (error) throw error;
};

export const updateMessageUsage = async (userId: string, messageCount: number, dailyMessageCount: number) => {
  const { error } = await supabase
    .from('message_usage')
    .update({ 
      message_count: messageCount,
      daily_message_count: dailyMessageCount,
      last_message_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) throw error;
};

export const createMessageUsage = async (userId: string) => {
  const { error } = await supabase
    .from('message_usage')
    .insert([{ 
      message_count: 0,
      daily_message_count: 0,
      user_id: userId,
      last_message_at: new Date().toISOString(),
      last_daily_reset: new Date().toISOString()
    }]);

  if (error) throw error;
};
