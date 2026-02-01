import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { ShieldCheck, Scan, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { toast } from 'sonner';
import ThreeBackground from '../components/ui/ThreeBackground';

const Auth = () => {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState('idle'); // idle, scanning, authenticating, success, error

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setAuthStatus('scanning');
      
      // Simulate a "scan" phase
      await new Promise(r => setTimeout(r, 1000));
      setAuthStatus('authenticating');
      
      const toastId = toast.loading('Establishing secure handshake...', {
         description: 'Verifying credentials with Google Identity Services',
      });

      await signInWithGoogle();
      
      setAuthStatus('success');
      toast.success('Identity Verified', {
        id: toastId,
        description: 'Welcome back to your sanctuary.',
        icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
      });

    } catch (error) {
      console.error("Login Error:", error);
      setAuthStatus('error');
      toast.error('Authentication Failed', {
         description: error.message || 'Connection rejected.',
         icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      });
      setTimeout(() => setAuthStatus('idle'), 2000);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden font-sans selection:bg-amber-500/30">
      
      {/* Background Ambience - Deep Space & Particles */}
      <div className="absolute inset-0 z-0 bg-[#050505] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1c1917_0%,#050505_100%)] opacity-80" />
          <div className="bg-noise opacity-[0.15] mix-blend-overlay absolute inset-0 z-0" />
          
          {/* ThreeJS 3D Starfield */}
          <ThreeBackground />
      </div>

      {/* Main Container */}
      <AnimatePresence mode="wait">
         <motion.div 
            key={authStatus === 'idle' ? 'card' : 'status'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 w-full max-w-sm mx-6"
         >
            {/* The "Device" Frame - Lighter Glass */}
            <div className="relative bg-stone-900/60 backdrop-blur-2xl border border-stone-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/5">
                
                {/* Top Shine */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="p-8 pb-10 flex flex-col items-center text-center space-y-8">
                    
                    {/* Dynamic Icon */}
                    <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                        <AnimatePresence mode="wait">
                            {authStatus === 'idle' && (
                                <motion.div 
                                    key="logo"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                >
                                    <div className="relative group cursor-default">
                                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <div className="relative p-5 rounded-2xl bg-gradient-to-b from-stone-800 to-stone-900 border border-stone-700 shadow-xl group-hover:border-primary/30 transition-colors duration-500">
                                            <Logo className="w-10 h-10" classNameText="hidden" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            
                            {(authStatus === 'scanning' || authStatus === 'authenticating') && (
                                <motion.div key="scan" className="relative w-24 h-24 flex items-center justify-center">
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-[-12px] border-2 border-primary/30 border-t-primary rounded-full"
                                    />
                                    <motion.div 
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border border-t-transparent border-stone-600 rounded-full opacity-50"
                                    />
                                    <div className="relative w-full h-full rounded-full bg-stone-900/50 flex items-center justify-center backdrop-blur-sm border border-stone-800 z-10">
                                       <Scan className="w-8 h-8 text-primary animate-pulse" />
                                    </div>
                                </motion.div>
                            )}

                            {authStatus === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                </motion.div>
                            )}
                         </AnimatePresence>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-3">
                        <motion.h1 
                            className="text-3xl font-bold text-white tracking-tight"
                            animate={authStatus === 'scanning' ? { opacity: [1, 0.7, 1] } : {}}
                        >
                            {authStatus === 'idle' && "Welcome Back"}
                            {authStatus === 'scanning' && "Connecting..."}
                            {authStatus === 'authenticating' && "Verifying..."}
                            {authStatus === 'success' && "Access Granted"}
                        </motion.h1>
                        
                        <p className="text-base text-stone-400 font-medium max-w-[260px] mx-auto leading-relaxed">
                            {authStatus === 'idle' && "Sign in to access your private thought sanctuary."}
                            {authStatus !== 'idle' && "Establishing a secure connection to your vault."}
                        </p>
                    </div>

                    {/* Action Area */}
                    <div className="w-full pt-2">
                        {authStatus === 'idle' && (
                            <button
                                onClick={handleGoogleLogin}
                                className="group relative w-full overflow-hidden rounded-xl bg-stone-950 border border-stone-800 text-stone-200 font-bold text-lg hover:bg-stone-900 hover:text-white transition-all duration-300 shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative px-6 py-4 flex items-center justify-center gap-3">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            className="text-[#4285F4]"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            className="text-[#34A853]"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            className="text-[#FBBC05]"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            className="text-[#EA4335]"
                                        />
                                    </svg>
                                    <span>Continue with Google</span>
                                </div>
                            </button>
                        )}
                        
                        {authStatus !== 'idle' && (
                             <div className="w-full h-14 flex items-center justify-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
                                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
                                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                             </div>
                        )}
                    </div>

                    {/* Footer Stats - Cleaned up - Removed Biometric */}
                    <div className="w-full flex justify-center text-[10px] uppercase font-bold text-stone-500 tracking-wider pt-6 border-t border-stone-800/50">
                        <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> End-to-End Encrypted</span>
                    </div>

                </div>
            </div>
         </motion.div>
      </AnimatePresence>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-stone-600 text-xs tracking-widest opacity-50">
          MINDNEST SECURE GATEWAY
      </div>

    </div>
  );
};

export default Auth;
