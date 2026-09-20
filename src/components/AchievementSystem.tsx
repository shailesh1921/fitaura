import { motion } from 'motion/react';
import { Lock, Trophy } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedDate?: string;
}

const achievements: Achievement[] = [
  { id: 'first_workout', title: 'First Blood', description: 'Complete your first workout', emoji: '💪', unlocked: true, unlockedDate: '2024-01-15' },
  { id: 'streak_7', title: '7-Day Warrior', description: 'Train 7 days in a row', emoji: '🔥', unlocked: true, unlockedDate: '2024-02-01' },
  { id: 'bench_100', title: '100kg Bench Club', description: 'Bench press 100kg', emoji: '🏋️', unlocked: true, unlockedDate: '2024-03-20' },
  { id: 'volume_1000', title: 'Volume Monster', description: '1000kg total volume in one session', emoji: '💀', unlocked: false },
  { id: 'protein_30', title: 'Protein Machine', description: 'Hit protein goal 30 days straight', emoji: '🥩', unlocked: false },
  { id: 'early_bird', title: '5am Warrior', description: 'Train before 6am', emoji: '🌅', unlocked: false },
  { id: 'top_10', title: 'Elite Rank', description: 'Reach top 10 on leaderboard', emoji: '🏆', unlocked: true, unlockedDate: '2024-04-10' },
  { id: 'consistency', title: 'Iron Will', description: '90% consistency for 3 months', emoji: '⚡', unlocked: false }
];

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
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export const AchievementSystem = () => {
  return (
    <div className="w-full bg-[#0A0A0F] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-[#7000FF]" />
          <h2 className="font-display text-3xl font-bold">Achievements</h2>
        </header>
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {achievements.map((ach) => (
            <motion.div 
              key={ach.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className={`relative p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300
                ${ach.unlocked 
                  ? 'bg-white/[0.03] border-[#7000FF]/30 shadow-[0_0_15px_rgba(112,0,255,0.1)] hover:shadow-[0_0_25px_rgba(112,0,255,0.2)] hover:border-[#7000FF]/60' 
                  : 'bg-white/[0.01] border-white/5 opacity-40 grayscale'
                }`}
            >
              {!ach.unlocked && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-4 h-4 text-white/50" />
                </div>
              )}
              
              <div className="text-4xl mb-3 flex items-center justify-center h-16 w-16 bg-white/5 rounded-full mx-auto">
                {ach.emoji}
              </div>
              
              <div className="text-center">
                <h3 className="font-display font-bold text-white mb-1 text-sm md:text-base">{ach.title}</h3>
                <p className="font-sans text-xs text-white/60 mb-3">{ach.description}</p>
                
                {ach.unlocked && ach.unlockedDate && (
                  <div className="inline-block px-2 py-1 rounded bg-[#7000FF]/20 border border-[#7000FF]/30 font-mono text-[10px] text-[#00F0FF]">
                    {ach.unlockedDate}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
