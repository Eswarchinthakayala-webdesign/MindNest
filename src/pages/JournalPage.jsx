import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Smile, 
  Plus,
  Loader2,
  Tag,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  Book,
  Folder,
  Heart
} from 'lucide-react';
import { useJournals } from '../hooks/use-journals';
import { useCollections } from '../hooks/use-collections';
import DashboardLayout from '../layout/DashboardLayout';
import { format } from 'date-fns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from 'sonner';
import MDEditor from '@uiw/react-md-editor';

const JournalCard = ({ journal, onDelete, onClick, onToggleFavorite }) => {
  // Extract emoji and label from combined mood string
  const moodData = journal.journal_moods?.[0] ? (() => {
    const moodStr = journal.journal_moods[0].mood;
    const parts = moodStr.split(' ');
    if (parts.length > 1 && parts[0].length <= 4) {
      return { emoji: parts[0], label: parts.slice(1).join(' ') };
    }
    return { emoji: null, label: moodStr };
  })() : null;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className="group relative p-6 rounded-3xl bg-stone-900/40 border border-stone-800 hover:border-primary/40 hover:bg-stone-900/60 transition-all cursor-pointer overflow-hidden flex flex-col h-[300px] shadow-sm hover:shadow-2xl hover:shadow-primary/5"
    >
      <div className="flex justify-between items-start mb-4 shrink-0">
         <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest leading-none">
                {format(new Date(journal.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            {journal.collections && (
              <div className="flex items-center gap-1.5 pt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${journal.collections.color || 'bg-primary'}`} />
                  <span className="text-[11px] font-bold text-stone-400 truncate max-w-[120px]">
                      {journal.collections.title}
                  </span>
              </div>
            )}
         </div>
         
         <button 
           onClick={(e) => {
               e.stopPropagation();
               onDelete(journal);
           }}
           className="p-2 rounded-xl text-stone-600 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90"
         >
             <Trash2 className="w-4 h-4" />
         </button>
      </div>
      
      <h4 className="font-black text-xl text-white mb-3 group-hover:text-primary transition-colors line-clamp-1 shrink-0 tracking-tight">{journal.title}</h4>
      
      <div className="flex-1 overflow-hidden relative mb-4" data-color-mode="dark">
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-stone-900/90 to-transparent z-10 pointer-events-none" />
          <MDEditor.Markdown 
              source={journal.plain_text || "No content preview"} 
              style={{ 
                  backgroundColor: 'transparent', 
                  color: '#a8a29e', 
                  fontSize: '0.9rem', 
                  lineHeight: '1.6' 
              }}
              className="!bg-transparent text-stone-400"
          />
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mt-auto shrink-0 z-20 w-full">
          {moodData && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 border border-stone-700/50 text-xs font-bold text-stone-200">
                 {moodData.emoji && <span className="text-sm">{moodData.emoji}</span>}
                 <span className="uppercase tracking-tighter">{moodData.label}</span>
              </span>
          )}
          
          {journal.journal_tags && journal.journal_tags.length > 0 && (
               <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 text-[10px] font-bold text-primary border border-primary/10 uppercase tracking-wider">
                  <Tag className="w-3 h-3" /> {journal.journal_tags[0].tag}
                  {journal.journal_tags.length > 1 && <span>+{journal.journal_tags.length - 1}</span>}
               </span>
          )}

          <div className="ml-auto">
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onToggleFavorite(journal.id, journal.is_favorite);
               }}
               className={`p-2 rounded-full transition-all group/fav ${journal.is_favorite ? 'text-red-500 bg-red-500/10' : 'text-stone-600 hover:text-red-500 hover:bg-stone-800'}`}
             >
                <Heart className={`w-4 h-4 transition-transform group-active/fav:scale-75 ${journal.is_favorite ? 'fill-current' : ''}`} />
             </button>
          </div>
      </div>
    </motion.div>
  );
};

