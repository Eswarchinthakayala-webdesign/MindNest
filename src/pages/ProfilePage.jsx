import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Save, 
  Camera,
  MapPin,
  Palette,
  Loader2,
  Phone,
  ShieldCheck,
  Globe,
  LogOut
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from '../context/auth-context';
import supabase from '../utils/supabase';
import { toast } from 'sonner';

const PROFILE_THEMES = [
  { name: 'Obsidian', from: '#0c0a09', to: '#1c1917', border: 'border-stone-800' },
  { name: 'Midnight', from: '#020617', to: '#1e293b', border: 'border-slate-800' },
  { name: 'Royal', from: '#2e1065', to: '#4c1d95', border: 'border-violet-900' },
  { name: 'Forest', from: '#064e3b', to: '#065f46', border: 'border-emerald-900' },
  { name: 'Crimson', from: '#7f1d1d', to: '#991b1b', border: 'border-red-900' },
  { name: 'Ocean', from: '#0c4a6e', to: '#075985', border: 'border-sky-900' },
];

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTheme, setActiveTheme] = useState(PROFILE_THEMES[0]);
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: '',
    // Non-DB Helpers
    email: '',
    provider: '',
    last_sign_in: '',
  });

  // Calculate generic stats
  const [stats, setStats] = useState({ journals: 0, collections: 0 });

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadStats();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Profile from Supabase
      const { data: dbProfile, error } = await supabase
        .from('profiles')
        .select(`full_name, avatar_url`)
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // 2. Merge with Auth Metadata (fallback)
      const meta = user.user_metadata || {};
      
      setProfile({
        full_name: dbProfile?.full_name || meta.full_name || meta.name || '',
        avatar_url: dbProfile?.avatar_url || meta.avatar_url || meta.picture || '',
        email: user.email,
        provider: user.app_metadata?.provider || 'email',
        last_sign_in: user.last_sign_in_at,
        created_at: user.created_at
      });

      // 3. Load Theme Preference from LocalStorage (Simple persistence)
      const savedThemeName = localStorage.getItem(`profile_theme_${user.id}`);
      if (savedThemeName) {
        const found = PROFILE_THEMES.find(t => t.name === savedThemeName);
        if (found) setActiveTheme(found);
      }

    } catch (error) {
      console.warn('Error loading profile:', error);
      toast.error('Could not load profile data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    // Quick count of user data for the sidebar
    const { count: journalsCount } = await supabase.from('journals').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { count: colsCount } = await supabase.from('collections').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    setStats({ journals: journalsCount || 0, collections: colsCount || 0 });
  };

  const updateProfile = async () => {
    try {
      setLoading(true);

      const updates = {
        id: user.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      toast.success('Profile updated successfully');
      
      // Also update Auth Metadata to keep in sync if possible
      await supabase.auth.updateUser({
        data: { 
            full_name: profile.full_name,
            avatar_url: profile.avatar_url
        }
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (theme) => {
    setActiveTheme(theme);
    localStorage.setItem(`profile_theme_${user.id}`, theme.name);
    toast.success(`Theme updated to ${theme.name}`, { position: 'bottom-right' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
        
        {/* Dynamic Header Background */}
        <motion.div 
            layoutId="profile-header"
            className={`h-64 w-full rounded-[2.5rem] relative overflow-hidden mb-20 border border-white/5 transition-colors duration-700 bg-gradient-to-br`}
            style={{ backgroundImage: `linear-gradient(to bottom right, ${activeTheme.from}, ${activeTheme.to})` }}
        >
             {/* Noise Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-100 contrast-150 grayscale mix-blend-overlay"></div>
            
            {/* Ambient Glows */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-white/5 blur-3xl rounded-full translate-x-[-20%] translate-y-[-20%]"></div>
            <div className="absolute bottom-0 right-0 w-1/3 h-full bg-black/20 blur-2xl rounded-full"></div>
            
            {/* Theme Selector (Floating Top Right) */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                 <div className="bg-[#0c0a09]/60 backdrop-blur-md border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl">
                    <Palette className="w-4 h-4 text-stone-400" />
                    <span className="text-xs font-bold text-stone-300 uppercase tracking-widest">Theme Profile</span>
                 </div>
                 <div className="flex gap-2 p-2 bg-[#0c0a09]/60 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl">
                    {PROFILE_THEMES.map(theme => (
                        <button
                            key={theme.name}
                            onClick={() => handleThemeChange(theme)}
                            className={`w-6 h-6 rounded-full border border-white/10 transition-transform hover:scale-110 ${activeTheme.name === theme.name ? 'ring-2 ring-white scale-110' : ''}`}
                            style={{ background: theme.from }}
                            title={theme.name}
                        />
                    ))}
                 </div>
            </div>
        </motion.div>

        <div className="px-4 sm:px-8 -mt-36 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Avatar & Quick Info */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
                 {/* Avatar Container */}
                 <div className="relative group">
                    <div 
                        className={`w-40 h-40 rounded-[2rem] bg-[#1c1917] border-[6px] shadow-2xl overflow-hidden flex items-center justify-center text-5xl font-bold text-stone-600 relative transition-colors duration-700`}
                        style={{ borderColor: '#050505' }} // Blend with background
                    >
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                             // Generate initials avatar
                            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-tr from-${activeTheme.from} to-stone-800 text-white`}>
                                {profile.full_name?.charAt(0) || user?.email?.charAt(0)}
                            </div>
                        )}
                        
                        {/* Edit Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                            <Camera className="w-8 h-8 text-white/90" />
                        </div>
                    </div>
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{profile.full_name || 'Anonymous User'}</h1>
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-primary font-medium bg-primary/10 px-3 py-1 rounded-full w-fit mx-auto lg:mx-0">
                         <ShieldCheck className="w-3.5 h-3.5" />
                         <span className="text-xs uppercase tracking-wider">{profile.provider === 'google' ? 'Google Account' : 'Verified User'}</span>
                    </div>
                </div>

                {/* Sidebar Stats Grid */}
                <div className="w-full grid grid-cols-2 gap-3">
                    <div className="bg-[#0c0a09]/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 text-center hover:border-white/10 transition-colors">
                        <span className="block text-2xl font-bold text-white">{stats.journals}</span>
                        <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Journals</span>
                    </div>
                    <div className="bg-[#0c0a09]/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 text-center hover:border-white/10 transition-colors">
                        <span className="block text-2xl font-bold text-white">{stats.collections}</span>
                        <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Collections</span>
                    </div>
                </div>

                 {/* Metadata */}
                 <div className="w-full bg-[#0c0a09]/50 backdrop-blur-md border border-white/5 rounded-2xl p-5 space-y-4 text-sm">
                    <div className="flex items-center justify-between text-stone-400">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4" />
                            <span>Joined</span>
                        </div>
                        <span className="text-stone-200">{new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-400">
                         <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4" />
                            <span>Last Seen</span>
                        </div>
                        <span className="text-stone-200">{profile.last_sign_in ? new Date(profile.last_sign_in).toLocaleDateString() : 'Never'}</span>
                    </div>
                     <div className="flex items-center justify-between text-stone-400">
                         <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4" />
                            <span>Region</span>
                        </div>
                        <span className="text-stone-200">Earth</span>
                    </div>
                 </div>

            </div>

             {/* Right Column: Edit Form */}
            <div className="lg:col-span-8">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#0c0a09]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden"
                 >
                    {/* Decorative Background Mesh */}
                    <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b ${activeTheme.from} to-transparent opacity-5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2`}></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h2 className="text-2xl font-bold text-white">Account Settings</h2>
                        <button 
                            onClick={updateProfile}
                            disabled={loading}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white
                                shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            style={{ 
                                background: `linear-gradient(135deg, ${activeTheme.from}, ${activeTheme.to})`,
                                boxShadow: `0 8px 20px -5px ${activeTheme.from}50`
                            }}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {/* Name Field */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Display Name</label>
                            <div className="relative group focus-within:text-white transition-colors">
                                <User className="absolute left-5 top-4 w-5 h-5 text-stone-600 group-focus-within:text-stone-300 transition-colors" />
                                <input 
                                    type="text" 
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    className="w-full bg-[#111] border border-stone-800 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-stone-700 focus:outline-none focus:border-stone-600 focus:bg-[#161616] transition-all font-medium text-lg"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

                        {/* Email Field (Read Only) */}
                        <div className="space-y-3 opacity-70">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Email Address <span className="text-[10px] ml-2 text-stone-600 font-normal">(Managed by Provider)</span></label>
                            <div className="relative group cursor-not-allowed">
                                <Mail className="absolute left-5 top-4 w-5 h-5 text-stone-600" />
                                <input 
                                    type="text" 
                                    value={profile.email}
                                    readOnly
                                    className="w-full bg-[#0a0a0a] border border-stone-800 rounded-2xl pl-14 pr-6 py-4 text-stone-400 font-medium text-lg cursor-not-allowed"
                                />
                            </div>
                        </div>
                        
                        </div>
                        
                         {/* Sign Out Section */}
                         <div className="pt-6 mt-6 border-t border-white/5">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button 
                                        type="button"
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 transition-all font-bold group"
                                    >
                                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                        Sign Out from Account
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-[#0c0a09] border border-stone-800">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Sign Out?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-stone-400">
                                            Are you sure you want to sign out of your account? You will need to log in again to access your MindNest.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-stone-900 text-white border-stone-800 hover:bg-stone-800 hover:text-white">Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={() => signOut()}
                                            className="bg-red-600 text-white hover:bg-red-700 border-0"
                                        >
                                            Sign Out
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                     </div>
                 </motion.div>
            </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
