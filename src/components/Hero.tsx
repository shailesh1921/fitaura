import { motion } from 'motion/react';
import AnatomyModel from './AnatomyModel';

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] w-full flex flex-col items-center justify-start overflow-hidden bg-bg-base pt-[10vh]">
      
      {/* Editorial Typographic Layout (Layered behind/beside 3D model) */}
      <div className="absolute inset-0 flex flex-col justify-between pt-[18dvh] pb-[10dvh] px-6 sm:px-12 md:px-20 pointer-events-none z-0">
        
        {/* Top Row: Left Headline & Right Description */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end w-full gap-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-extrabold text-[12vw] sm:text-[8vw] md:text-[6vw] leading-[0.9] tracking-tighter text-[#1a1a1a] select-none text-left"
          >
            KNOW YOUR<br />
            <span className="font-serif italic font-light text-[#C05C46]">body.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xs text-zinc-500 text-sm md:text-base font-sans mt-2 md:mt-0 md:mb-1 text-left leading-relaxed"
          >
            FitAura integrates custom anatomical mapping with advanced AI-driven nutrition systems. Crafting training blueprints engineered specifically for your physical profile.
          </motion.p>
        </div>
        
        {/* Bottom Row: Left CTA Button & Right Headline */}
        <div className="flex flex-col-reverse md:flex-row md:justify-between items-start md:items-end w-full gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start gap-4 mb-2 md:mb-0"
          >
            <a 
              href="app/dashboard.html"
              className="bg-charcoal hover:bg-terracotta text-[#FAF6F0] font-medium text-sm h-12 px-8 rounded-full pointer-events-auto transition-colors duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 group"
            >
              Start Your Plan 
              <span className="text-xs transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-extrabold text-[12vw] sm:text-[8vw] md:text-[6vw] leading-[0.9] tracking-tighter text-[#1a1a1a] select-none text-left md:text-right"
          >
            TRAIN WITH<br />
            <span className="font-serif italic font-light text-zinc-400">purpose.</span>
          </motion.h1>
        </div>

      </div>

      {/* 3D Anatomy Model Wrapper (Layered on top of typography, centered) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full pointer-events-auto"
        >
          <AnatomyModel />
        </motion.div>
      </div>

      {/* Soft overlay gradients to frame the hero */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-bg-base to-transparent pointer-events-none z-20" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-bg-base to-transparent pointer-events-none z-20" />

    </section>
  );
}
