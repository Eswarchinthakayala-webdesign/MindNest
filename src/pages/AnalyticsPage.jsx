import React, { useMemo } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  TrendingUp, 
  Calendar, 
  Type, 
  PieChart as PieChartIcon,
  Activity,
  Heart,
  Smile,
  Tag
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useJournals } from '../hooks/use-journals';
import { useCollections } from '../hooks/use-collections';
import { format, subDays, eachDayOfInterval, isSameDay, startOfDay } from 'date-fns';

// Helper to map tailwind classes to hex for charts
const getHexFromTailwind = (className) => {
  const colors = {
      'bg-red-500': '#ef4444', 
      'bg-orange-500': '#f97316', 
      'bg-amber-500': '#f59e0b', 
      'bg-yellow-500': '#eab308', 
      'bg-lime-500': '#84cc16', 
      'bg-green-500': '#22c55e', 
      'bg-emerald-500': '#10b981', 
      'bg-teal-500': '#14b8a6', 
      'bg-cyan-500': '#06b6d4', 
      'bg-sky-500': '#0ea5e9', 
      'bg-blue-500': '#3b82f6', 
      'bg-indigo-500': '#6366f1', 
      'bg-violet-500': '#8b5cf6', 
      'bg-purple-500': '#a855f7', 
      'bg-fuchsia-500': '#d946ef', 
      'bg-pink-500': '#ec4899', 
      'bg-rose-500': '#f43f5e', 
      'bg-slate-500': '#64748b'
  };
  return colors[className] || '#3b82f6';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0c0a09] border border-stone-800 p-3 rounded-xl shadow-xl z-50">
        <p className="text-stone-300 text-sm font-medium mb-1">{label}</p>
        <p className="text-primary font-bold">
          {payload[0].value} {payload[0].name === 'count' ? 'Entries' : payload[0].name === 'value' ? 'Journals' : payload[0].name}
        </p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ icon: Icon, label, value, colorClass, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`bg-[#0c0a09]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between h-40 group hover:border-${colorClass}/30 transition-all`}
    >
        <div className="flex justify-between items-start">
            <div className={`p-3 bg-${colorClass}/10 rounded-2xl text-${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
        <div>
                <h3 className="text-4xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{value}</h3>
                <p className="text-stone-500 font-medium">{label}</p>
        </div>
    </motion.div>
);

const AnalyticsPage = () => {
  const { journals, loading: journalsLoading } = useJournals();
  const { collections } = useCollections();

  const analyticsData = useMemo(() => {
    if (!journals || journals.length === 0) return null;

    // 1. Basic Stats
    const totalJournals = journals.length;
    const favoritesCount = journals.filter(j => j.is_favorite).length;

    // 2. Word Count
    let totalWords = 0;
    journals.forEach(j => {
      const text = j.plain_text || j.content?.replace(/<[^>]*>/g, ' ') || '';
      if (text) {
        totalWords += text.trim().split(/\s+/).filter(w => w.length > 0).length;
      }
    });

    // 3. Streak Calculation
    // Sort journals by date descending
    const sortedJournals = [...journals].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    let currentStreak = 0;
    const today = startOfDay(new Date());
    let checkDate = today;
    
    // Check if there's an entry for today (or continue from yesterday)
    const hasEntryToday = sortedJournals.some(j => isSameDay(new Date(j.created_at), today));
    
    if (!hasEntryToday) {
        // If no entry today, check if last entry was yesterday to keep streak alive? 
        // Or strict streak? Usually current streak counts if you wrote today. 
        // If you haven't written today, streak is 0? Or streak is maintained until day ends?
        // Let's assume standard behavior: Streak is consecutive days ending today or yesterday.
        checkDate = subDays(today, 1);
    }
    
    // Simple logic: iterate backwards day by day and check existence
    // Optimized: Since sorted, iterate days and match with journals
    let streakDate = hasEntryToday ? today : subDays(today, 1);
    let activeStreak = true;
    
    while (activeStreak) {
        const hasEntryOnDate = sortedJournals.some(j => isSameDay(new Date(j.created_at), streakDate));
        if (hasEntryOnDate) {
            currentStreak++;
            streakDate = subDays(streakDate, 1);
        } else {
            activeStreak = false;
        }
    }
    
    // 4. Activity (Last 7 Days)
    const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
    });

    const journalsByDate = last7Days.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const count = journals.filter(j => 
            format(new Date(j.created_at), 'yyyy-MM-dd') === dateStr
        ).length;
        return {
            date: format(date, 'EEE'),
            count: count,
            fullDate: dateStr
        };
    });

    // 5. Collection Distribution
    const journalsByCollection = collections.map(c => {
        const count = journals.filter(j => j.collection_id === c.id).length;
        return {
            name: c.title,
            value: count,
            color: c.color
        };
    }).filter(item => item.value > 0);

    // 6. Mood Analysis
    const moodCounts = {};
    journals.forEach(j => {
        if (j.journal_moods && j.journal_moods.length > 0) {
            j.journal_moods.forEach(m => {
                // Extract label part if format is "emoji label"
                // Assuming format "Emoji Label" or just "Label"
               // Ideally we normalize. If simple string, use as key.
               const moodKey = m.mood; 
               moodCounts[moodKey] = (moodCounts[moodKey] || 0) + 1;
            });
        }
    });

    // Top 5 Moods
    const moodDistribution = Object.entries(moodCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    
    // Assign generic colors for moods if needed, or use a palette
    const MOOD_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6'];

    // 7. Tags Analysis
    const tagCounts = {};
    journals.forEach(j => {
        if (j.journal_tags && j.journal_tags.length > 0) {
            j.journal_tags.forEach(t => {
                const tag = t.tag.toLowerCase();
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });

    const topTags = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 7); // Top 7 tags

    return {
        totalJournals,
        totalWords,
        favoritesCount,
        currentStreak,
        journalsByDate,
        journalsByCollection,
        moodDistribution,
        topTags,
        MOOD_COLORS
    };

  }, [journals, collections]);

  if (journalsLoading) {
      return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        </DashboardLayout>
      );
  }

  const data = analyticsData || {
    totalJournals: 0,
    totalWords: 0,
    favoritesCount: 0,
    currentStreak: 0,
    journalsByDate: [],
    journalsByCollection: [],
    moodDistribution: [],
    topTags: [],
    MOOD_COLORS: []
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-400 tracking-tight mb-2">Analytics</h1>
          <p className="text-stone-400 text-lg">Detailed insights based on your journal entries.</p>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Calendar} label="Total Entries" value={data.totalJournals} colorClass="primary" delay={0.1} />
            <StatCard icon={Type} label="Total Words" value={data.totalWords.toLocaleString()} colorClass="blue-500" delay={0.2} />
            <StatCard icon={TrendingUp} label="Current Streak" value={`${data.currentStreak} Days`} colorClass="green-500" delay={0.3} />
            <StatCard icon={Heart} label="Favorites" value={data.favoritesCount} colorClass="red-500" delay={0.4} />
        </div>

        {/* First Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Activity Chart (Wider) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2 bg-[#0c0a09]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-xl bg-white/5 text-stone-300">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-white">Writing Activity</h2>
                        <p className="text-sm text-stone-500">Entries over the last 7 days</p>
                    </div>
                </div>
                
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.journalsByDate}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#57534e" 
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#a8a29e' }}
                                dy={10}
                            />
                            <YAxis 
                                stroke="#57534e" 
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#a8a29e' }}
                                dx={-10}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#444', strokeWidth: 1 }} />
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#f59e0b" 
                                strokeWidth={3}
                                checkmark
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

             {/* Top Tags Bar Chart */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-[#0c0a09]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8"
            >
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-xl bg-white/5 text-stone-300">
                        <Tag className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Top Tags</h2>
                         <p className="text-sm text-stone-500">Most used keywords</p>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    {data.topTags.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={data.topTags} margin={{ left: 10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#262626" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={80} 
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#d6d3d1', fontSize: 12 }}
                                />
                                <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-stone-500">
                             <Tag className="w-12 h-12 mb-2 opacity-20" />
                             <p>No tags used yet</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>

        {/* Second Row: Distributions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

             {/* Collection Distribution */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-[#0c0a09]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-xl bg-white/5 text-stone-300">
                        <PieChartIcon className="w-5 h-5" />
                    </div>
                    <div>
                         <h2 className="text-xl font-bold text-white">Collections</h2>
                         <p className="text-sm text-stone-500">Entries per category</p>
                    </div>
                </div>
                
                <div className="h-[300px] flex items-center justify-center">
                    {data.journalsByCollection.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.journalsByCollection}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.journalsByCollection.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getHexFromTailwind(entry.color)} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="text-stone-500 text-sm flex flex-col items-center">
                            <p>No collections data</p>
                         </div>
                    )}
                </div>
                {/* Custom Legend */}
                {data.journalsByCollection.length > 0 && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-4 px-4">
                     {data.journalsByCollection.map((entry, index) => (
                         <div key={index} className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: getHexFromTailwind(entry.color) }} />
                             <span className="text-xs text-stone-400 font-medium">{entry.name}</span>
                         </div>
                     ))}
                </div>
                )}
            </motion.div>

            {/* Mood Distribution */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-[#0c0a09]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-xl bg-white/5 text-stone-300">
                        <Smile className="w-5 h-5" />
                    </div>
                     <div>
                         <h2 className="text-xl font-bold text-white">Moods</h2>
                         <p className="text-sm text-stone-500">Emotional distribution</p>
                    </div>
                </div>
                
                <div className="h-[300px] flex items-center justify-center">
                    {data.moodDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie
                                    data={data.moodDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.moodDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={data.MOOD_COLORS[index % data.MOOD_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-stone-500">
                             <Smile className="w-12 h-12 mb-2 opacity-20" />
                             <p>No mood data yet</p>
                        </div>
                    )}
                </div>
                  {/* Custom Legend */}
                {data.moodDistribution.length > 0 && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-4 px-4">
                     {data.moodDistribution.map((entry, index) => (
                         <div key={index} className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: data.MOOD_COLORS[index % data.MOOD_COLORS.length] }} />
                             <span className="text-xs text-stone-400 font-medium truncate max-w-[100px]">{entry.name}</span>
                         </div>
                     ))}
                </div>
                )}
            </motion.div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
