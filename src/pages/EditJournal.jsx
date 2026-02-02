import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { useJournals } from '../hooks/use-journals';
import DashboardLayout from '../layout/DashboardLayout';
import MDEditor from '@uiw/react-md-editor';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Smile, 
  Tag,
  X,
  Plus,
  Hash,
  Trash2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Slider } from '../components/ui/slider';
import { toast } from 'sonner';
import supabase from '../utils/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

const SUGGESTED_TAGS = ['Personal', 'Work', 'Ideas', 'Gratitude', 'Health', 'Goals', 'Reflection'];

const EditJournal = () => {
  const { collectionId, journalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getJournalById, updateJournal, deleteJournal } = useJournals();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collection, setCollection] = useState(null);
  const [journal, setJournal] = useState(null);
  
  const [title, setTitle] = useState('');
  const [value, setValue] = useState("");
  const [mood, setMood] = useState(null);
  const [intensity, setIntensity] = useState(3);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isTagInputFocused, setIsTagInputFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const emojiRef = useRef(null);

  useEffect(() => {
    if (journalId && collectionId) {
      fetchData();
    }
    
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [journalId, collectionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Collection
      const { data: colData, error: colError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();
      
      if (colError) throw colError;
      setCollection(colData);

      // Fetch Journal
      const journalData = await getJournalById(journalId);
      if (!journalData) {
        toast.error('Journal not found');
        navigate(`/dashboard/collections/${collectionId}`);
        return;
      }

      setJournal(journalData);
      setTitle(journalData.title);
      setValue(journalData.plain_text || "");
      
      if (journalData.journal_moods?.[0]) {
        const moodStr = journalData.journal_moods[0].mood;
        const parts = moodStr.split(' ');
        if (parts.length > 1 && parts[0].length <= 4) { // Likely an emoji
          setMood({
            emoji: parts[0],
            label: parts.slice(1).join(' ')
          });
        } else {
          setMood({
            emoji: null,
            label: moodStr
          });
        }
        setIntensity(journalData.journal_moods[0].intensity || 3);
      }

      if (journalData.journal_tags) {
        setTags(journalData.journal_tags.map(t => t.tag));
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Could not load journal details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (tagToAdd) => {
    const formattedTag = tagToAdd.trim();
    if (!formattedTag) return;
    if (tags.includes(formattedTag)) {
      toast.error('Tag already added');
      return;
    }
    if (tags.length >= 5) {
      toast.error('Maximum 5 tags allowed');
      return;
    }
    setTags([...tags, formattedTag]);
    setTagInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const onEmojiClick = (emojiData) => {
    setMood({
        emoji: emojiData.emoji,
        label: emojiData.names[0] || 'Mood' 
    });
    setShowEmojiPicker(false);
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await deleteJournal(journalId);
      navigate(`/dashboard/collections/${collectionId}`);
    } catch (error) {
      console.error('Error deleting journal:', error);
      toast.error('Failed to delete journal');
    } finally {
      setSaving(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !value.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      await updateJournal(journalId, {
        title,
        content: { markdown: value },
        plain_text: value,
        mood: mood ? { ...mood, intensity } : null,
        tags
      });
      navigate(`/dashboard/collections/${collectionId}/journal/${journalId}`);
    } catch (error) {
      console.error('Error updating journal:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-25 px-1 sm:px-0 overflow-x-hidden">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between sticky mb-2 z-30 bg-[#0c0a09]/80 backdrop-blur-md px-4 sm:px-0 -mx-4 sm:mx-0 border-b border-stone-800/50 sm:border-none">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors group py-2"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm sm:text-base">Back</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
             <div className="text-xs text-stone-500 hidden lg:block italic">
                Editing <span className="text-stone-300 font-medium">"{collection?.title || 'Collection'}"</span>
             </div>
             
             <button
               onClick={() => setShowDeleteDialog(true)}
               className="hidden lg:flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-500 hover:text-red-400 hover:border-red-900/50 transition-all font-medium"
               title="Delete Entry"
             >
               <Trash2 className="w-4 h-4" />
               <span className="hidden md:inline ml-2">Delete</span>
             </button>

             <button
               onClick={handleSave}
               disabled={saving}
               className="hidden lg:flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm uppercase tracking-wider"
             >
               {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               <span>{saving ? 'Saving...' : 'Update'}</span>
             </button>
          </div>
        </div>

        {/* Main Editor Container */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 sm:gap-8 w-full">
            
            {/* Left Column: Editor */}
            <div className="bg-stone-900/40 border border-stone-800 rounded-2xl sm:rounded-3xl p-4 sm:p-10 min-h-[500px] sm:min-h-[70vh] flex flex-col overflow-hidden w-full">
                 <input
                    type="text"
                    placeholder="Entry Title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-2xl sm:text-5xl font-black text-white placeholder-stone-800 focus:outline-none mb-6 sm:mb-8 tracking-tight font-display border-none p-0 overflow-hidden text-ellipsis"
                 />

                 <div className="flex-1 w-full overflow-hidden rounded-xl" data-color-mode="dark">
                    <MDEditor
                        value={value}
                        onChange={setValue}
                        style={{ 
                          backgroundColor: '#0f0f0f', 
                          minHeight: '400px',
                          width: '100%',
                          maxWidth: '100%'
                        }}
                        preview="edit"
                        height="100%"
                        visibleDragbar={false}
                        className="!border-none custom-md-editor w-full"
                    />
                 </div>
            </div>

            {/* Right Column: Metadata */}
            <div className="space-y-6 w-full h-fit lg:sticky lg:top-20">
                
                {/* Mood Section */}
                <div className="bg-stone-900/40 border border-stone-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6">
                    <h3 className="text-stone-500 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                        <Smile className="w-3.5 h-3.5 text-primary" /> Mood
                    </h3>
                    
                    <div className="relative" ref={emojiRef}>
                         <button 
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${mood ? 'bg-stone-800 border-stone-700 text-white' : 'bg-stone-900/50 border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-300'}`}
                         >
                            <span className="flex items-center gap-3 text-base">
                                {mood ? (
                                    <>
                                        <span className="text-xl">{mood.emoji}</span>
                                        <span className="font-bold capitalize">{mood.label}</span>
                                    </>
                                ) : (
                                    <span className="text-sm font-medium">How are you feeling?</span>
                                )}
                            </span>
                            <Smile className={`w-4 h-4 ${mood ? 'text-primary' : 'opacity-50'}`} />
                         </button>

                         {mood && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 space-y-4"
                            >
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-stone-500">
                                    <span>Intensity</span>
                                    <span className="text-primary">{intensity} / 5</span>
                                </div>
                                <Slider 
                                    value={[intensity]} 
                                    onValueChange={(val) => setIntensity(val[0])} 
                                    max={5} 
                                    min={1} 
                                    step={1}
                                    className="py-4"
                                />
                                <div className="flex justify-between text-[8px] text-stone-600 font-bold uppercase tracking-tighter">
                                    <span>Mild</span>
                                    <span>Strong</span>
                                </div>
                            </motion.div>
                         )}

                         <AnimatePresence>
                            {showEmojiPicker && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden"
                                >
                                    <div className="shadow-2xl rounded-2xl overflow-hidden ring-1 ring-stone-800 bg-[#0c0a09] w-full max-w-full">
                                        <EmojiPicker 
                                            onEmojiClick={onEmojiClick}
                                            theme="dark"
                                            width="100%"
                                            height={350}
                                            skinTonesDisabled
                                            previewConfig={{ showPreview: false }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                         </AnimatePresence>
                    </div>
                </div>

                {/* Tags Section */}
                <div className="bg-stone-900/40 border border-stone-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6">
                    <h3 className="text-stone-500 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-primary" /> Labels & Tags
                    </h3>

                    <div className={`flex items-center gap-2 bg-stone-900/50 border rounded-xl px-3 py-2.5 mb-4 transition-all ${isTagInputFocused ? 'border-primary/50 ring-1 ring-primary/20' : 'border-stone-800'}`}>
                        <Hash className="w-4 h-4 text-stone-700" />
                        <input 
                            type="text" 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsTagInputFocused(true)}
                            onBlur={() => setIsTagInputFocused(false)}
                            placeholder="Add tag..."
                            className="bg-transparent border-none focus:outline-none text-sm text-stone-200 w-full placeholder-stone-700"
                        />
                        <button 
                            onClick={() => handleAddTag(tagInput)}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors disabled:opacity-20"
                            disabled={!tagInput.trim()}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-800/50 border border-stone-700/50 rounded-lg text-xs font-bold text-stone-300 group">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="text-stone-500 hover:text-red-400 p-0.5">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleAddTag(tag)}
                                className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-[11px] font-medium text-stone-500 hover:border-stone-700 hover:text-stone-300 transition-all active:scale-95"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>

      {/* Mobile Floating Action Bar */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
          <div className="bg-[#0c0a09]/95 backdrop-blur-2xl border border-stone-800 rounded-2xl p-2.5 flex items-center justify-between px-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(-1)}
                  className="flex flex-col items-center gap-1 p-2 text-stone-500 hover:text-white transition-colors"
              >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Back</span>
              </motion.button>

              <div className="w-px h-6 bg-stone-800/50" />

              <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex flex-col items-center gap-1 p-2 text-stone-500 hover:text-red-400 transition-colors"
              >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Delete</span>
              </motion.button>
              
              <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95 transition-all"
              >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span className="uppercase text-[11px] font-black tracking-widest leading-none">{saving ? 'Saving' : 'Update'}</span>
              </motion.button>
          </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#0c0a09] border-stone-800 shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-red-500/10 text-red-500">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <AlertDialogTitle className="text-xl font-bold text-white">Permanently delete entry?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-stone-400 text-base leading-relaxed">
              This action cannot be undone. This will permanently delete your journal entry
              "<span className="text-stone-200 font-medium">{title}</span>" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-white rounded-xl py-6 transition-all">
              Keep Entry
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl py-6 shadow-lg shadow-red-500/20 transition-all border-none"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default EditJournal;
