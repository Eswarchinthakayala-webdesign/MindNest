import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { 
  LayoutDashboard, 
  Book, 
  Grid, 
  BarChart2,
  LogOut, 
  Menu, 
  X,
  Plus,
  Search,
  User,
  Bell,
  BrainCircuit,
  Sparkles,
  Wind
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, href, active }) => (
  <Link 
    to={href}
    className={`
      group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
      ${active 
        ? 'bg-primary/10 text-primary border border-primary/20' 
        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
      }
    `}
  >
    <Icon className={`w-5 h-5 ${active ? 'fill-primary/20' : ''}`} />
    <span className="font-medium text-sm">{label}</span>
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
      />
    )}
  </Link>
);

const DashboardLayout = ({ children }) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Book, label: 'Journal', href: '/dashboard/journal' },
    { icon: Grid, label: 'Collections', href: '/dashboard/collections' },
    { icon: Wind, label: 'Focus Mode', href: '/dashboard/ritual' },
    { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: BrainCircuit, label: 'Insights', href: '/dashboard/insights' },
    { icon: Sparkles, label: 'Prompts', href: '/dashboard/prompts' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-stone-200 font-sans selection:bg-primary/30 flex overflow-x-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-r border-stone-800 bg-[#050505]/95 backdrop-blur-xl z-50">
        <div className="p-6">
           <Link to="/" className="flex items-center gap-3 px-2">
              <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                <Logo className="w-6 h-6" classNameText="hidden" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">MindNest</span>
           </Link>
        </div>

        <div className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
             <SidebarItem 
               key={item.href} 
               {...item} 
               active={location.pathname === item.href} 
             />
          ))}
        </div>

        <div className="p-4 border-t border-stone-800">
            <Link to="/dashboard/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-900 transition-colors mb-2">
                {profile?.avatar_url ? (
                   <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || "User"} 
                      className="w-9 h-9 rounded-full border border-stone-500 object-cover"
                   />
                ) : (
                   <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-stone-700 to-stone-600 border border-stone-500 flex items-center justify-center text-xs font-bold text-white">
                      {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                   </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                        {profile?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                </div>
            </Link>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
         
         {/* Top Header */}
         <header className={`sticky top-0 z-40 px-6 py-4 flex items-center justify-between transition-all duration-300 ${scrolled ? 'bg-[#050505]/80 backdrop-blur-md border-b border-stone-800' : 'bg-transparent'}`}>
            <div className="md:hidden flex items-center gap-4">
               <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-stone-400 hover:text-white">
                  <Menu className="w-6 h-6" />
               </button>
               <Link to="/" className="flex items-center gap-2">
                  <Logo className="w-6 h-6" classNameText="hidden" />
                  <span className="font-bold text-lg text-white">MindNest</span>
               </Link>
            </div>

          


         </header>

         {/* Content Area */}
         <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
            {children}
         </main>

      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsMobileMenuOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
               initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-stone-950 border-r border-stone-800 z-50 md:hidden flex flex-col p-6"
            >
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <Logo className="w-8 h-8" />
                     <span className="font-bold text-lg text-white">MindNest</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full bg-stone-900 border border-stone-800">
                     <X className="w-5 h-5 text-stone-400" />
                  </button>
               </div>
               
               <div className="space-y-2 flex-1">
                  {navItems.map((item) => (
                    <SidebarItem 
                        key={item.href} 
                        {...item} 
                        active={location.pathname === item.href} 
                    />
                  ))}
               </div>

                <div className="pt-6 border-t border-stone-800">
                    <button onClick={signOut} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DashboardLayout;
