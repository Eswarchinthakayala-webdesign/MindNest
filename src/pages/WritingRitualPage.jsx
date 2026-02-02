import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wind, ArrowRight, X } from 'lucide-react';

const BREATHING_PHASES = [
  { label: "Inhale", duration: 4000, scale: 1.5, opacity: 1 },
  { label: "Hold", duration: 4000, scale: 1.5, opacity: 0.8 },
  { label: "Exhale", duration: 4000, scale: 1, opacity: 0.6 },
  { label: "Hold", duration: 4000, scale: 1, opacity: 0.6 }
];

const WritingRitualPage = () => {
  const navigate = useNavigate();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const MAX_CYCLES = 3;

  useEffect(() => {
    let timeout;
    if (isActive && cycles < MAX_CYCLES) {
      const currentPhase = BREATHING_PHASES[phaseIndex];
      timeout = setTimeout(() => {
        setPhaseIndex((prev) => {
          const next = (prev + 1) % BREATHING_PHASES.length;
          if (next === 0) setCycles(c => c + 1);
          return next;
        });
      }, currentPhase.duration);
    } else if (cycles >= MAX_CYCLES) {
      setIsActive(false);
    }
    return () => clearTimeout(timeout);
  }, [isActive, phaseIndex, cycles]);

  const startRitual = () => {
    setIsActive(true);
    setPhaseIndex(0);
    setCycles(0);
  };

  const skipRitual = () => {
    navigate('/dashboard/journal/new');
  };

  const currentPhase = BREATHING_PHASES[phaseIndex];

  return (
    <div className="relative h-screen w-full bg-[#0c0a09] overflow-hidden flex flex-col items-center justify-center text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-[#0c0a09] to-black pointer-events-none" />
      
      {/* Floating Orbs */}
      <motion.div 
        animate={{ 
          x: [0, 100, 0], 
          y: [0, -50, 0],
          scale: [1, 1.2, 1] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          x: [0, -100, 0], 
          y: [0, 50, 0],
          scale: [1, 1.3, 1] 
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px]" 
      />

      {/* Exit Button */}
      <button 
        onClick={skipRitual}
        className="absolute top-8 right-8 p-3 rounded-full bg-stone-900/50 border border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800 transition-all z-50 group"
      >
        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto text-center px-6">
        
        <AnimatePresence mode="wait">
          {!isActive && cycles === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-stone-800 to-stone-900 border border-stone-700 flex items-center justify-center shadow-2xl rotate-3">
                <Wind className="w-8 h-8 text-stone-300" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-stone-500 bg-clip-text text-transparent">
                  Prepare Your Mind
                </h1>
                <p className="text-lg text-stone-400 font-medium leading-relaxed">
                  Take a moment to disconnect from the noise. Center yourself before you begin writing.
                </p>
              </div>
              <button
                onClick={startRitual}
                className="group relative px-10 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]"
              >
                Start Ritual
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/50 group-hover:ring-white transition-all scale-105 opacity-0 group-hover:opacity-100" />
              </button>
              <button 
                onClick={skipRitual}
                className="block mx-auto text-xs font-bold text-stone-600 hover:text-stone-400 uppercase tracking-widest transition-colors mt-8"
              >
                Skip to writing
              </button>
            </motion.div>
          )}

          {isActive && (
            <div className="relative flex items-center justify-center w-80 h-80">
                {/* Breathing Circle */}
                <motion.div
                    animate={{
                        scale: currentPhase.scale,
                        opacity: currentPhase.opacity
                    }}
                    transition={{ duration: currentPhase.duration / 1000, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 to-indigo-500/30 blur-2xl"
                />
                <motion.div
                    animate={{
                        scale: currentPhase.scale,
                        borderWidth: currentPhase.label === 'Hold' ? 8 : 1
                    }}
                    transition={{ duration: currentPhase.duration / 1000, ease: "easeInOut" }}
                    className="absolute inset-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center"
                >
                    <motion.div 
                        key={currentPhase.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="text-2xl font-black uppercase tracking-[0.3em] text-white/90"
                    >
                        {currentPhase.label}
                    </motion.div>
                </motion.div>

                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none transform scale-125 opacity-20">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-stone-700"
                    />
                    <motion.circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: (cycles * 4 + phaseIndex + 1) / (MAX_CYCLES * 4) }}
                        transition={{ duration: 1, ease: "linear" }}
                    />
                </svg>
            </div>
          )}

        {cycles >= MAX_CYCLES && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
               <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
                  <Wind className="w-10 h-10 text-green-400" />
               </div>
               <h2 className="text-4xl font-black bg-gradient-to-r from-green-300 to-emerald-500 bg-clip-text text-transparent">
                  Mind Clear. Focus On.
               </h2>
               <button
                  onClick={skipRitual}
                  className="w-full px-8 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-stone-200 transition-colors flex items-center justify-center gap-3"
               >
                  Begin Writing <ArrowRight className="w-4 h-4" />
               </button>
            </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Footer / Status */}
      {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-12 text-stone-500 text-xs font-bold uppercase tracking-[0.2em]"
          >
              Cycle {cycles + 1} of {MAX_CYCLES}
          </motion.div>
      )}
    </div>
  );
};

export default WritingRitualPage;
