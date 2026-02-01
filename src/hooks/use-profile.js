import { useState } from 'react';
import supabase from '../utils/supabase';
import { useAuth } from '../context/auth-context';
import { toast } from 'sonner';

export const useProfile = () => {
  const { user, profile } = useAuth();
  const [updating, setUpdating] = useState(false);

  const updateProfile = async (updates) => {
    if (!user) return;
    try {
      setUpdating(true);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Profile updated successfully');
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return {
    profile,
    updateProfile,
    updating
  };
};
