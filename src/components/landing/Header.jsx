import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';

const Header = () => {
  const { user, profile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Vision', href: '#about' },
    { name: 'Privacy', href: '#privacy' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`
          fixed top-0 left-0 right-0 z-50 
          transition-all duration-300 
          border-b
          ${isScrolled 
            ? 'bg-stone-900/80 backdrop-blur-xl border-stone-800 py-4' 
            : 'bg-transparent border-transparent py-6'
          }
        `}
      >
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group hover:scale-105 transition-transform duration-300">
             <Logo className="w-9 h-9" classNameText="text-xl" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="px-4 py-2 rounded-lg text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800/50 transition-all duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
               <Link to="/dashboard" className="flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-[#1c1917]/50 backdrop-blur-md border border-stone-800 hover:border-stone-600 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-stone-800/0 group-hover:bg-stone-800/50 transition-colors duration-300" />
                
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="User" className="relative z-10 w-9 h-9 rounded-full object-cover ring-2 ring-stone-800 group-hover:ring-stone-600 transition-all" />
                ) : (
                  <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center text-xs font-bold text-white ring-2 ring-stone-800 group-hover:ring-stone-600 transition-all">
                    {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </div>
                )}
                
                <div className="relative z-10 flex flex-col justify-center">
                   <span className="text-xs font-bold text-stone-300 group-hover:text-white transition-colors leading-none mb-0.5">
                      {profile?.full_name?.split(' ')[0] || 'Welcome'}
                   </span>
                   <span className="text-[10px] text-stone-500 font-semibold tracking-wider group-hover:text-primary transition-colors uppercase">
                      Open Dashboard
                   </span>
                </div>
              </Link>
            ) : (
              <>
                <Link to="/auth" className="text-sm font-medium text-stone-400 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/auth" className="group relative px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.6)] transition-all overflow-hidden hover:scale-105 active:scale-95">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Access <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:animate-[shimmer_1s_infinite]" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Full Screen Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-stone-950/95 backdrop-blur-2xl flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-12">
               <Logo className="w-9 h-9" classNameText="text-xl" />
               <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-stone-900 text-stone-300 hover:text-white border border-stone-800"
                >
                 <X className="w-6 h-6" />
               </button>
            </div>

            <nav className="flex flex-col gap-6 text-2xl font-medium text-stone-300">
               {navLinks.map((link, i) => (
                  <motion.a 
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + (i * 0.1) }}
                    className="flex items-center gap-4 hover:text-primary transition-colors"
                  >
                     <span className="text-xs font-mono text-stone-600">0{i + 1}</span>
                     {link.name}
                  </motion.a>
               ))}
            </nav>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-auto space-y-4"
            >
                {user ? (
                   <Link to="/dashboard" className="block w-full text-center py-4 rounded-xl bg-stone-800 text-white font-bold border border-stone-700 hover:bg-stone-700 transition-colors">
                      Go to Dashboard
                   </Link>
                ) : (
                   <>
                    <Link to="/auth" className="block w-full text-center py-4 rounded-xl border border-stone-800 text-white font-bold hover:bg-stone-900 transition-colors">
                        Log in
                    </Link>
                    <Link to="/auth" className="block w-full text-center py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
                        Get Early Access
                    </Link>
                   </>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
