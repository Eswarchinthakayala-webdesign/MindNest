import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { PenTool, Smile, BarChart2, FolderOpen, Lock, Sparkles, Layers, Zap } from 'lucide-react';

const features = [
  { 
    icon: PenTool, 
    title: "Rich Text Journaling", 
    desc: "Distraction-free editor with markdown support for pure writing flow." 
  },
  { 
    icon: Smile, 
    title: "Mood Tracking", 
    desc: "Visualize emotional trends with interactive, beautiful data points." 
  },
  { 
    icon: BarChart2, 
    title: "Deep Analytics", 
    desc: "Uncover patterns in your thinking with privacy-first data analysis." 
  },
  { 
    icon: FolderOpen, 
    title: "Smart Collections", 
    desc: "Auto-organize entries by topic, mood, or custom tags effortlessly." 
  },
  { 
    icon: Lock, 
    title: "Ironclad Privacy", 
    desc: "Local-first encryption. Your thoughts never leave your device unencrypted." 
  },
  { 
    icon: Zap, 
    title: "Instant Sync", 
    desc: "Seamlessly sync across devices without compromising security." 
  },
];

const FeatureCard = ({ feature, index }) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative h-full rounded-3xl border border-stone-800 bg-stone-900/50 overflow-hidden group"
    >
      {/* Spotlight Effect */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(245, 158, 11, 0.15), transparent 40%)`
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 p-8 h-full flex flex-col items-start gap-4">
        
        {/* Floating Icon Box */}
        <div className="relative mb-2">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-12 h-12 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-stone-400 group-hover:text-primary transition-colors duration-300" />
            </div>
        </div>

        <h3 className="text-xl font-bold text-stone-100 group-hover:text-amber-100 transition-colors">
          {feature.title}
        </h3>
        
        <p className="text-sm text-stone-400 leading-relaxed group-hover:text-stone-300 transition-colors">
          {feature.desc}
        </p>

        {/* Decorative Lines */}
        <div className="mt-auto pt-6 w-full flex items-center gap-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-32 px-6 z-10 overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Section Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/50 border border-stone-700 text-primary text-xs font-bold uppercase tracking-widest"
          >
            <Layers className="w-3 h-3" /> System Architecture
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tight"
          >
            Capabilities that <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Empower</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-stone-400 text-lg leading-relaxed"
          >
            Built for the modern mind. A suite of tools designed to help you capture, analyze, and understand your thoughts without friction.
          </motion.p>
        </div>

        {/* Bento Grid Layout - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
