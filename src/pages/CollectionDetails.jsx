import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  MoreVertical, 
  Smile, 
  Plus,
  Loader2,
  FolderOpen,
  Tag,
  Trash2,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import supabase from '../utils/supabase';
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
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import MDEditor from '@uiw/react-md-editor';

const JournalCard = ({ journal, onDelete, onClick, onToggleFavorite }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className="group relative p-5 rounded-2xl bg-stone-900/40 border border-stone-800 hover:border-primary/30 hover:bg-stone-900/60 transition-all cursor-pointer overflow-hidden flex flex-col h-[280px]"
  >
    <div className="flex justify-between items-start mb-3 shrink-0">
       <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${journal.journal_moods?.[0]?.color || 'bg-primary'}`} />
          <span className="text-xs text-stone-500 font-medium">
            {format(new Date(journal.created_at), 'MMM d, yyyy • h:mm a')}
          </span>
       </div>
       
       <button 
         onClick={(e) => {
             e.stopPropagation();
             onDelete(journal);
         }}
         className="p-1.5 rounded-lg text-stone-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
       >
           <Trash2 className="w-4 h-4" />
       </button>
    </div>
    
    <h4 className="font-bold text-lg text-white mb-2 group-hover:text-primary transition-colors line-clamp-1 shrink-0">{journal.title}</h4>
    
    <div className="flex-1 overflow-hidden relative mb-4" data-color-mode="dark">
        {/* Gradient Mask for fade effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f0e0d] z-10 pointer-events-none" />
        
        <MDEditor.Markdown 
            source={journal.plain_text || journal.content?.slice(0, 100) || "No content preview"} 
            style={{ 
                backgroundColor: 'transparent', 
                color: '#a8a29e', 
                fontSize: '0.875rem', 
                lineHeight: '1.5' 
            }}
            className="!bg-transparent text-stone-400"
        />
    </div>
    
    <div className="flex flex-wrap items-center gap-2 mt-auto shrink-0 z-20 w-full">
        {journal.journal_moods?.[0] && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 text-xs text-stone-300 border border-stone-700/50">
               <Smile className="w-3 h-3 text-amber-400" /> {journal.journal_moods[0].mood}
            </span>
        )}
        
        {journal.journal_tags && journal.journal_tags.length > 0 && journal.journal_tags.slice(0, 2).map((tagItem) => (
             <span key={tagItem.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800/50 text-xs text-stone-400 border border-stone-700/50">
                <Tag className="w-3 h-3" /> {tagItem.tag}
             </span>
        ))}
        {journal.journal_tags && journal.journal_tags.length > 2 && (
             <span className="text-xs text-stone-500">+{journal.journal_tags.length - 2} more</span>
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

const CollectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collection, setCollection] = useState(null);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Delete State
  const [deleteJournal, setDeleteJournal] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Collection Details
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();
      
      if (collectionError) throw collectionError;
      setCollection(collectionData);

      // Fetch Journals for this collection
      const { data: journalsData, error: journalsError } = await supabase
        .from('journals')
        .select(`
            *,
            journal_moods (*),
            journal_tags (*)
        `)
        .eq('collection_id', id)
        .order('created_at', { ascending: false });

      if (journalsError) throw journalsError;
      setJournals(journalsData || []);

    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (journal) => {
      setDeleteJournal(journal);
      setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
      if (!deleteJournal) return;
      try {
          const { error } = await supabase
              .from('journals')
              .delete()
              .eq('id', deleteJournal.id);
          
          if (error) throw error;
          
          setJournals(journals.filter(j => j.id !== deleteJournal.id));
          toast.success('Journal entry deleted');
          setIsDeleteOpen(false);
          setDeleteJournal(null);
      } catch (error) {
          console.error('Error deleting journal:', error);
          toast.error('Failed to delete journal');
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!collection) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h2 className="text-xl font-bold text-white mb-2">Collection Not Found</h2>
            <button onClick={() => navigate('/dashboard/collections')} className="text-primary hover:underline">
                Return to Collections
            </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Header Navigation */}
        <button 
            onClick={() => navigate('/dashboard/collections')}
            className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors group"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Collections</span>
        </button>

        {/* Collection Info Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 p-8 sm:p-10">
            <div className={`absolute top-0 left-0 w-full h-1 ${collection.color || 'bg-primary'}`} />
            <div className="absolute top-0 right-0 p-8 opacity-5">
                {collection.icon ? (
                    <span className="text-9xl grayscale">{collection.icon}</span>
                ) : (
                    <FolderOpen className="w-64 h-64 text-white" />
                )}
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-6">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl ${collection.color?.replace('bg-', 'bg-') || 'bg-stone-800'}/20 border border-stone-700/50 backdrop-blur-md`}>
                    {collection.icon || <FolderOpen className={`w-8 h-8 ${collection.color?.replace('bg-', 'text-') || 'text-primary'}`} />}
                </div>
                
                <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
                        {collection.title}
                    </h1>
                    <p className="text-stone-400 max-w-2xl text-lg leading-relaxed">
                        {collection.description || 'No description provided for this collection.'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-stone-900/50 border border-stone-800 backdrop-blur-sm">
                        <span className="text-2xl font-bold text-white block text-center">{journals.length}</span>
                        <span className="text-xs text-stone-500 uppercase tracking-wider font-bold">Entries</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Journals Grid */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-stone-500" /> 
                    Journal Entries
                </h2>
                <button 
                    onClick={() => navigate(`/dashboard/collections/${id}/new`)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
                >
                    <Plus className="w-4 h-4" /> New Entry
                </button>
            </div>

            {journals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-stone-900/20 border border-stone-800 border-dashed rounded-2xl">
                    <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center mb-4">
                        <FolderOpen className="w-8 h-8 text-stone-600" />
                    </div>
                    <p className="text-stone-400 font-medium">No entries in this collection yet.</p>
                    <p className="text-stone-600 text-sm mb-4">Start writing directly here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {journals.map((journal) => (
                        <JournalCard 
                           key={journal.id} 
                           journal={journal} 
                           onDelete={handleDeleteClick}
                           onClick={() => navigate(`/dashboard/collections/${id}/journal/${journal.id}`)}
                           onToggleFavorite={toggleFavorite}
                        />
                    ))}
                </div>
            )}
        </div>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="bg-[#050505]/95 border-stone-800/50 backdrop-blur-xl p-0 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <AlertDialogHeader className="mb-2">
                    <AlertDialogTitle className="text-xl font-bold text-white tracking-tight">Delete Entry?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription className="text-stone-400 text-sm leading-relaxed">
                    You are about to delete <span className="text-white font-semibold">"{deleteJournal?.title}"</span>.
                    <br /><br />
                    <span className="block p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-200/80 text-xs">
                      <strong className="text-red-400 block mb-1 uppercase tracking-wider text-[10px] font-bold">Warning</strong>
                      This action cannot be undone.
                    </span>
                  </AlertDialogDescription>
                </div>
              </div>
            </div>
            <AlertDialogFooter className="bg-stone-900/50 p-4 border-t border-stone-800/50 flex items-center gap-3">
              <AlertDialogCancel className="bg-transparent border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white hover:border-stone-600 transition-all">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20 border border-red-500/50 transition-all hover:scale-105 active:scale-95">
                Delete Entry
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </DashboardLayout>
  );
};

export default CollectionDetails;
