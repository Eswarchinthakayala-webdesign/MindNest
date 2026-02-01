import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const shapes = ['circle', 'rect', 'line', 'curve'];

const RandomShape = ({ type, color }) => {
  switch (type) {
    case 'circle':
      return <circle cx="50" cy="50" r="40" fill={color} opacity="0.4" />;
    case 'rect':
      return <rect x="20" y="20" width="60" height="60" rx="10" fill={color} opacity="0.3" />;
    case 'line':
      return <line x1="10" y1="10" x2="90" y2="90" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.5" />;
    case 'curve':
      return <path d="M10,50 Q50,10 90,50" stroke={color} fill="none" strokeWidth="4" strokeLinecap="round" opacity="0.5" />;
    default:
      return null;
  }
};

const FloatingElement = ({ delay, scrollYProgress }) => {
  const [randomProps] = useState(() => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 20 + Math.random() * 60,
    duration: 15 + Math.random() * 20,
    type: shapes[Math.floor(Math.random() * shapes.length)],
    color: Math.random() > 0.5 ? 'var(--color-primary)' : 'var(--color-secondary)'
  }));

  // Parallax effect based on scroll
  const y = useTransform(scrollYProgress, [0, 1], [0, -200 - Math.random() * 300]);
  
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${randomProps.left}%`,
        top: `${randomProps.top}%`,
        width: randomProps.size,
        height: randomProps.size,
        y: y
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0.2, 0.5, 0.2],
        y: [0, -50, 0],
        rotate: [0, 360],
      }}
      transition={{
        duration: randomProps.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
        times: [0, 0.5, 1] // Keyframes for opacity/y oscillation
      }}
      className="pointer-events-none blur-sm"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <RandomShape type={randomProps.type} color={randomProps.color} />
      </svg>
    </motion.div>
  );
};

const AntiGravityBackground = () => {
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, { damping: 15, stiffness: 100 });
  
  // Custom interactive lines
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-background/90" /> {/* Slight overlay if needed */}
      
      {/* Generate 20 random floating elements */}
      {Array.from({ length: 20 }).map((_, i) => (
        <FloatingElement key={i} delay={i * 0.5} scrollYProgress={smoothScroll} />
      ))}
      
      {/* Subtle Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/15 rounded-full blur-[120px]" />
      {/* Extra central warmth */}
      <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[150px]" />
    </div>
  );
};

export default AntiGravityBackground;
