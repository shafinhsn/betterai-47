
import { supabase } from '@/integrations/supabase/client';

export const ensureProfile = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) throw profileError;

  if (!profile) {
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{ 
        id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (insertError) throw insertError;

    const { error: usageError } = await supabase
      .from('message_usage')
      .insert([{
        user_id: userId,
        message_count: 0,
        daily_message_count: 0,
        last_daily_reset: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }]);

    if (usageError) throw usageError;
  }

  return true;
};
