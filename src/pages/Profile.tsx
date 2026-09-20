import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Dumbbell, TrendingDown, Target, Skull } from 'lucide-react';
import { useBeastMode } from '../context/BeastModeContext';
import { AchievementSystem } from '../components/AchievementSystem';

export const Profile = () => {
  const { beastMode, toggleBeastMode } = useBeastMode();
  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  // Readiness Score Animation State
  const score = 82;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);

  useEffect(() => {
    // Animate to the score value after a short delay
    const timeout = setTimeout(() => {
      setStrokeDashoffset(circumference - (score / 100) * circumference);
    }, 100);
    return () => clearTimeout(timeout);
  }, [circumference, score]);

  // Determine color based on score (red -> yellow -> green)
  const getScoreColor = (val: number) => {
    if (val < 50) return '#FF3366'; // Danger/Red
    if (val < 75) return '#F59E0B'; // Yellow/Amber
    return '#10B981'; // Green
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6 md:p-12 font-sans selection:bg-[#7000FF]/30">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-12"
      >
        {/* Top Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-4">
          <div className={`relative w-[120px] h-[120px] rounded-full p-[3px] transition-all duration-500 flex items-center justify-center ${
            beastMode 
              ? 'bg-gradient-to-br from-[#FF0033] to-[#FF5500] shadow-[0_0_30px_rgba(255,0,51,0.5)]' 
              : 'bg-gradient-to-br from-[#7000FF] to-[#00F0FF]'
          }`}>
            <div className="w-full h-full bg-[#0A0A0F] rounded-full flex items-center justify-center">
              <User size={48} className={beastMode ? 'text-[#FF0033]' : 'text-[#00F0FF]'} />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight">Shailesh Singh</h1>
            <p className="text-zinc-400 mt-1">Elite Athlete · Member since 2024</p>
          </div>

          {/* Beast Mode Toggle */}
          <div className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl max-w-sm w-full">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                beastMode ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400'
              }`}>
                <Skull size={22} className={beastMode ? 'animate-bounce' : ''} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                  BEAST MODE
                  {beastMode && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-mono">ACTIVE</span>}
                </div>
                <div className="text-zinc-500 text-xs">
                  {beastMode ? 'Maximum aggression & blood red theme' : 'Toggle for high-intensity protocols'}
                </div>
              </div>
            </div>
            <button
              onClick={toggleBeastMode}
              className={`w-14 h-8 rounded-full p-1 transition-colors relative cursor-pointer ${
                beastMode ? 'bg-[#FF0033]' : 'bg-zinc-700'
              }`}
            >
              <motion.div
                animate={{ x: beastMode ? 24 : 0 }}
                transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
                className="w-6 h-6 rounded-full bg-white shadow-md"
              />
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Workouts', value: '47', icon: Dumbbell },
            { label: 'Weight Lost', value: '12.4 kg', icon: TrendingDown },
            { label: 'Consistency', value: '89%', icon: Target }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <stat.icon className="text-[#00F0FF] mb-2" size={24} />
              <span className="text-3xl font-mono font-bold">{stat.value}</span>
              <span className="text-zinc-500 uppercase tracking-widest text-xs font-semibold">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Readiness Score & Body Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Readiness Score */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center">
            <h2 className="text-xl font-display font-semibold mb-6 w-full text-left">Readiness Score</h2>
            <div className="relative flex items-center justify-center">
              <svg width="160" height="160" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={getScoreColor(score)}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                    transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-mono font-bold text-white">{score}</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">/ 100</span>
              </div>
            </div>
            <p className="mt-6 text-sm text-zinc-400 text-center">Prime condition for a heavy session.</p>
          </motion.div>

          {/* Body Metrics */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col">
            <h2 className="text-xl font-display font-semibold mb-6">Body Metrics</h2>
            <div className="flex-1 flex flex-col justify-between space-y-4">
              {[
                { label: 'Height', value: '178 cm' },
                { label: 'Weight', value: '76.4 kg' },
                { label: 'Body Fat', value: '16.2%' },
                { label: 'BMR', value: '1,842 kcal' }
              ].map((metric, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 last:pb-0">
                  <span className="text-zinc-500 font-medium">{metric.label}</span>
                  <span className="text-white font-mono font-semibold">{metric.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Training Preferences */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-display font-semibold">Training Preferences</h2>
          <div className="flex flex-wrap gap-3">
            {['Hypertrophy', 'Push/Pull/Legs', 'Gym Equipment', '60 min sessions'].map((pref, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-full bg-[#7000FF]/10 text-purple-400 border border-[#7000FF]/20 text-sm font-medium hover:bg-[#7000FF]/20 transition-colors cursor-default"
              >
                {pref}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements System */}
        <motion.div variants={itemVariants}>
          <AchievementSystem />
        </motion.div>

      </motion.div>
    </div>
  );
};
