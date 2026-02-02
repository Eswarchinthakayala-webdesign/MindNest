import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { useJournals } from '../hooks/use-journals';
import DashboardLayout from '../layout/DashboardLayout';
import MDEditor from '@uiw/react-md-editor';
import { 
  ArrowLeft, 
  Calendar, 
  Smile, 
  Tag, 
  Clock, 
  Edit3, 
  ChevronLeft,
  Heart,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const ViewJournal = () => {
  const { collectionId, journalId } = useParams();
  const navigate = useNavigate();
  const { getJournalById, toggleFavorite } = useJournals();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    if (journalId) {
      fetchJournal();
    }
  }, [journalId]);

  useEffect(() => {
    const handleScroll = () => {
      // Threshold for showing simplified header
      setIsScrolled(window.scrollY > 100);
      
      // Calculate reading progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchJournal = async () => {
    try {
      setLoading(true);
      const data = await getJournalById(journalId);
      if (data) {
        // Parse mood if it exists
        if (data.journal_moods?.[0]) {
          const moodStr = data.journal_moods[0].mood;
          const parts = moodStr.split(' ');
          if (parts.length > 1 && parts[0].length <= 4) {
            data.journal_moods[0].emoji = parts[0];
            data.journal_moods[0].moodLabel = parts.slice(1).join(' ');
          } else {
            data.journal_moods[0].emoji = null;
            data.journal_moods[0].moodLabel = moodStr;
          }
          data.journal_moods[0].intensity = data.journal_moods[0].intensity || 3;
        }
        setJournal(data);
      } else {
        toast.error('Journal entry not found');
        navigate(`/dashboard/collections/${collectionId}`);
      }
    } catch (error) {
      console.error('Error fetching journal:', error);
      toast.error('Could not load journal');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!journal) return;
    try {
      await toggleFavorite(journal.id, journal.is_favorite);
      setJournal(prev => ({ ...prev, is_favorite: !prev.is_favorite }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-8 p-6 sm:p-8">
            <div className="flex gap-2">
                <div className="h-10 w-10 bg-stone-900 rounded-xl animate-pulse" />
                <div className="h-10 w-32 bg-stone-900 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-4">
                <div className="h-16 w-full bg-stone-900 rounded-2xl animate-pulse" />
                <div className="h-16 w-2/3 bg-stone-900 rounded-2xl animate-pulse" />
            </div>
            <div className="space-y-4 pt-8">
                <div className="h-4 w-full bg-stone-900/50 rounded animate-pulse" />
                <div className="h-4 w-full bg-stone-900/50 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-stone-900/50 rounded animate-pulse" />
            </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!journal) return null;

  return (
    <DashboardLayout>
      <div className="relative min-h-screen">
        {/* Scroll Progress Indicator (Bottom Right) */}
        <AnimatePresence>
            {isScrolled && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="fixed bottom-28 lg:bottom-10 right-6 z-[60] flex flex-col items-center gap-2"
                >
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-stone-900/80 backdrop-blur-2xl border border-stone-800 shadow-2xl">
                        {/* Circular Progress SVG */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="40%"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-stone-800"
                            />
                            <motion.circle
                                cx="50%"
                                cy="50%"
                                r="40%"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                className="text-primary"
                                style={{ 
                                    pathLength: readingProgress / 100,
                                    transition: { type: "spring", stiffness: 50, damping: 20 }
                                }}
                            />
                        </svg>
                        <span className="relative z-10 text-[10px] sm:text-xs font-black text-white">
                            {Math.min(100, Math.max(0, Math.round(readingProgress)))}%
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 lg:pb-8">
            
            {/* Dynamic Sticky Header */}
            <div className={`sticky top-18 sm:top-16 z-50  -mx-4 px-4 sm:mx-0 sm:px-0 border-b transition-all rounded-xl duration-300 ${isScrolled ? 'border-stone-800  bg-[#0c0a09]/80 backdrop-blur-2xl  py-3 shadow-2xl' : 'border-transparent'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-10 h-10 text-stone-400 hover:text-white transition-all bg-stone-900/50 border border-stone-800 rounded-xl backdrop-blur-md"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </motion.button>

                        <AnimatePresence mode="wait">
                            {!isScrolled ? (
                                <motion.span 
                                    key="back-text"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="hidden sm:block text-stone-500 font-medium text-sm lg:text-base"
                                >
                                    Collection / Journal
                                </motion.span>
                            ) : (
                                <motion.div 
                                    key="scrolled-info"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-col min-w-0 overflow-hidden"
                                >
                                    <h2 className="text-white font-bold truncate text-sm sm:text-base leading-tight pr-4">
                                        {journal.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-stone-400 font-bold bg-stone-900/50 border border-stone-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                                            <Calendar className="w-3 h-3 text-stone-500" />
                                            {format(new Date(journal.created_at), 'MMM d, yyyy')}
                                        </span>
                                        {journal.journal_moods?.[0] && (
                                            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-amber-500 font-black bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-tighter">
                                                <span className="text-sm leading-none">{journal.journal_moods[0].emoji || '😊'}</span>
                                                {journal.journal_moods[0].moodLabel || journal.journal_moods[0].mood}
                                                <span className="ml-1 opacity-50 px-1 border border-amber-500/30 rounded text-xs select-none">{journal.journal_moods[0].intensity}</span>
                                            </span>
                                        )}
                                        {journal.journal_tags?.slice(0, 3).map(tag => (
                                            <span key={tag.id} className="hidden md:inline-flex items-center gap-1 text-[10px] text-primary font-bold bg-primary/5 border border-primary/20 px-2 py-0.5 rounded-full">
                                                <Tag className="w-2.5 h-2.5" />
                                                {tag.tag}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Desktop-only Actions */}
                    <div className="flex items-center gap-3">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleToggleFavorite}
                            className={`p-2.5 rounded-xl border transition-all ${
                                journal.is_favorite 
                                ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                            }`}
                        >
                            <Heart className={`w-5 h-5 ${journal.is_favorite ? 'fill-current' : ''}`} />
                        </motion.button>
                        <button 
                            onClick={() => navigate(`/dashboard/collections/${collectionId}/edit/${journalId}`)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span className='hidden sm:block'>Edit Entry</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                
                {/* Journal Content Column */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Header Section */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-wrap items-center gap-3"
                            >
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-900 border border-stone-800 text-stone-400 text-xs sm:text-sm font-medium">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    {format(new Date(journal.created_at), 'MMMM d, yyyy')}
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-900 border border-stone-800 text-stone-400 text-xs sm:text-sm font-medium">
                                    <Clock className="w-4 h-4 text-primary" />
                                    {format(new Date(journal.created_at), 'h:mm a')}
                                </div>
                            </motion.div>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight"
                            >
                                {journal.title}
                            </motion.h1>
                        </div>

                        {/* Mobile Mood & Tags (Visual Highlight) */}
                        <div className="lg:hidden flex flex-wrap items-center gap-3">
                            {journal.journal_moods?.[0] && (
                                <motion.div 
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl"
                                >
                                    <span className="text-3xl">{journal.journal_moods[0].emoji || '😊'}</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Today's Mood</span>
                                        <span className="font-bold text-white capitalize">{journal.journal_moods[0].moodLabel || journal.journal_moods[0].mood}</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-stone-800 via-stone-800/20 to-transparent w-full" />

                    {/* Entry Content */}
                    <motion.article 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="prose prose-stone prose-invert max-w-none prose-lg md:prose-xl leading-relaxed sm:leading-loose selection:bg-primary/30" 
                        data-color-mode="dark"
                    >
                        <MDEditor.Markdown 
                            source={journal.plain_text || "No content provided."}
                            style={{ 
                                backgroundColor: 'transparent', 
                                color: '#e7e5e4',
                                fontSize: 'inherit'
                            }}
                            className="!bg-transparent text-stone-300"
                        />
                    </motion.article>
                </div>

                {/* Sidebar Desktop */}
                <aside className="lg:col-span-4 space-y-6">
                    <div className="sticky top-28 space-y-6">
                        
                        {/* Mood Card */}
                        {journal.journal_moods?.[0] && (
                            <div className="hidden lg:block group relative bg-stone-900/40 border border-stone-800 rounded-3xl p-8 overflow-hidden hover:border-primary/20 transition-all duration-500">
                                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110">
                                    <span className="text-[150px]">{journal.journal_moods[0].emoji || '😊'}</span>
                                </div>
                                <h3 className="text-stone-500 font-bold uppercase tracking-widest text-[10px] mb-6">Current Mood</h3>
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-20 h-20 rounded-3xl bg-stone-800/50 border border-stone-700/50 flex items-center justify-center text-5xl shadow-2xl backdrop-blur-sm">
                                        {journal.journal_moods[0].emoji || '😊'}
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white capitalize tracking-tight">{journal.journal_moods[0].moodLabel || journal.journal_moods[0].mood}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <div 
                                                        key={i} 
                                                        className={`w-1.5 h-1.5 rounded-full ${i < journal.journal_moods[0].intensity ? 'bg-amber-500' : 'bg-stone-700'}`} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest leading-none">
                                                Level {journal.journal_moods[0].intensity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Labels Card */}
                        <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-8">
                            <h3 className="text-stone-500 font-bold uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5 text-primary" /> Labels & Tags
                            </h3>
                            {journal.journal_tags && journal.journal_tags.length > 0 ? (
                                <div className="flex flex-wrap gap-2.5">
                                    {journal.journal_tags.map(tag => (
                                        <span key={tag.id} className="px-4 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-300 text-sm hover:border-primary/40 hover:text-primary transition-all cursor-default flex items-center gap-2 group">
                                            <div className="w-1 h-1 rounded-full bg-stone-600 group-hover:bg-primary transition-colors" />
                                            {tag.tag}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-stone-600 text-sm italic">No tags associated with this entry.</p>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-6 text-center group hover:border-stone-700 transition-colors">
                                <h3 className="text-stone-500 font-bold uppercase tracking-widest text-[10px] mb-2 group-hover:text-stone-400">Words</h3>
                                <p className="text-3xl font-black text-white">{(journal.plain_text?.split(/\s+/).filter(x => x).length) || 0}</p>
                            </div>
                            <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-6 text-center group hover:border-stone-700 transition-colors">
                                <h3 className="text-stone-500 font-bold uppercase tracking-widest text-[10px] mb-2 group-hover:text-stone-400">Chars</h3>
                                <p className="text-3xl font-black text-white">{(journal.plain_text?.length) || 0}</p>
                            </div>
                        </div>

                        {/* Stats Summary for Mobile (Shown only if needed) */}
                        <div className="lg:hidden bg-stone-900/40 border border-stone-800 rounded-3xl p-6 flex flex-col gap-4">
                             <div className="flex items-center justify-between">
                                  <h3 className="text-stone-500 font-bold uppercase tracking-widest text-[10px]">Journal Stats</h3>
                                  <span className="text-xs text-stone-500">{format(new Date(journal.created_at), 'MMM d, yyyy')}</span>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {journal.journal_tags?.map(tag => (
                                    <span key={tag.id} className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 text-xs">
                                        # {tag.tag}
                                    </span>
                                ))}
                             </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>

        {/* Mobile Floating Action Bar */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
            <div className="bg-[#0c0a09]/95 backdrop-blur-2xl border border-stone-800 rounded-2xl p-3 flex items-center justify-evenly shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleFavorite}
                    className={`flex flex-col items-center gap-1.5 p-2 transition-colors ${
                        journal.is_favorite ? 'text-red-500' : 'text-stone-400 hover:text-white'
                    }`}
                >
                    <Heart className={`w-5 h-5 ${journal.is_favorite ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Like</span>
                </motion.button>
                
                <div className="w-px h-8 bg-stone-800" />
                
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(`/dashboard/collections/${collectionId}/edit/${journalId}`)}
                    className="flex items-center gap-4 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20"
                >
                    <Edit3 className="w-5 h-5" />
                    <span className="uppercase text-xs tracking-widest leading-none">Edit</span>
                </motion.button>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewJournal;
