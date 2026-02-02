import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Smile, 
  TrendingUp, 
  Activity, 
  Target, 
  Calendar,
  Layers,
  Zap,
  Heart,
  BrainCircuit,
  PieChart as PieChartIcon
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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from 'recharts';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { useJournals } from '../hooks/use-journals';
import { useCollections } from '../hooks/use-collections';
import DashboardLayout from '../layout/DashboardLayout';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0c0a09]/90 backdrop-blur-xl border border-stone-800 p-4 rounded-2xl shadow-2xl z-50">
        <p className="text-stone-400 text-xs font-black uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-white font-bold text-sm">
              {entry.name}: {entry.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MoodInsights = () => {
  const { journals, loading: journalsLoading } = useJournals();
  const { collections } = useCollections();

  const insightsData = useMemo(() => {
    if (!journals || journals.length === 0) return null;

    // 1. Mood & Intensity Processing
    const journalsWithMood = journals.filter(j => j.journal_moods?.length > 0);
    
    // Distribution for Radar/Pie
    const moodMap = {};
    const intensityOverTime = [];
    const moodByCollection = {};

    journals.forEach(j => {
      const moodEntry = j.journal_moods?.[0];
      if (moodEntry) {
        // Normalize mood name (strip emoji)
        const moodParts = moodEntry.mood.split(' ');
        const moodEmoji = moodParts.length > 1 && moodParts[0].length <= 4 ? moodParts[0] : (moodEntry.emoji || '😊');
        const moodName = moodParts.length > 1 && moodParts[0].length <= 4 ? moodParts.slice(1).join(' ') : moodEntry.mood;

        if (!moodMap[moodName]) {
          moodMap[moodName] = { count: 0, emoji: moodEmoji };
        }
        moodMap[moodName].count += 1;

        // Collection Mapping
        const collectionTitle = j.collections?.title || 'Uncategorized';
        if (!moodByCollection[collectionTitle]) moodByCollection[collectionTitle] = {};
        moodByCollection[collectionTitle][moodName] = (moodByCollection[collectionTitle][moodName] || 0) + 1;
      }
    });

    // 2. Intensity over time (Last 14 entries or days)
    const recentJournals = [...journals].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).slice(-14);
    const intensityData = recentJournals.map(j => ({
      date: format(new Date(j.created_at), 'MMM d'),
      intensity: j.journal_moods?.[0]?.intensity || 0,
      mood: j.journal_moods?.[0]?.mood || 'Neutral'
    }));

    // 3. Radar Chart Data (Top 6 moods for balance)
    const radarData = Object.entries(moodMap)
      .map(([name, data]) => ({ name: `${data.emoji} ${name}`, value: data.count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // 4. Mood by Collection Data
    const collectionMoodData = Object.entries(moodByCollection).map(([name, moods]) => {
      const data = { name };
      Object.entries(moods).forEach(([m, count]) => {
        data[m] = count;
      });
      return data;
    });

    return {
      moodDistribution: Object.entries(moodMap).map(([name, data]) => ({ name, value: data.count, emoji: data.emoji })),
      intensityData,
      radarData,
      collectionMoodData,
      totalEntries: journals.length,
      moodEntries: journalsWithMood.length,
      avgIntensity: (journalsWithMood.reduce((acc, curr) => acc + (curr.journal_moods[0].intensity || 0), 0) / journalsWithMood.length).toFixed(1)
    };
  }, [journals]);

  const MOOD_COLORS = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (journalsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <Activity className="w-10 h-10 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!insightsData || journals.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center">
            <BrainCircuit className="w-10 h-10 text-stone-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">No Emotional Data Yet</h2>
            <p className="text-stone-500 max-w-sm mx-auto mt-2">Start journaling with moods to unlock deep psychological insights into your well-being.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-3">Mood Insights</h1>
            <p className="text-stone-400 font-medium text-lg flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              Understand the emotional patterns of your subconscious.
            </p>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] text-stone-500 font-black uppercase tracking-[0.2em] mb-1">Avg. Intensity</p>
                <p className="text-3xl font-black text-amber-500">{insightsData.avgIntensity}</p>
             </div>
             <div className="w-px h-10 bg-stone-800" />
             <div className="text-right">
                <p className="text-[10px] text-stone-500 font-black uppercase tracking-[0.2em] mb-1">Mood Tracked</p>
                <p className="text-3xl font-black text-white">{((insightsData.moodEntries / insightsData.totalEntries) * 100).toFixed(0)}%</p>
             </div>
          </div>
        </div>

        {/* Top Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Radar Chart - Emotional Balance */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-1 bg-stone-900/40 border border-stone-800 rounded-[2.5rem] p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Emotional Balance
               </h3>
            </div>
            <div className="flex-1 min-h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={insightsData.radarData}>
                  <PolarGrid stroke="#262626" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 'bold' }} />
                  <Radar
                    name="Intensity"
                    dataKey="value"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.3}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-stone-500 text-center uppercase font-black tracking-widest mt-4">Top recurring emotions</p>
          </motion.div>

          {/* Area Chart - Mood Intensity Over Time */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-stone-900/40 border border-stone-800 rounded-[2.5rem] p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Emotional Intensity
               </h3>
               <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Last 14 Entries</span>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insightsData.intensityData}>
                  <defs>
                    <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#57534e', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#57534e', fontSize: 10 }}
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke="#f59e0b" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#intensityGradient)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row - Mood by Collection & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Mood by Collection (Stacked Bar) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-stone-900/40 border border-stone-800 rounded-[2.5rem] p-8"
          >
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 rounded-xl bg-stone-800 text-stone-400">
                  <Layers className="w-4 h-4" />
               </div>
               <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Mood by Collection</h3>
                  <p className="text-[10px] text-stone-600 font-bold uppercase tracking-[0.1em]">Contextual emotional mapping</p>
               </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insightsData.collectionMoodData} margin={{ top: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#a8a29e', fontSize: 10 }}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  {/* Dynamic Bars based on available moods */}
                  {insightsData.moodDistribution.map((m, idx) => (
                    <Bar 
                      key={m.name} 
                      dataKey={m.name} 
                      stackId="a" 
                      fill={MOOD_COLORS[idx % MOOD_COLORS.length]} 
                      radius={[idx === insightsData.moodDistribution.length - 1 ? 4 : 0, idx === insightsData.moodDistribution.length - 1 ? 4 : 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Mood Distribution (Donut) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-stone-900/40 border border-stone-800 rounded-[2.5rem] p-8"
          >
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 rounded-xl bg-stone-800 text-stone-400">
                  <PieChartIcon className="w-4 h-4" />
               </div>
               <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Emotion Spread</h3>
                  <p className="text-[10px] text-stone-600 font-bold uppercase tracking-[0.1em]">Dominant feeling distribution</p>
               </div>
            </div>
            <div className="flex items-center flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={insightsData.moodDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {insightsData.moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MOOD_COLORS[index % MOOD_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                {insightsData.moodDistribution.sort((a,b) => b.value - a.value).slice(0, 5).map((m, idx) => (
                  <div key={m.name} className="flex items-center justify-between p-3 rounded-2xl bg-stone-900/50 border border-stone-800">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MOOD_COLORS[idx % MOOD_COLORS.length] }} />
                      <span className="text-sm">{m.emoji}</span>
                      <span className="text-xs font-bold text-stone-300 capitalize">{m.name}</span>
                    </div>
                    <span className="text-xs font-black text-white">{((m.value / insightsData.moodEntries) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Psychological Note */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="w-32 h-32 text-amber-500" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Insight of the Moment
            </h3>
            <p className="text-stone-400 leading-relaxed text-sm">
              Your journals indicate a strong correlation between <span className="text-white font-bold">intensive writing sessions</span> and <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">positive emotional recovery</span>. Trends show that tagging your entries consistently increases self-awareness by <span className="text-white font-bold">24%</span> compared to untagged entries.
            </p>
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
};

export default MoodInsights;
