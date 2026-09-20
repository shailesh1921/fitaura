import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface BeastModeContextType {
  beastMode: boolean;
  toggleBeastMode: () => void;
  accentColor: string;
  glowColor: string;
}

const BeastModeContext = createContext<BeastModeContextType>({
  beastMode: false,
  toggleBeastMode: () => {},
  accentColor: '#7000FF',
  glowColor: 'rgba(112, 0, 255, 0.3)',
});

export const useBeastMode = () => useContext(BeastModeContext);

export const BeastModeProvider = ({ children }: { children: ReactNode }) => {
  const [beastMode, setBeastMode] = useState(false);

  const toggleBeastMode = () => setBeastMode(prev => !prev);

  const accentColor = beastMode ? '#FF0033' : '#7000FF';
  const glowColor = beastMode ? 'rgba(255, 0, 51, 0.3)' : 'rgba(112, 0, 255, 0.3)';

  return (
    <BeastModeContext.Provider value={{ beastMode, toggleBeastMode, accentColor, glowColor }}>
      {/* Ambient particles when beast mode is on */}
      {beastMode && (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-red-500/30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}
      {children}
    </BeastModeContext.Provider>
  );
};
