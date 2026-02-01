import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Heart, Lightbulb, TrendingUp, ShieldCheck } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="relative py-24 px-6 z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Content Side */}
        <div className="space-y-10 relative z-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-800/60 border border-t-stone-700 border-b-stone-900 border-x-stone-800 text-stone-300 text-xs font-bold uppercase tracking-widest shadow-lg"
          >
            <Lightbulb className="w-3.5 h-3.5 text-primary" /> Our Core Vision
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
          >
            Mental clarity is the foundation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-200 to-amber-500">Human Potential</span>.
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-stone-400 leading-relaxed max-w-xl"
          >
            In a world of constant noise, MindNest is your silent partner. We engineer a sanctuary where thoughts mature into ideas, and emotions find their true balance.
          </motion.p>
          
          {/* Feature Grid with Hover Effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
            {[
              { icon: BrainCircuit, title: "Cognitive Focus", desc: "Reduce cognitive load." },
              { icon: Heart, title: "Emotional Balance", desc: "Track your inner landscape." },
              { icon: TrendingUp, title: "Growth Mindset", desc: "Visualize your progress." },
              { icon: ShieldCheck, title: "Safe Space", desc: "Zero-judgment privacy." },
            ].map((item, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.4 + (i * 0.1) }}
                 whileHover={{ scale: 1.02, backgroundColor: "rgba(28, 25, 23, 0.8)" }}
                 className="flex items-start gap-4 p-4 rounded-2xl bg-stone-900/40 border border-stone-800/80 hover:border-primary/30 transition-all duration-300 group cursor-default"
               >
                  <div className="bg-stone-800/50 p-3 rounded-xl text-stone-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                      <h4 className="font-bold text-stone-200 group-hover:text-white transition-colors">{item.title}</h4>
                      <p className="text-xs md:text-sm text-stone-500 mt-1 leading-snug">{item.desc}</p>
                  </div>
               </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Advanced Visual */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.4 }}
            className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-[2.5rem] overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl shadow-black/50"
        >
             {/* Dynamic Background */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.15),transparent_70%)]" />
             <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent z-10" />

             {/* Central Animation: The "Mind" Model */}
             <div className="absolute inset-0 flex items-center justify-center z-0">
                 <div className="relative w-full h-full flex items-center justify-center">
                    
                    {/* Ring 1 (Slow) */}
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[80%] aspect-square rounded-full border border-dashed border-stone-800/60"
                    />
                    
                    {/* Ring 2 (Medium Reverse) */}
                    <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[60%] aspect-square rounded-full border border-stone-700/30"
                    >
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                    </motion.div>

                    {/* Ring 3 (Fast) */}
                    <motion.div 
                        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                        transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
                        className="absolute w-[40%] aspect-square rounded-full border-2 border-primary/20"
                    />

                    {/* Core */}
                    <motion.div 
                        animate={{ boxShadow: ["0 0 20px rgba(245,158,11,0.2)", "0 0 60px rgba(245,158,11,0.6)", "0 0 20px rgba(245,158,11,0.2)"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-24 h-24 bg-gradient-to-br from-primary via-amber-600 to-amber-900 rounded-full blur-md opacity-80"
                    />
                    <div className="relative w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center border border-stone-700 z-10 backdrop-blur-md">
                       <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
                    </div>

                 </div>
             </div>
             
             {/* Floating Data Widgets (Responsive Positioning) */}
             <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-8 z-20 p-4 rounded-2xl bg-stone-900/90 border border-stone-800 backdrop-blur-md shadow-xl max-w-[160px]"
             >
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] uppercase font-bold text-stone-500">Live Status</span>
                </div>
                <div className="text-sm font-medium text-stone-300">Synchronizing...</div>
             </motion.div>

             <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-8 left-8 z-20 p-4 rounded-2xl bg-stone-900/90 border border-stone-800 backdrop-blur-md shadow-xl w-auto"
             >
                <div className="flex items-end gap-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-stone-500 mb-1">Weekly Focus</div>
                    <div className="text-3xl font-bold text-white">42<span className="text-sm text-primary font-normal">hrs</span></div>
                  </div>
                  <div className="h-8 w-px bg-stone-800" />
                  <div>
                      <div className="text-[10px] uppercase font-bold text-stone-500 mb-1">Mood Score</div>
                      <div className="text-xl font-bold text-amber-400">9.2</div>
                  </div>
                </div>
             </motion.div>

        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;
