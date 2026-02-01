import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Instagram, Github, ArrowUpRight, Mail } from 'lucide-react';
import { Logo } from '../ui/Logo';

const Footer = () => {
  const links = {
    product: ['Features', 'Security', 'Pricing', 'Changelog'],
    company: ['About', 'Blog', 'Careers', 'Brand'],
    legal: ['Privacy', 'Terms', 'License', 'Contact'],
  };

  return (
    <footer className="relative bg-stone-950 pt-24 pb-12 overflow-hidden">
      
      {/* Top Border Gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-800 to-transparent" />
      
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Main CTA Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 mb-20">
            <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">
                    Ready to clarify your <br />
                    <span className="text-stone-600">inner chaos?</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="w-full sm:w-80 bg-stone-900/50 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-stone-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-stone-200 transition-colors">
                        Join Waitlist
                    </button>
                </div>
            </div>

            {/* Socials - Floating */}
            <div className="flex gap-4">
                {[Twitter, Instagram, Github].map((Icon, i) => (
                    <a key={i} href="#" className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-600 hover:-translate-y-1 transition-all duration-300">
                        <Icon className="w-5 h-5" />
                    </a>
                ))}
            </div>
        </div>




        {/* Copyright */}
        <div className="flex flex-col  items-center justify-center pt-8 border-t border-stone-900 text-xs text-stone-600">
            <p>&copy; 2026 MindNest Inc. All rights reserved.</p>
         
        </div>

      </div>
    </footer>
  );
};

export default Footer;
