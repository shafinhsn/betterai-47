
import { Tables } from '@/integrations/supabase/database.types';
import { FREE_TIER_LIMIT, DAILY_MESSAGE_LIMIT } from '@/constants/subscription';

export const shouldResetDailyCount = (lastReset: string | null): boolean => {
  if (!lastReset) return true;
  
  const lastResetDate = new Date(lastReset);
  const now = new Date();
  
  return lastResetDate.getUTCDate() !== now.getUTCDate() || 
         lastResetDate.getUTCMonth() !== now.getUTCMonth() || 
         lastResetDate.getUTCFullYear() !== now.getUTCFullYear();
};

export const calculateMessageCounts = (
  usage: Tables<'message_usage'> | null,
  subscription: Tables<'subscriptions'> | null
) => {
  if (!usage) {
    return {
      dailyMessageCount: 0,
      messageCount: 0
    };
  }

  const dailyLimit = subscription ? DAILY_MESSAGE_LIMIT.creator : DAILY_MESSAGE_LIMIT.free;
  const dailyCount = Math.min(usage.daily_message_count || 0, dailyLimit);
  
  const totalCount = !subscription ? 
    Math.min(usage.message_count || 0, FREE_TIER_LIMIT) : 
    usage.message_count || 0;

  return {
    dailyMessageCount: dailyCount,
    messageCount: totalCount
  };
};

export const calculateNewMessageCounts = (
  currentUsage: Tables<'message_usage'> | null,
  subscription: Tables<'subscriptions'> | null
) => {
  const dailyLimit = subscription ? DAILY_MESSAGE_LIMIT.creator : DAILY_MESSAGE_LIMIT.free;
  
  if (!currentUsage) {
    return {
      messageCount: 1,
      dailyMessageCount: 1
    };
  }

  const newMessageCount = subscription ? 
    (currentUsage.message_count || 0) + 1 : 
    Math.min((currentUsage.message_count || 0) + 1, FREE_TIER_LIMIT);
  
  const newDailyMessageCount = Math.min((currentUsage.daily_message_count || 0) + 1, dailyLimit);

  return {
    messageCount: newMessageCount,
    dailyMessageCount: newDailyMessageCount
  };
};
