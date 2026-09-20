import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Dumbbell, TrendingDown, Target } from 'lucide-react';

export const Profile = () => {
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
          <div className="relative w-[120px] h-[120px] rounded-full p-[3px] bg-gradient-to-br from-[#7000FF] to-[#00F0FF] flex items-center justify-center">
            <div className="w-full h-full bg-[#0A0A0F] rounded-full flex items-center justify-center">
              <User size={48} className="text-[#00F0FF]" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight">Shailesh Singh</h1>
            <p className="text-zinc-400 mt-1">Elite Athlete · Member since 2024</p>
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

        {/* Achievements */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-display font-semibold">Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: '🔥', title: '7-Day Streak' },
              { emoji: '💪', title: '100kg Bench' },
              { emoji: '🏆', title: 'Top 10 Leaderboard' }
            ].map((achievement, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 hover:-translate-y-1 transition-transform duration-300"
              >
                <span className="text-4xl drop-shadow-lg">{achievement.emoji}</span>
                <span className="font-semibold text-sm">{achievement.title}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};
