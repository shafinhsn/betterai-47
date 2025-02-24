
import { supabase } from '@/integrations/supabase/client';

export const ensureProfile = async (userId: string): Promise<boolean> => {
  try {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return true;
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{ id: userId }]);

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error ensuring profile exists:', error);
    return false;
  }
};
