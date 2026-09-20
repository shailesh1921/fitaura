import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { useBeastMode } from '../context/BeastModeContext';

interface AnimatedCounterProps {
  target: string;
  label: string;
  subtext?: string;
}

export const AnimatedCounter = ({ target, label, subtext }: AnimatedCounterProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState('0');
  const { beastMode } = useBeastMode();

  useEffect(() => {
    if (!isInView) return;

    // Parse numbers out of target
    // Examples: '10,000+', '98%', '0.4s', '4.9/5'
    if (target.includes('10,000')) {
      let current = 0;
      const step = 10000 / 40;
      const interval = setInterval(() => {
        current += step;
        if (current >= 10000) {
          setDisplayValue('10,000+');
          clearInterval(interval);
        } else {
          setDisplayValue(`${Math.floor(current).toLocaleString()}+`);
        }
      }, 25);
      return () => clearInterval(interval);
    } else if (target.includes('98%')) {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current >= 98) {
          setDisplayValue('98%');
          clearInterval(interval);
        } else {
          setDisplayValue(`${current}%`);
        }
      }, 20);
      return () => clearInterval(interval);
    } else if (target.includes('0.4')) {
      let current = 0.0;
      const interval = setInterval(() => {
        current += 0.05;
        if (current >= 0.4) {
          setDisplayValue('0.4s');
          clearInterval(interval);
        } else {
          setDisplayValue(`${current.toFixed(1)}s`);
        }
      }, 30);
      return () => clearInterval(interval);
    } else if (target.includes('4.9')) {
      let current = 0.0;
      const interval = setInterval(() => {
        current += 0.2;
        if (current >= 4.9) {
          setDisplayValue('4.9/5');
          clearInterval(interval);
        } else {
          setDisplayValue(`${current.toFixed(1)}/5`);
        }
      }, 25);
      return () => clearInterval(interval);
    } else {
      setDisplayValue(target);
    }
  }, [isInView, target]);

  return (
    <div ref={ref} className="relative flex flex-col items-center justify-center p-6 text-center group">
      {/* Pulsating neon halo behind number */}
      <div
        className="absolute w-24 h-24 rounded-full opacity-20 blur-xl pointer-events-none transition-all duration-700 group-hover:opacity-40 animate-pulse"
        style={{
          background: beastMode
            ? 'radial-gradient(circle, #FF0033 0%, transparent 70%)'
            : 'radial-gradient(circle, #7000FF 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 20 }}
        className="relative z-10 text-4xl sm:text-5xl font-mono font-bold tracking-tight mb-2"
        style={{
          color: beastMode ? '#FF3366' : '#FFFFFF',
          textShadow: beastMode
            ? '0 0 20px rgba(255, 0, 51, 0.4)'
            : '0 0 20px rgba(112, 0, 255, 0.3)',
        }}
      >
        {displayValue}
      </motion.div>

      <div
        className="text-[11px] font-mono tracking-widest uppercase mb-1 font-semibold"
        style={{ color: beastMode ? '#FF5500' : '#00F0FF' }}
      >
        {label}
      </div>

      {subtext && <p className="text-zinc-500 text-xs font-sans">{subtext}</p>}
    </div>
  );
};
