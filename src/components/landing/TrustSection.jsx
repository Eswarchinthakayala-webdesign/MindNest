import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const TrustSection = () => {
  return (
    <section id="privacy" className="relative py-32 px-6 overflow-hidden flex items-center justify-center">
      
      {/* Divider */}
      <div className="absolute top-0 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Breathing Background Glow */}
      <motion.div 
        animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1] 
        }}
        transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
        }}
        className="absolute w-[500px] h-[500px] bg-primary rounded-full blur-[100px] z-0 pointer-events-none"
      />

      <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
        <div className="inline-flex justify-center mb-4">
             <ShieldCheck className="w-12 h-12 text-primary opacity-80" />
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          Your Local Sanctuary
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed">
           MindNest architecture ensures your thoughts stay private. 
           Encrypted locally, only accessible by you. 
           Find clarity without compromise.
        </p>
      </div>

    </section>
  );
};

export default TrustSection;
