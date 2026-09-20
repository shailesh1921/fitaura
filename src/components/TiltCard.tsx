import { useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useBeastMode } from '../context/BeastModeContext';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  gradient?: string;
  isNew?: boolean;
}

export const TiltCard = ({
  children,
  className = '',
  href,
  isNew = false,
}: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { beastMode } = useBeastMode();
  const [isHovered, setIsHovered] = useState(false);

  // Mouse coordinate motion values normalized from -0.5 to 0.5
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for rotation
  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 });

  // Convert to degree rotation: tilt up to 14 degrees
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-12, 12]);

  // Glare reflection position in percentage
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const CardContent = (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
      className={`relative rounded-2xl p-5 overflow-hidden transition-shadow duration-300 border ${
        beastMode
          ? isHovered
            ? 'border-[#FF0033]/60 shadow-[0_0_25px_rgba(255,0,51,0.25)]'
            : 'border-white/[0.07] bg-white/[0.02]'
          : isHovered
            ? 'border-[#7000FF]/60 shadow-[0_0_25px_rgba(112,0,255,0.25)]'
            : 'border-white/[0.07] bg-white/[0.02]'
      } backdrop-blur-xl ${className}`}
    >
      {/* Dynamic Specular Glare */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute -inset-full opacity-35"
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.25) 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Subtle border glow line on hover */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          boxShadow: `inset 0 0 15px ${beastMode ? 'rgba(255,0,51,0.2)' : 'rgba(112,0,255,0.2)'}`,
        }}
      />

      {/* NEW Badge */}
      {isNew && (
        <div className="absolute top-3 right-3 z-10">
          <span
            className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full font-bold shadow-sm"
            style={{
              background: beastMode ? 'rgba(255, 0, 51, 0.2)' : 'rgba(112, 0, 255, 0.2)',
              color: beastMode ? '#FF3366' : '#00F0FF',
              border: `1px solid ${beastMode ? 'rgba(255, 0, 51, 0.4)' : 'rgba(0, 240, 255, 0.3)'}`,
            }}
          >
            NEW
          </span>
        </div>
      )}

      <div style={{ transform: 'translateZ(30px)' }}>{children}</div>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="block no-underline">
        {CardContent}
      </a>
    );
  }

  return CardContent;
};
