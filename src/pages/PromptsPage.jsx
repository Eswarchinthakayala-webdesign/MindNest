import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Heart, 
  Zap, 
  MessageSquare, 
  ArrowRight,
  RefreshCw,
  Smile,
  Frown,
  Zap as AnxiousIcon,
  Moon,
  Target,
  Quote
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import { usePrompts } from '../hooks/use-prompts';
import { toast } from 'sonner';

const DEEP_THOUGHTS = [
    "If your life was a book, what would the current chapter be titled?",
    "What does 'freedom' mean to you in your current stage of life?",
    "Are you being the person you needed when you were younger?",
    "Is it better to be respected or to be liked?",
    "If you could have a 30-minute conversation with your future self, what would you ask?",
    "What is the difference between living and existing?",
    "What is the one thing you would change about the world?",
    "If you could have dinner with anyone, dead or alive, who would it be?",
    "What is the most important lesson you have learned in life?",
    "What is your biggest regret?",
    "What makes you truly happy?",
    "What is your definition of success?",
    "How do you want to be remembered?",
    "What is the one thing you are most grateful for?",
    "What is the biggest risk you have ever taken?",
    "What is the best piece of advice you have ever received?",
    "What is the one thing you would tell your younger self?",
    "What is your purpose in life?",
    "What is the meaning of life?",
    "What is the one thing you would do if you knew you could not fail?"
  ];



const MOODS = [
  { label: 'Happy', icon: <Smile className="w-4 h-4" />, color: 'from-amber-400 to-orange-500' },
  { label: 'Sad', icon: <Frown className="w-4 h-4" />, color: 'from-blue-400 to-indigo-500' },
  { label: 'Anxious', icon: <AnxiousIcon className="w-4 h-4" />, color: 'from-purple-400 to-pink-500' },
  { label: 'Neutral', icon: <Moon className="w-4 h-4" />, color: 'from-stone-400 to-stone-500' },
  { label: 'Ambitious', icon: <Zap className="w-4 h-4" />, color: 'from-yellow-400 to-amber-500' }
];

