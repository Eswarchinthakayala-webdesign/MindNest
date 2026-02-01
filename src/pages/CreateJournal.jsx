import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { useJournals } from '../hooks/use-journals';
import { useCollections } from '../hooks/use-collections';
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
  Folder,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'; 

const SUGGESTED_TAGS = ['Personal', 'Work', 'Ideas', 'Gratitude', 'Health', 'Goals', 'Reflection'];

const CreateJournal = () => {
  const { collectionId: paramCollectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createJournal } = useJournals();
  const { collections, createCollection } = useCollections();
  
  const [loading, setLoading] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState(paramCollectionId || '');
  
  const [title, setTitle] = useState('');
  const [value, setValue] = useState("");
  const [mood, setMood] = useState(null); // { emoji: string, labels: string[] }
  
  // Tag State
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isTagInputFocused, setIsTagInputFocused] = useState(false);
  
  // Emoji Picker State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);

  // New Collection Dialog State
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ title: '', description: '', color: 'bg-blue-500', icon: '📁' });
  const [showCollectionEmojiPicker, setShowCollectionEmojiPicker] = useState(false);
  const [creatingCollection, setCreatingCollection] = useState(false);

  useEffect(() => {
    if (paramCollectionId) {
        setSelectedCollectionId(paramCollectionId);
    }
    
    // Click outside to close emoji picker
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, [paramCollectionId]);

  const selectedCollection = collections.find(c => c.id === selectedCollectionId);

  const handleCreateCollection = async () => {
      if (!newCollection.title.trim()) {
        toast.error('Collection title is required');
        return;
      }
  
      try {
        setCreatingCollection(true);
        const data = await createCollection({
            title: newCollection.title,
            description: newCollection.description,
            color: newCollection.color,
            icon: newCollection.icon,
        });
  
        setIsCollectionDialogOpen(false);
        setSelectedCollectionId(data.id);
        setNewCollection({ title: '', description: '', color: 'bg-blue-500', icon: '📁' });
      } catch (error) {
        console.error('Error creating collection:', error);
      } finally {
        setCreatingCollection(false);
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

  const onCollectionEmojiClick = (emojiData) => {
    setNewCollection({ ...newCollection, icon: emojiData.emoji });
    setShowCollectionEmojiPicker(false);
  };

  const handleSave = async () => {
    // Validation
    const errors = [];
    if (!title.trim()) errors.push('Title');
    if (!value.trim()) errors.push('Content');
    if (!selectedCollectionId) errors.push('Collection');

    if (errors.length > 0) {
      toast.error(`Missing required fields: ${errors.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      
      await createJournal({
        title,
        content: { markdown: value }, 
        plain_text: value, 
        collection_id: selectedCollectionId,
        mood: mood, 
        tags: tags 
      });
      
      toast.success('Journal created successfully');
      navigate(`/dashboard/collections/${selectedCollectionId}`);
    } catch (error) {
      console.error('Error saving journal:', error);
      toast.error('Failed to save journal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between sticky top-0 z-30 bg-[#0c0a09]/80 backdrop-blur-md py-4 px-2 sm:px-0">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors group px-3 py-2 rounded-lg hover:bg-stone-900/50"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center gap-4">
             <div className="text-sm text-stone-500 hidden sm:flex items-center gap-2">
                Saving to 
                {selectedCollection ? (
                    <span className="flex items-center gap-1.5 text-stone-300 font-medium bg-stone-900 px-2 py-0.5 rounded-md border border-stone-800">
                        <span>{selectedCollection.icon}</span> {selectedCollection.title}
                    </span>
                ) : (
                    <span className="text-stone-300 font-medium italic">Unassigned</span>
                )}
             </div>
             <button
               onClick={handleSave}
               disabled={loading}
               className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
               <span>Save Entry</span>
             </button>
          </div>
        </div>

        {/* Main Editor Container */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
            
            {/* Left Column: Editor */}
            <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-6 sm:p-10 min-h-[70vh] flex flex-col">
                 <input
                    type="text"
                    placeholder="Entry Title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-4xl sm:text-5xl font-bold text-white placeholder-stone-700/50 focus:outline-none mb-8 tracking-tight font-display"
                    autoFocus
                 />

                 <div className="flex-1" data-color-mode="dark">
                    <MDEditor
                        value={value}
                        onChange={setValue}
                        style={{ backgroundColor: '#0f0f0f', minHeight: '500px' }}
                        preview="edit"
                        height="100%"
                        visibleDragbar={false}
                        className="!border-none custom-md-editor"
                        textareaProps={{
                            placeholder: "Start writing your thoughts here..."
                        }}
                    />
                 </div>
            </div>

            {/* Right Column: Metadata (Collection, Mood, Tags) */}
            <div className="space-y-6">

                {/* Collection Selector */}
                <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-stone-400 font-medium flex items-center gap-2">
                            <Folder className="w-4 h-4" /> Collection
                        </h3>
                        {/* Create Collection Dialog Trigger */}
                        <Dialog open={isCollectionDialogOpen} onOpenChange={setIsCollectionDialogOpen}>
                            <DialogTrigger asChild>
                                <button className="p-1.5 rounded-lg bg-stone-900 text-stone-400 hover:text-primary hover:bg-stone-800 transition-colors" title="New Collection">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="bg-stone-950 border-stone-800">
                                <DialogHeader>
                                    <DialogTitle className="text-white">Create New Collection</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="flex justify-center mb-4">
                                        <button 
                                          onClick={() => setShowCollectionEmojiPicker(!showCollectionEmojiPicker)}
                                          className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border-2 transition-all ${newCollection.color.replace('bg-', 'border-')} ${newCollection.color.replace('bg-', 'bg-').replace('500', '500')}/10`}
                                        >
                                          {newCollection.icon}
                                        </button>
                                        {showCollectionEmojiPicker && (
                                            <div className="absolute z-50 mt-20">
                                                <EmojiPicker onEmojiClick={onCollectionEmojiClick} theme="dark" width={300} height={350} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Color Selection */}
                                    <div className="flex justify-center gap-2 mb-4">
                                      {['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-stone-500'].map(color => (
                                        <button
                                          key={color}
                                          onClick={() => setNewCollection({ ...newCollection, color })}
                                          className={`w-6 h-6 rounded-full ${color} transition-all ${newCollection.color === color ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'}`}
                                        />
                                      ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Collection Title"
                                        value={newCollection.title}
                                        onChange={(e) => setNewCollection({ ...newCollection, title: e.target.value })}
                                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                                    />
                                    <textarea
                                        placeholder="Description (optional)"
                                        value={newCollection.description}
                                        onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary/50 h-24 resize-none"
                                    />
                                    <button
                                        onClick={handleCreateCollection}
                                        disabled={creatingCollection}
                                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                                    >
                                        {creatingCollection ? 'Creating...' : 'Create Collection'}
                                    </button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Select value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
                      <SelectTrigger className="bg-stone-900/50 border-stone-800 text-stone-200">
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-950 border-stone-800">
                        {collections.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              <span>{c.icon || '📁'}</span>
                              <span>{c.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                
                {/* Mood Section */}
                <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-6">
                    <h3 className="text-stone-400 font-medium mb-4 flex items-center gap-2">
                        <Smile className="w-4 h-4" /> Mood
                    </h3>
                    
                    <div className="relative" ref={emojiRef}>
                         <button 
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${mood ? 'bg-stone-800 border-stone-700 text-white' : 'bg-stone-900/50 border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-300'}`}
                         >
                            <span className="flex items-center gap-3 text-lg">
                                {mood ? (
                                    <>
                                        <span className="text-2xl">{mood.emoji}</span>
                                        <span className="font-medium capitalize">{mood.label}</span>
                                    </>
                                ) : (
                                    "How are you feeling?"
                                )}
                            </span>
                            <Smile className={`w-5 h-5 ${mood ? 'text-primary' : 'opacity-50'}`} />
                         </button>

                         <AnimatePresence>
                            {showEmojiPicker && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 right-0 mt-2 z-50"
                                >
                                    <div className="shadow-2xl rounded-2xl overflow-hidden ring-1 ring-stone-800 bg-[#0c0a09]">
                                        <EmojiPicker 
                                            onEmojiClick={onEmojiClick}
                                            theme="dark"
                                            width="100%"
                                            height={350}
                                            searchDisabled={false}
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
                <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-6">
                    <h3 className="text-stone-400 font-medium mb-4 flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Tags
                    </h3>

                    {/* Tag Input */}
                    <div className={`flex items-center gap-2 bg-stone-900/50 border rounded-xl px-3 py-2.5 mb-4 transition-all ${isTagInputFocused ? 'border-primary/50 ring-1 ring-primary/20' : 'border-stone-800'}`}>
                        <Hash className="w-4 h-4 text-stone-600" />
                        <input 
                            type="text" 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsTagInputFocused(true)}
                            onBlur={() => setIsTagInputFocused(false)}
                            placeholder="Add a tag..."
                            className="bg-transparent border-none focus:outline-none text-sm text-white w-full placeholder-stone-600"
                        />
                        <button 
                            onClick={() => handleAddTag(tagInput)}
                            disabled={!tagInput.trim()}
                            className="p-1.5 rounded-lg hover:bg-primary/20 text-primary disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Selected Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-800 border border-stone-700 rounded-full text-sm text-stone-200 group">
                                    {tag}
                                    <button 
                                        onClick={() => removeTag(tag)}
                                        className="text-stone-500 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Suggested Tags */}
                    <div>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Suggestions</p>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleAddTag(tag)}
                                    className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-400 hover:border-stone-700 hover:text-stone-200 transition-all hover:scale-105 active:scale-95"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default CreateJournal;

