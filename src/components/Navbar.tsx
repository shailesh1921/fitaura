import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-6 md:pt-[calc(2rem+env(safe-area-inset-top))] md:pb-8 bg-gradient-to-b from-[#f1f1f1]/80 to-transparent backdrop-blur-[2px] px-[calc(1.5rem+env(safe-area-inset-left))] pr-[calc(1.5rem+env(safe-area-inset-right))]">
      <div className="max-w-7xl mx-auto grid grid-cols-12 items-center relative">
        {/* Left: Cols 1-3 */}
        <div className="col-span-6 md:col-span-3 flex items-center gap-2">
          {/* Geometric dumbbell/pulse SVG icon */}
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#1a1a1a" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="7" width="2" height="10" rx="1" />
            <path d="M4 11H8.17L9.6 7.71C9.82 7.21 10.47 7.08 10.87 7.46L13.41 9.91L15.37 5.34C15.6 4.8 16.29 4.67 16.69 5.09L19.42 8H22C22.55 8 23 8.45 23 9C23 9.55 22.55 10 22 10H18.58L16.42 7.74L14.63 11.92C14.41 12.44 13.75 12.57 13.35 12.18L10.93 9.86L9.8 12.41C9.59 12.89 9.1 13.2 8.58 13.2H4C3.45 13.2 3 12.75 3 12.2C3 11.65 3.45 11.2 4 11.2Z" />
            <rect x="20" y="7" width="2" height="10" rx="1" />
          </svg>
          <span className="font-display font-bold text-xl uppercase tracking-tight text-[#1a1a1a]">
            FitAura
          </span>
        </div>

        {/* Center: Cols 4-9 */}
        <div className="hidden md:flex col-span-6 justify-center items-center gap-8">
          <a href="#programs" className="text-sm lowercase font-medium text-zinc-600 hover:text-black transition-colors duration-200">
            programs
          </a>
          <a href="#nutrition" className="text-sm lowercase font-medium text-zinc-600 hover:text-black transition-colors duration-200">
            nutrition
          </a>
          <a href="#about" className="text-sm lowercase font-medium text-zinc-600 hover:text-black transition-colors duration-200">
            about us
          </a>
          <a href="#community" className="text-sm lowercase font-medium text-zinc-600 hover:text-black transition-colors duration-200">
            community
          </a>
        </div>

        {/* Right: Cols 10-12 */}
        <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-3 md:gap-6">
          <a href="#coach" className="hidden lg:inline text-sm lowercase font-medium text-zinc-600 hover:text-black transition-colors duration-200">
            find a coach
          </a>
          <a 
            href="#get-started" 
            className="bg-[#1a1a1a] text-white hover:bg-zinc-800 transition-colors duration-200 text-sm h-11 px-5 rounded-full font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            get started <span className="text-xs">→</span>
          </a>
          
          {/* Animated Hamburger Button (44px/11w/11h tap target size) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col justify-center items-center w-11 h-11 relative z-50 text-[#1a1a1a] focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            <div className="flex flex-col gap-1.5 w-6">
              <motion.span
                animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-0.5 bg-[#1a1a1a] rounded-full origin-left"
              />
              <motion.span
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="w-full h-0.5 bg-[#1a1a1a] rounded-full"
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-0.5 bg-[#1a1a1a] rounded-full origin-left"
              />
            </div>
          </button>
        </div>

        {/* Mobile Drawer (Slides down) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-black/[0.05] md:hidden overflow-hidden z-40 shadow-lg"
            >
              <div className="flex flex-col items-center gap-2 py-6">
                <a href="#programs" className="w-full text-center py-3 text-zinc-600 hover:text-black font-medium lowercase text-base transition-colors duration-200" onClick={() => setIsOpen(false)}>
                  programs
                </a>
                <a href="#nutrition" className="w-full text-center py-3 text-zinc-600 hover:text-black font-medium lowercase text-base transition-colors duration-200" onClick={() => setIsOpen(false)}>
                  nutrition
                </a>
                <a href="#about" className="w-full text-center py-3 text-zinc-600 hover:text-black font-medium lowercase text-base transition-colors duration-200" onClick={() => setIsOpen(false)}>
                  about us
                </a>
                <a href="#community" className="w-full text-center py-3 text-zinc-600 hover:text-black font-medium lowercase text-base transition-colors duration-200" onClick={() => setIsOpen(false)}>
                  community
                </a>
                <a href="#coach" className="w-full text-center py-3 text-zinc-600 hover:text-black font-medium lowercase text-base transition-colors duration-200 border-t border-zinc-100 pt-4" onClick={() => setIsOpen(false)}>
                  find a coach
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