const PromptsPage = () => {
  const navigate = useNavigate();
  const { prompts, loading } = usePrompts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('All');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorite_prompts');
    return saved ? JSON.parse(saved) : [];
  });
  const [randomThought, setRandomThought] = useState({ text: DEEP_THOUGHTS[0] || "Reflect deeply.", author: "MindNest" });
  const [isRotating, setIsRotating] = useState(false);

  // Daily Prompt Logic (changes based on date)
  const dailyPrompt = useMemo(() => {
    if (!prompts.length) return null;
    const index = new Date().getDate() % prompts.length;
    return prompts[index];
  }, [prompts]);

  useEffect(() => {
    localStorage.setItem('favorite_prompts', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    handleRandomize();
  }, []);

  const handleRandomize = async () => {
    setIsRotating(true);
    try {
      const useZen = Math.random() > 0.5;
      
      if (useZen) {
        // Reduced timeout for better UX
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://zenquotes.io/api/random'), {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error('Proxy error');
        
        const data = await res.json();
        const quote = JSON.parse(data.contents)[0];
        setRandomThought({ text: quote.q, author: quote.a });
      } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch('https://api.adviceslip.com/advice', {
             signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error('API error');

        const data = await res.json();
        setRandomThought({ text: data.slip.advice, author: "Daily Advice" });
      }
    } catch (error) {
      // Silent fallback nicely handles offline/network errors
      const randomLocal = DEEP_THOUGHTS[Math.floor(Math.random() * DEEP_THOUGHTS.length)];
      setRandomThought({ text: randomLocal, author: "MindNest" });
    } finally {
      setTimeout(() => setIsRotating(false), 600);
    }
  };

  const toggleFavorite = (e, prompt) => {
    e.stopPropagation();
    if (favorites.some(f => f.id === prompt.id)) {
      setFavorites(favorites.filter(f => f.id !== prompt.id));
      toast.info('Removed from favorites');
    } else {
      setFavorites([...favorites, prompt]);
      toast.success('Added to favorites');
    }
  };

  const usePrompt = (text) => {
    if (!text) return;
    navigate(`/dashboard/journal/new?prompt=${encodeURIComponent(text)}`);
  };

  const filteredPrompts = prompts.filter(p => {
    if (!p || !p.text) return false;
    const matchesSearch = p.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMood = selectedMood === 'All' || (p.mood && p.mood.toLowerCase() === selectedMood.toLowerCase());
    return matchesSearch && matchesMood;
  });

  if (loading) {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-[70vh]">
                <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse" />
                    <RefreshCw className="w-12 h-12 text-primary animate-spin relative z-10" />
                </div>
            </div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl overflow-hidden mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8 md:pt-0">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    <span>Creative Engine</span>
                </div>
                <h1 className="text-2xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight break-words max-w-full">
                    Prompts <span className="text-stone-500">Library</span>
                </h1>
                <p className="text-stone-400 font-medium text-sm sm:text-lg max-w-full leading-relaxed break-words">
                    Curated triggers to unlock your subconscious and fuel deep self-reflection.
                </p>
            </div>
            
            <div className="w-full md:w-auto">
                <div className="relative group w-full md:w-80">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-amber-600/50 rounded-2xl blur opacity-20 group-focus-within:opacity-100 transition duration-500" />
                    <div className="relative flex items-center bg-[#0c0a09] border border-stone-800 rounded-2xl p-1 shadow-2xl">
                        <Search className="w-5 h-5 text-stone-500 ml-3" />
                        <input 
                            type="text"
                            placeholder="Find inspiration..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none w-full p-3 text-sm text-stone-200 focus:outline-none placeholder:text-stone-600 font-medium"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Featured Section (Daily Prompt & Deep Thought) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-auto lg:h-[450px]">
            
            {/* Daily Prompt Card */}
            <div className="lg:col-span-7 h-full">
                {dailyPrompt ? (
                    <motion.div 
                        whileHover={{ scale: 1.005 }}
                        className="relative h-full overflow-hidden group rounded-[2rem] sm:rounded-[2.5rem] bg-[#0c0a09] border border-stone-800 p-6 sm:p-12 flex flex-col shadow-2xl min-h-[300px] sm:min-h-[350px]"
                    >
                        {/* Dynamic Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-amber-900/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:bg-primary/30 transition-all duration-700" />
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                        <Zap className="w-5 h-5 fill-current" />
                                    </div>
                                    <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Daily Focus</span>
                                </div>
                                <span className="text-stone-500 text-xs font-bold uppercase tracking-widest bg-stone-900/50 px-3 py-1 rounded-full border border-stone-800">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                            
                            <h2 className="text-xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-8 tracking-tight break-words whitespace-normal max-w-full">
                                "{dailyPrompt.text}"
                            </h2>
                            
                            <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <button 
                                    onClick={() => usePrompt(dailyPrompt.text)}
                                    className="group/btn flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-black hover:bg-stone-200 transition-all text-sm shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                                >
                                    Start Writing
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                                <div className="flex items-center gap-3 text-stone-400">
                                    <span className="text-xs font-bold uppercase tracking-widest">{dailyPrompt.category}</span>
                                    <span className="w-1 h-1 rounded-full bg-stone-700" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{dailyPrompt.mood}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-full rounded-[2.5rem] bg-stone-900/20 border border-stone-800 border-dashed flex flex-col items-center justify-center p-12 text-center">
                        <Zap className="w-12 h-12 text-stone-700 mb-4" />
                        <p className="text-stone-500 font-bold uppercase tracking-widest text-sm">Waiting for daily transmission...</p>
                    </div>
                )}
            </div>

            {/* Random Deep Thought Card */}
            <div className="lg:col-span-5 h-full">
                    <motion.div 
                        whileHover={{ scale: 1.005 }}
                        className="relative h-full rounded-[2rem] sm:rounded-[2.5rem] bg-[#0c0a09] border border-stone-800 p-8 sm:p-10 flex flex-col overflow-hidden group shadow-2xl min-h-[300px]"
                    >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent z-10" />
                    
                    <div className="relative z-20 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                <Quote className="w-4 h-4 text-stone-600" /> Random Thought
                            </h3>
                            <button 
                                onClick={handleRandomize}
                                disabled={isRotating}
                                className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 transition-all active:scale-90 shadow-lg"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        
                        <div className="flex-1 flex items-center">
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={randomThought.text || 'loading'}
                                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                                    className="space-y-6"
                                >
                                    <p className="text-lg sm:text-3xl font-bold text-stone-200 leading-tight break-words whitespace-normal max-w-full">
                                        "{randomThought?.text || 'Searching...'}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-px w-8 bg-stone-700" />
                                        <span className="text-xs text-stone-500 font-black uppercase tracking-widest">{randomThought?.author || 'Cosmos'}</span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-stone-800/50">
                            <button 
                                onClick={() => usePrompt(randomThought?.text)}
                                className="w-full py-4 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 font-bold hover:bg-stone-800 hover:text-white hover:border-stone-700 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 group/link"
                            >
                                Reflect on this <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* Categories / Moods Filter */}
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-black uppercase tracking-widest px-1">
                <Target className="w-4 h-4" /> Filter by Mood
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-6 w-screen scrollbar-hide mask-linear-fade -mx-4 px-4 sm:mx-0 sm:px-0">
                <button 
                onClick={() => setSelectedMood('All')}
                className={`group relative px-4 py-2.5 md:px-6 md:py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border shrink-0 overflow-hidden ${selectedMood === 'All' ? 'text-black border-white' : 'bg-stone-900/50 border-stone-800 text-stone-400 hover:border-stone-700'}`}
                >
                    {selectedMood === 'All' && <div className="absolute inset-0 bg-white" />}
                    <span className="relative z-10">All</span>
                </button>
                {MOODS.map(mood => {
                    const isActive = selectedMood === mood.label;
                    return (
                        <button 
                            key={mood.label}
                            onClick={() => setSelectedMood(mood.label)}
                            className={`group relative flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border shrink-0 overflow-hidden ${isActive ? 'text-white border-transparent' : 'bg-stone-900/50 border-stone-800 text-stone-400 hover:border-stone-700'}`}
                        >
                            {isActive && (
                                <div className={`absolute inset-0 bg-gradient-to-r ${mood.color} opacity-100`} />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {mood.icon} {mood.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>

        {/* Main Prompts Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence mode="popLayout">
                {filteredPrompts.map((prompt, i) => (
                    <motion.div 
                        key={prompt.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        whileHover={{ y: -5 }}
                        onClick={() => usePrompt(prompt.text)}
                        className="break-inside-avoid relative rounded-[2rem] bg-stone-900/40 border border-stone-800 p-6 sm:p-8 cursor-pointer group hover:bg-stone-900/80 hover:border-stone-700 transition-all duration-300 w-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="px-2.5 py-1 rounded-md bg-stone-800/50 border border-stone-700/50 text-[10px] font-black text-stone-400 uppercase tracking-widest group-hover:text-stone-200 transition-colors">
                                {prompt.category || 'General'}
                            </span>
                            <button 
                                onClick={(e) => toggleFavorite(e, prompt)}
                                className={`p-2 rounded-xl transition-all ${favorites.some(f => f.id === prompt.id) ? 'bg-red-500/10 text-red-500' : 'text-stone-600 hover:text-stone-300'}`}
                            >
                                <Heart className={`w-4 h-4 ${favorites.some(f => f.id === prompt.id) ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                        
                        <p className="text-lg font-bold text-stone-300 leading-relaxed mb-8 group-hover:text-white transition-colors break-words whitespace-normal">
                            "{prompt.text}"
                        </p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-stone-800/50 group-hover:border-stone-700 transition-colors">
                            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                <Smile className="w-3 h-3" /> {prompt.mood || 'Mix'}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredPrompts.length === 0 && (
            <div className="py-20 text-center">
                <div className="w-24 h-24 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-stone-700" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No prompts found</h3>
                <p className="text-stone-500">Try adjusting your filters or search query.</p>
            </div>
        )}

        {/* Favorite Prompts Section */}
        {favorites.length > 0 && (
            <div className="space-y-8 pt-16 border-t border-stone-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                        <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Saved Collection</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {favorites.map((prompt) => (
                        <motion.div 
                            key={`fav-${prompt.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => usePrompt(prompt.text)}
                            className="p-6 rounded-2xl bg-[#0c0a09] border border-stone-800 hover:border-red-900/30 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] text-stone-500 font-black uppercase tracking-widest">{prompt.category}</span>
                                <button 
                                    onClick={(e) => toggleFavorite(e, prompt)}
                                    className="text-stone-600 hover:text-red-500 transition-colors"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm font-medium text-stone-300 line-clamp-3 leading-relaxed group-hover:text-white transition-colors">
                                {prompt.text}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default PromptsPage;
