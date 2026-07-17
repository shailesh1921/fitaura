import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative min-h-[110dvh] sm:min-h-[140dvh] w-full flex flex-col items-center justify-start overflow-hidden bg-bg-base">
      
      {/* Background Video Container */}
      <div className="absolute top-[15dvh] sm:top-[20dvh] left-0 w-full h-[70dvh] sm:h-[95dvh] md:h-[110dvh] lg:h-[120dvh] z-0 pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-100"
          src="https://assets.mixkit.co/videos/preview/mixkit-athlete-muscular-man-doing-crossfit-workout-40822-large.mp4"
        />
        {/* Gradient Mask to smoothly blend with background */}
        <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-bg-base to-transparent"></div>
        {/* Bottom fade to blend video end into background base */}
        <div className="absolute bottom-0 left-0 w-full h-32 sm:h-48 bg-gradient-to-t from-bg-base to-transparent"></div>
      </div>

      {/* Hero Content Alignment */}
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-8 md:px-16 lg:px-20 relative z-10 pt-[25dvh] sm:pt-[30dvh]">
        <div className="grid grid-cols-12 gap-x-4 md:gap-x-8">
          <div className="col-span-12 md:col-span-10 md:col-start-2 flex flex-col items-start">
            
            {/* Hero Header */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
              className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.1] font-medium tracking-tight text-left"
            >
              <span className="text-[#1a1a1a] block sm:inline">FitAura: Train with </span>
              <span className="text-[#8e8e8e] italic block sm:inline">intelligence</span>
              <br />
              <span className="text-[#8e8e8e] block mt-1 sm:mt-2">
                and personalized guidance to help you build
              </span>
              <br />
              <span className="text-[#8e8e8e] flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 sm:mt-2">
                <span>your</span>
                <span className="w-[36px] h-[18px] md:w-[48px] md:h-[26px] lg:w-[62px] lg:h-[34px] border-[2px] border-[#1a1a1a] rounded-full inline-flex items-center justify-center bg-white/85">
                  {/* Human Anatomy Silhouette SVG */}
                  <svg viewBox="0 0 24 24" className="w-[70%] h-[70%] p-[1px]" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    {/* Head */}
                    <circle cx="12" cy="5" r="2.2" fill="#1a1a1a" />
                    {/* Torso & shoulders */}
                    <path d="M7 10.5C7 8.5 8 8 12 8s5 .5 5 2.5V14c0 1-1 1.5-2 1.5H9c-1 0-2-.5-2-1.5v-3.5z" />
                    {/* Arms slightly raised */}
                    <path d="M7 9C5.5 8.5 4 8 4 7c0-1 1-1 1-1" />
                    <path d="M17 9c1.5-.5 3-1 3-2 0-1-1-1-1-1" />
                    {/* Legs */}
                    <path d="M9.5 15.5v5.5" />
                    <path d="M14.5 15.5v5.5" />
                  </svg>
                </span>
                <span>physical strength.</span>
              </span>
            </motion.h1>

            {/* Search Pill Component (Height > 44px, Button is 44px) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mt-8 sm:mt-12 w-full max-w-md sm:max-w-lg"
            >
              <div className="bg-white rounded-[6px] border border-black/[0.05] p-1.5 pl-4 flex items-center shadow-sm focus-within:border-black/20 transition-all duration-300 min-h-[52px]">
                <input 
                  type="text"
                  placeholder="Ask your AI coach anything..." 
                  className="bg-transparent border-none outline-none flex-grow text-zinc-900 placeholder:text-zinc-400 text-sm sm:text-base py-1.5 pr-4 focus:ring-0 focus:outline-none"
                />
                <button className="bg-[#1a1a1a] hover:bg-zinc-800 transition-colors text-white w-11 h-11 rounded-full relative flex items-center justify-center flex-shrink-0 cursor-pointer shadow-md">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-white fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Architectural Edge Anchors */}
      
      {/* Absolute middle right edge: Language switcher (Hidden on mobile/below sm, uses env for safe area insets) */}
      <div className="absolute top-[40%] sm:top-[45%] right-[calc(1.5rem+env(safe-area-inset-right))] md:right-[calc(3rem+env(safe-area-inset-right))] -translate-y-1/2 z-20 hidden sm:block">
        <button className="bg-white/40 backdrop-blur-md border border-black/[0.05] rounded-full h-11 px-5 text-xs font-semibold hover:bg-white/60 transition-all text-[#1a1a1a] uppercase tracking-wider shadow-sm flex items-center justify-center cursor-pointer">
          en <span className="text-zinc-400 mx-1.5 font-normal">—</span> hi
        </button>
      </div>

      {/* Absolute bottom left corner (Desktop-only, uses env for safe area insets) */}
      <div className="absolute bottom-[calc(2.5rem+env(safe-area-inset-bottom))] left-[calc(2rem+env(safe-area-inset-left))] z-20 hidden sm:block text-xs text-zinc-400 font-mono tracking-widest">
        2026
      </div>

      {/* Absolute bottom right corner (Desktop-only, uses env for safe area insets) */}
      <div className="absolute bottom-[calc(2.5rem+env(safe-area-inset-bottom))] right-[calc(2rem+env(safe-area-inset-right))] z-20 hidden sm:block text-xs text-zinc-400 font-mono tracking-wider">
        fitness & nutrition tools
      </div>

      {/* Mobile center row at the bottom (Mobile-only, uses env for safe area insets) */}
      <div className="sm:hidden flex flex-row justify-center items-center gap-4 text-center absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] left-[calc(1.5rem+env(safe-area-inset-left))] right-[calc(1.5rem+env(safe-area-inset-right))] z-20 text-xs text-zinc-400 font-mono">
        <span>2026</span>
        <span className="text-zinc-300">•</span>
        <span>fitness & nutrition tools</span>
      </div>

    </section>
  );
}