const JournalPage = () => {
  const navigate = useNavigate();
  const { journals, loading, deleteJournal: deleteJournalHook, toggleFavorite } = useJournals();
  const { collections } = useCollections();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Delete State
  const [journalToDelete, setJournalToDelete] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Derive unique moods and tags from journals
  const availableMoods = Array.from(new Set(journals.map(j => j.journal_moods?.[0]?.mood).filter(Boolean)));
  const availableTags = Array.from(new Set(journals.flatMap(j => j.journal_tags?.map(t => t.tag) || [])));

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredJournals = journals.filter(j => {
    const matchesSearch = searchQuery === '' || 
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.plain_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.journal_tags?.some(t => t.tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCollection = selectedCollection === 'all' || j.collection_id === selectedCollection;
    
    const matchesMood = selectedMood === 'all' || j.journal_moods?.[0]?.mood === selectedMood;
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(selectedTag => j.journal_tags?.some(t => t.tag === selectedTag));

    const matchesFavorite = !showFavoritesOnly || j.is_favorite;

    return matchesSearch && matchesCollection && matchesMood && matchesTags && matchesFavorite;
  });

  const clearFilters = () => {
    setSelectedCollection('all');
    setSelectedMood('all');
    setSelectedTags([]);
    setSearchQuery('');
    setShowFavoritesOnly(false);
  };

  const hasActiveFilters = selectedCollection !== 'all' || selectedMood !== 'all' || selectedTags.length > 0 || showFavoritesOnly;

  const handleDeleteClick = (journal) => {
      setJournalToDelete(journal);
      setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
      if (!journalToDelete) return;
      try {
          await deleteJournalHook(journalToDelete.id);
          setIsDeleteOpen(false);
          setJournalToDelete(null);
      } catch (error) {
          console.error('Error deleting journal:', error);
      }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-4">
                    <Book className="w-10 h-10 text-primary" />
                    My Journal
                </h1>
                <p className="text-stone-500 font-medium text-lg">
                    {journals.length} total entries captured in your MindNest.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600 group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search entries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-stone-900/50 border border-stone-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-stone-200 focus:outline-none focus:ring-1 focus:ring-primary/50 w-full md:w-64 transition-all"
                    />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-3 rounded-2xl border transition-all ${showFilters || hasActiveFilters ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'}`}
                >
                    <Filter className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-stone-900/40 border border-stone-800 rounded-[2.5rem] p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  
                  {/* Collection Filter */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                        <Folder className="w-3.5 h-3.5" /> Collection
                    </h4>
                    <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                      <SelectTrigger className="bg-stone-900/50 border-stone-800 text-stone-200">
                        <SelectValue placeholder="Select Collection" />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-950 border-stone-800">
                        <SelectItem value="all">All Collections</SelectItem>
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

                  {/* Mood Filter */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                        <Smile className="w-3.5 h-3.5" /> Mood
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => setSelectedMood('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMood === 'all' ? 'bg-primary text-primary-foreground' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                        >
                          All
                        </button>
                        {availableMoods.map(mood => (
                          <button 
                            key={mood}
                            onClick={() => setSelectedMood(mood)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMood === mood ? 'bg-primary text-primary-foreground' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                          >
                            {mood}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Tags Filter */}
                  <div className="space-y-4 lg:col-span-1">
                    <h4 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" /> Multi-Tag Filter
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                          <button 
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${selectedTags.includes(tag) ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-stone-900 border-stone-800 text-stone-500 hover:border-stone-700'}`}
                          >
                            # {tag}
                          </button>
                        ))}
                        {availableTags.length === 0 && <span className="text-xs text-stone-600 italic">No tags found</span>}
                    </div>

                    <div className="pt-4 border-t border-stone-800 mt-4">
                        <button
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${showFavoritesOnly ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'}`}
                        >
                            <span className="text-sm font-bold flex items-center gap-2">
                                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} /> 
                                Show Favorites Only
                            </span>
                            {showFavoritesOnly && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                        </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-stone-800/50">
                   <p className="text-xs text-stone-500">
                      Showing <span className="text-white font-bold">{filteredJournals.length}</span> of <span className="text-white font-bold">{journals.length}</span> entries
                   </p>
                   {hasActiveFilters && (
                    <button 
                      onClick={clearFilters}
                      className="text-xs font-black text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest"
                    >
                      Clear All Filters
                    </button>
                   )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journals Grid */}
        <div className="relative">
            {filteredJournals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-stone-900/20 border border-stone-800 border-dashed rounded-[2.5rem] text-center px-6">
                    <div className="w-20 h-20 rounded-full bg-stone-900 flex items-center justify-center mb-6 shadow-xl border border-stone-800">
                        <Book className="w-10 h-10 text-stone-700" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No entries found</h3>
                    <p className="text-stone-500 max-w-xs mb-8">
                        {searchQuery || hasActiveFilters ? "We couldn't find any entries matching your current filters." : "You haven't started your journey yet."}
                    </p>
                    {(searchQuery || hasActiveFilters) ? (
                        <button 
                          onClick={clearFilters}
                          className="px-8 py-3 rounded-2xl bg-stone-800 text-white font-black hover:bg-stone-700 transition-all"
                        >
                          Reset Filters
                        </button>
                    ) : (
                        <button 
                            onClick={() => navigate('/dashboard/collections')}
                            className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            Create Your First Entry
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredJournals.map((journal) => (
                            <JournalCard 
                                key={journal.id} 
                                journal={journal} 
                                onDelete={handleDeleteClick}
                                onClick={() => navigate(`/dashboard/collections/${journal.collection_id}/journal/${journal.id}`)}
                                onToggleFavorite={toggleFavorite}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
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
                "<span className="text-stone-200 font-medium">{journalToDelete?.title}</span>" and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-3">
              <AlertDialogCancel className="bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-white rounded-xl py-6 transition-all">
                Keep Entry
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl py-6 shadow-lg shadow-red-500/20 transition-all border-none"
              >
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default JournalPage;
