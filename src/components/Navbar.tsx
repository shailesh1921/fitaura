import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-6 md:pt-[calc(2rem+env(safe-area-inset-top))] md:pb-8 bg-gradient-to-b from-[#FAF6F0] to-transparent backdrop-blur-[2px] px-[calc(1.5rem+env(safe-area-inset-left))] pr-[calc(1.5rem+env(safe-area-inset-right))]">
      <div className="max-w-7xl mx-auto grid grid-cols-12 items-center relative">
        {/* Left: Cols 1-3 */}
        <div className="col-span-6 md:col-span-3 flex items-center gap-2">
          {/* Geometric pulse SVG icon */}
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#C05C46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span className="font-display font-bold text-xl uppercase tracking-widest text-charcoal">
            FitAura
          </span>
        </div>

        {/* Center: Cols 4-9 */}
        <div className="hidden md:flex col-span-6 justify-center items-center gap-10">
          <a href="#intelligence" className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-terracotta transition-colors duration-300">
            Intelligence
          </a>
          <a href="#diet-plan" className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-terracotta transition-colors duration-300">
            Nutrition
          </a>
          <a href="#athletes" className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-terracotta transition-colors duration-300">
            Athletes
          </a>
        </div>

        {/* Right: Cols 10-12 */}
        <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-3 md:gap-6">
          <a 
            href="app/dashboard.html" 
            className="bg-charcoal text-[#FAF6F0] hover:bg-terracotta transition-colors duration-300 text-[10px] font-mono tracking-widest uppercase h-10 px-6 rounded-full flex items-center justify-center cursor-pointer shadow-sm"
          >
            Access
          </a>
          
          {/* Animated Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col justify-center items-center w-11 h-11 relative z-50 text-charcoal focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            <div className="flex flex-col gap-1.5 w-6">
              <motion.span
                animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-px bg-charcoal rounded-full origin-left"
              />
              <motion.span
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="w-full h-px bg-charcoal rounded-full"
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-px bg-charcoal rounded-full origin-left"
              />
            </div>
          </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute top-full left-0 w-full bg-[#FAF6F0]/95 backdrop-blur-xl border-b border-zinc-200/50 md:hidden overflow-hidden z-40 shadow-xl"
            >
              <div className="flex flex-col items-center gap-2 py-8">
                <a href="#intelligence" className="w-full text-center py-4 text-zinc-500 hover:text-terracotta font-mono text-xs tracking-widest uppercase transition-colors duration-300" onClick={() => setIsOpen(false)}>
                  Intelligence
                </a>
                <a href="#diet-plan" className="w-full text-center py-4 text-zinc-500 hover:text-terracotta font-mono text-xs tracking-widest uppercase transition-colors duration-300" onClick={() => setIsOpen(false)}>
                  Nutrition
                </a>
                <a href="#athletes" className="w-full text-center py-4 text-zinc-500 hover:text-terracotta font-mono text-xs tracking-widest uppercase transition-colors duration-300" onClick={() => setIsOpen(false)}>
                  Athletes
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
