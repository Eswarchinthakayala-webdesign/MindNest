import { useState, useEffect, useCallback } from 'react';
import supabase from '../utils/supabase';
import { useAuth } from '../context/auth-context';
import { toast } from 'sonner';

export const useJournals = (collectionId = null) => {
  const { user } = useAuth();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJournals = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      let query = supabase
        .from('journals')
        .select(`
          *,
          journal_moods (*),
          journal_tags (*),
          collections (title, color, icon)
        `)
        .order('created_at', { ascending: false });

      if (collectionId) {
        query = query.eq('collection_id', collectionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJournals(data || []);
    } catch (err) {
      setError(err);
      console.error('Error fetching journals:', err);
      toast.error('Failed to load journals');
    } finally {
      setLoading(false);
    }
  }, [user, collectionId]);

  // Read a single journal with full details
  const getJournalById = async (id) => {
    try {
      const { data, error } = await supabase
        .from('journals')
        .select(`
          *,
          journal_moods (*),
          journal_tags (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching journal details:', err);
      return null;
    }
  };

  const createJournal = async ({ title, content, plain_text, collection_id, mood, tags }) => {
    try {
      // 1. Create Journal
      const journalData = {
        user_id: user.id,
        collection_id,
        title,
        content,
        plain_text, 
      };

      const { data: journal, error: journalError } = await supabase
        .from('journals')
        .insert([journalData])
        .select()
        .single();

      if (journalError) throw journalError;

      // 2. Create Mood (if provided)
      if (mood) {
        const { error: moodError } = await supabase
          .from('journal_moods')
          .insert([{
            journal_id: journal.id,
            mood: mood.emoji ? `${mood.emoji} ${mood.label}` : mood.label,
            intensity: mood.intensity || 3
          }]);
        
        if (moodError) console.error("Error saving mood:", moodError);
      }

      // 3. Create Tags (if provided)
      if (tags && tags.length > 0) {
        const tagInserts = tags.map(tag => ({
          journal_id: journal.id,
          tag: tag
        }));
        
        const { error: tagsError } = await supabase
          .from('journal_tags')
          .insert(tagInserts);

        if (tagsError) console.error("Error saving tags:", tagsError);
      }

      toast.success('Journal entry saved');
      fetchJournals(); // Refresh list to get full joined data
      return journal;

    } catch (err) {
      console.error('Error creating journal:', err);
      toast.error('Failed to save journal');
      throw err;
    }
  };

  const updateJournal = async (id, { title, content, plain_text, mood, tags }) => {
    try {
      setLoading(true);
      
      // 1. Update main journal entry
      const { data, error } = await supabase
        .from('journals')
        .update({
          title,
          content,
          plain_text,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 2. Update Mood
      if (mood) {
        // Delete old mood
        await supabase
          .from('journal_moods')
          .delete()
          .eq('journal_id', id);

        // Insert new mood
        const { error: moodError } = await supabase
          .from('journal_moods')
          .insert([{
            journal_id: id,
            mood: mood.emoji ? `${mood.emoji} ${mood.label}` : mood.label,
            intensity: mood.intensity || 3
          }]);
        
        if (moodError) console.error("Error saving mood:", moodError);
      }

      // 3. Update Tags
      if (tags) {
        // Delete old tags
        await supabase
          .from('journal_tags')
          .delete()
          .eq('journal_id', id);

        // Insert new tags
        if (tags.length > 0) {
          const tagInserts = tags.map(tag => ({
            journal_id: id,
            tag: tag
          }));
          
          const { error: tagsError } = await supabase
            .from('journal_tags')
            .insert(tagInserts);

          if (tagsError) console.error("Error saving tags:", tagsError);
        }
      }
      
      setJournals((prev) => prev.map((j) => (j.id === id ? { ...j, ...data } : j)));
      toast.success('Journal updated');
      fetchJournals();
      return data;
    } catch (err) {
      console.error('Error updating journal:', err);
      toast.error('Failed to update journal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteJournal = async (id) => {
    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setJournals((prev) => prev.filter((j) => j.id !== id));
      toast.success('Journal deleted');
    } catch (err) {
      console.error('Error deleting journal:', err);
      toast.error('Failed to delete journal');
      throw err;
    }
  };

  const toggleFavorite = async (id, currentStatus) => {
    try {
        const { error } = await supabase
            .from('journals')
            .update({ is_favorite: !currentStatus })
            .eq('id', id);

        if (error) throw error;
        setJournals((prev) => prev.map((j) => (j.id === id ? { ...j, is_favorite: !currentStatus } : j)));
    } catch (err) {
        console.error('Error updating favorite status:', err);
        toast.error('Failed to update favorite');
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  return {
    journals,
    loading,
    error,
    createJournal,
    updateJournal,
    deleteJournal,
    toggleFavorite,
    getJournalById,
    refreshJournals: fetchJournals
  };
};
