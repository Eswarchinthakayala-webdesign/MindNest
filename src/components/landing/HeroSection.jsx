import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 md:px-6 overflow-hidden pt-20">
      
      {/* Background Glow Effect - Centered and Softer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-primary/15 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Content Container */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 max-w-5xl mx-auto space-y-8 md:space-y-10"
      >
        
        {/* Futuristic Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl text-xs md:text-sm font-medium text-amber-200 tracking-widest uppercase shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] transition-shadow duration-500 cursor-default"
        >
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 animate-pulse text-primary" />
          <span>Next Gen Mental Wellness</span>
        </motion.div>

        {/* Main Headline with Split Animation */}
        <div className="flex flex-col items-center">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white leading-[0.9]">
              <motion.span
                initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="block text-transparent bg-clip-text bg-gradient-to-br from-white via-stone-200 to-stone-400 drop-shadow-sm"
              >
                MindNest
              </motion.span>
            </h1>
            <motion.h2
                 initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                 animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                 transition={{ duration: 0.8, delay: 0.4 }}
                 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-primary to-amber-500 pb-2"
            >
                Clarify Your Chaos
            </motion.h2>
        </div>

        {/* Description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base sm:text-lg md:text-xl text-stone-300 max-w-xl md:max-w-2xl mx-auto leading-relaxed px-4"
        >
          A private sanctuary for your thoughts. Capture moments, track emotions, and unlock deep insights in a secure, futuristic journal.
        </motion.p>

        {/* CTA Button - Single & Powerful */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex justify-center pt-4"
        >
            <Link to="/auth" className="group relative w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] hover:shadow-[0_0_60px_-10px_rgba(245,158,11,0.7)] overflow-hidden flex items-center justify-center">
                {/* Internal Glow Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:animate-[shimmer_1.5s_infinite]" />
                
                <span className="relative flex items-center justify-center gap-3">
                   Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
            </Link>
        </motion.div>

      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary/50 to-transparent" />
      </motion.div>

    </section>
  );
};

export default HeroSection;
