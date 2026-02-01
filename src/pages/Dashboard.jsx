import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  Smile, 
  TrendingUp, 
  Clock, 
  MoreVertical, 
  Folder,
  Loader2,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useJournals } from '../hooks/use-journals';
import { useCollections } from '../hooks/use-collections';
import DashboardLayout from '../layout/DashboardLayout';
import { format, isSameDay, subDays, startOfWeek } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 backdrop-blur-sm relative overflow-hidden group h-full"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon className="w-16 h-16 text-primary" />
    </div>
    <div className="relative z-10">
      <p className="text-sm font-medium text-stone-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      {trend && (
         <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>{trend}</span>
         </div>
      )}
    </div>
  </motion.div>
);

const JournalCard = ({ title, date, excerpt, mood, color, onClick }) => {
  const moodEmoji = mood?.split(' ')[0] || '😊';
  const moodLabel = mood?.split(' ').slice(1).join(' ') || 'Good';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group p-5 rounded-2xl bg-stone-900/40 border border-stone-800 hover:border-primary/30 hover:bg-stone-900/60 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color || 'bg-primary'}`} />
            <span className="text-xs text-stone-500 font-medium">
              {format(new Date(date), 'MMM d, h:mm a')}
            </span>
         </div>
      </div>
      <h4 className="font-bold text-lg text-white mb-2 group-hover:text-primary transition-colors line-clamp-1 tracking-tight">{title}</h4>
      <p className="text-sm text-stone-400 line-clamp-2 leading-relaxed mb-4">{excerpt}</p>
      
      <div className="flex items-center gap-2">
          {mood && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 text-[10px] font-black uppercase tracking-wider text-stone-300 border border-stone-700/50">
               <span className="text-sm">{moodEmoji}</span> {moodLabel}
            </span>
          )}
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { journals, loading: journalsLoading } = useJournals();
  const { collections, loading: collectionsLoading } = useCollections();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const stats = useMemo(() => {
    if (!journals.length) return { weekly: 0, streak: 0, mood: 0, total: 0 };
    
    // Count journals this week
    const startOfCurrentWeek = startOfWeek(new Date());
    const entriesThisWeek = journals.filter(j => new Date(j.created_at) >= startOfCurrentWeek).length;

    // Calculate Streak
    let streak = 0;
    let checkDate = new Date();
    
    while (true) {
      const hasEntry = journals.some(j => isSameDay(new Date(j.created_at), checkDate));
      if (hasEntry) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        // If no entry today, but there was one yesterday, streak continues if we're checking "today"
        if (streak === 0 && isSameDay(checkDate, new Date())) {
            checkDate = subDays(checkDate, 1);
            continue;
        }
        break;
      }
    }

    return {
      weekly: entriesThisWeek,
      streak: streak,
      total: journals.length
    };
  }, [journals]);

  const recentJournals = journals.slice(0, 3);

  if (journalsLoading || collectionsLoading) {
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
      
      {/* Welcome Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-3 animate-in slide-in-from-left duration-500">
               {greeting}, {profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Traveler'}.
            </h1>
            <p className="text-stone-400 font-medium text-lg">
               {stats.weekly > 0 
                ? `Wonderful! You've captured ${stats.weekly} moments this week.` 
                : "Your mind is clear. Start your first entry of the week today."}
            </p>
        </div>
        <div className="text-left sm:text-right shrink-0">
            <p className="text-[10px] text-stone-500 font-black uppercase tracking-[0.2em] mb-1">Mindful Streak</p>
            <div className="flex items-center sm:justify-end gap-3 text-amber-500 font-black">
               <span className="text-3xl tracking-tighter">{stats.streak} Days</span>
               <div className={`w-3 h-3 rounded-full bg-amber-500 ${stats.streak > 0 ? 'animate-pulse' : 'opacity-20'}`} />
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         <StatCard title="Total Entries" value={stats.total} icon={BookOpen} trend={`${stats.weekly} this week`} />
         <StatCard title="Collections" value={collections.length} icon={Folder} />
         <StatCard title="Time Journey" value={`${(stats.total * 0.2).toFixed(1)}h`} icon={Clock} trend="Estimated" />
         <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/journal/new')}
            className="p-6 rounded-2xl bg-gradient-to-br from-primary to-amber-600 flex flex-col items-center justify-center text-center cursor-pointer shadow-xl shadow-primary/20 transition-all border border-primary/20"
         >
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-4">
               <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-black text-white text-xl tracking-tight leading-none mb-1">New Entry</h3>
            <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest">Capture Thoughts</p>
         </motion.div>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Recent Journals */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider text-sm">
                  <Calendar className="w-5 h-5 text-primary" /> Recent Entries
               </h2>
               <button 
                onClick={() => navigate('/dashboard/journal')}
                className="text-xs font-black text-primary hover:text-white transition-colors uppercase tracking-[0.15em]"
               >
                View Library
               </button>
            </div>
            <div className="grid gap-5">
               {recentJournals.length > 0 ? (
                 recentJournals.map((j) => (
                    <JournalCard 
                       key={j.id}
                       title={j.title}
                       date={j.created_at}
                       excerpt={j.plain_text}
                       mood={j.journal_moods?.[0]?.mood}
                       color={j.collections?.color}
                       onClick={() => navigate(`/dashboard/collections/${j.collection_id}/journal/${j.id}`)}
                    />
                 ))
               ) : (
                <div 
                  onClick={() => navigate('/dashboard/journal/new')}
                  className="p-16 rounded-[2rem] border-2 border-stone-800/50 border-dashed flex flex-col items-center justify-center text-center text-stone-500 hover:bg-stone-900/30 hover:border-primary/30 transition-all cursor-pointer group"
                >
                   <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-xl">
                      <Plus className="w-8 h-8" />
                   </div>
                   <h3 className="text-white font-bold text-lg mb-1">Your journey starts here</h3>
                   <p className="text-sm max-w-[200px] leading-relaxed">Choose a collection and write your first entry.</p>
                </div>
               )}
               {recentJournals.length > 0 && (
                  <button 
                  onClick={() => navigate('/dashboard/journal/new')}
                  className="p-5 rounded-2xl border border-stone-800 border-dashed flex items-center justify-center gap-3 text-stone-500 hover:text-primary hover:bg-stone-900/50 hover:border-primary/50 transition-all group"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="text-sm font-bold">New Entry</span>
                  </button>
               )}
            </div>
         </div>

         {/* Side Widgets */}
         <div className="space-y-10">
            
            {/* Collections Widget */}
            <div>
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider text-sm">
                     <Folder className="w-5 h-5 text-primary" /> Collections
                  </h2>
               </div>
               <div className="bg-stone-900/40 border border-stone-800 rounded-[2rem] p-4 space-y-2">
                  {collections.slice(0, 5).map((c) => (
                     <div 
                        key={c.id} 
                        onClick={() => navigate(`/dashboard/collections/${c.id}`)}
                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-stone-800/80 transition-all cursor-pointer group"
                     >
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl ${c.color || 'bg-stone-800'} bg-opacity-10 flex items-center justify-center border border-white/5`}>
                              <span className="text-xl">{c.icon || '📁'}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-stone-200 group-hover:text-primary transition-colors tracking-tight">{c.title}</span>
                              <span className="text-[10px] text-stone-500 uppercase font-black tracking-widest">View Details</span>
                           </div>
                        </div>
                     </div>
                  ))}
                  <button 
                    onClick={() => navigate('/dashboard/collections')}
                    className="flex items-center gap-3 w-full p-4 text-xs font-black text-stone-500 hover:text-primary transition-all group uppercase tracking-[0.2em]"
                  >
                     <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> 
                     <span>All Collections</span>
                  </button>
               </div>
            </div>

            {/* Inspiration Widget */}
            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-stone-900/80 to-[#121212] border border-stone-800 relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-1 bg-amber-500 rounded-full" />
                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Moment of Peace</h3>
                  </div>
                  <p className="text-lg text-stone-200 font-bold leading-tight mb-6 italic group-hover:text-white transition-colors">
                     "The happiness of your life depends upon the quality of your thoughts."
                  </p>
                  <div className="flex items-center justify-between border-t border-stone-800 pt-6">
                    <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">— Marcus Aurelius</span>
                    <Smile className="w-5 h-5 text-amber-500/50" />
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-700" />
            </div>

         </div>

      </div>

    </DashboardLayout>
  );
};

export default Dashboard;
