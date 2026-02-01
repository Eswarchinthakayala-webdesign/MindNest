import { useState, useEffect, useCallback } from 'react';
import supabase from '../utils/supabase';
import { useAuth } from '../context/auth-context';
import { toast } from 'sonner';

export const useCollections = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (err) {
      setError(err);
      console.error('Error fetching collections:', err);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCollection = async (collectionData) => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .insert([{ ...collectionData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setCollections((prev) => [data, ...prev]);
      toast.success('Collection created');
      return data;
    } catch (err) {
      console.error('Error creating collection:', err);
      toast.error('Failed to create collection');
      throw err;
    }
  };

  const updateCollection = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCollections((prev) => prev.map((c) => (c.id === id ? data : c)));
      toast.success('Collection updated');
      return data;
    } catch (err) {
      console.error('Error updating collection:', err);
      toast.error('Failed to update collection');
      throw err;
    }
  };

  const deleteCollection = async (id) => {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCollections((prev) => prev.filter((c) => c.id !== id));
      toast.success('Collection deleted');
    } catch (err) {
      console.error('Error deleting collection:', err);
      toast.error('Failed to delete collection');
      throw err;
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    refreshCollections: fetchCollections
  };
};
