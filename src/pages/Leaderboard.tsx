import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Crown } from 'lucide-react';

const ATHLETES = [
  { rank: 1, name: 'Arjun Kapoor', score: 9847, trend: 'up', avatar: '🏋️' },
  { rank: 2, name: 'Priya Sharma', score: 9231, trend: 'up', avatar: '💪' },
  { rank: 3, name: 'Rahul Dev', score: 8976, trend: 'down', avatar: '🔥' },
  { rank: 4, name: 'Ananya Patel', score: 8654, trend: 'up', avatar: '⚡' },
  { rank: 5, name: 'Vikram Singh', score: 8432, trend: 'up', avatar: '🎯' },
  { rank: 6, name: 'Meera Reddy', score: 8201, trend: 'down', avatar: '💎' },
  { rank: 7, name: 'Shailesh Singh', score: 7856, trend: 'up', avatar: '🚀', isUser: true },
  { rank: 8, name: 'Deepak Nair', score: 7654, trend: 'down', avatar: '🏆' },
  { rank: 9, name: 'Kavitha Iyer', score: 7432, trend: 'up', avatar: '⭐' },
  { rank: 10, name: 'Rohan Gupta', score: 7201, trend: 'up', avatar: '🎖️' },
];

export const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('This Week');
  const tabs = ['This Week', 'This Month', 'All Time'];

  const top3 = ATHLETES.slice(0, 3);
  const rest = ATHLETES.slice(3);

  // Podium order: 2, 1, 3 for visual display
  const podiumOrder = [top3[1], top3[0], top3[2]];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6 md:p-12 font-sans overflow-x-hidden">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-[#7000FF] to-[#00F0FF] bg-clip-text text-transparent mb-3"
        >
          Global Rankings
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-lg"
        >
          Compete with athletes worldwide
        </motion.p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-16">
        <div className="flex p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(112,0,255,0.2)]'
                  : 'text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Podium */}
      <div className="max-w-3xl mx-auto mb-24 mt-10">
        <div className="flex justify-center items-end gap-2 md:gap-6 h-64">
          {/* Rank 2 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            className="flex flex-col items-center relative z-10 w-28 md:w-40"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gray-300 rounded-full blur-xl opacity-20"></div>
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-gray-300/50 bg-[#0A0A0F] flex items-center justify-center text-3xl md:text-4xl shadow-[0_0_30px_rgba(209,213,219,0.3)] z-10 relative">
                {podiumOrder[0].avatar}
                <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center border-2 border-[#0A0A0F]">
                  <span className="text-black font-bold text-sm">2</span>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-t-2xl w-full h-32 flex flex-col items-center justify-start pt-4 border-b-0">
              <h3 className="font-bold text-gray-200 text-sm md:text-base text-center truncate w-full px-2">{podiumOrder[0].name}</h3>
              <p className="text-purple-400 font-mono font-semibold text-sm mt-1">{podiumOrder[0].score}</p>
            </div>
          </motion.div>

          {/* Rank 1 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            className="flex flex-col items-center relative z-20 w-32 md:w-48"
          >
            <div className="absolute -top-12 z-30">
              <Crown className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
            </div>
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-400/80 bg-[#0A0A0F] flex items-center justify-center text-4xl md:text-5xl shadow-[0_0_40px_rgba(250,204,21,0.5)] z-10 relative">
                {podiumOrder[1].avatar}
                <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-[#0A0A0F] shadow-[0_0_10px_rgba(250,204,21,0.8)]">
                  <span className="text-black font-black text-lg">1</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-t from-[#7000FF]/30 to-white/5 backdrop-blur-md border border-[#7000FF]/40 rounded-t-2xl w-full h-40 flex flex-col items-center justify-start pt-4 border-b-0 shadow-[0_-10px_30px_rgba(112,0,255,0.2)] relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>
              <h3 className="font-bold text-white text-base md:text-lg text-center truncate w-full px-2 relative z-10">{podiumOrder[1].name}</h3>
              <p className="text-purple-400 font-mono font-bold text-base mt-1 relative z-10">{podiumOrder[1].score}</p>
            </div>
          </motion.div>

          {/* Rank 3 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
            className="flex flex-col items-center relative z-10 w-28 md:w-40"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-amber-700 rounded-full blur-xl opacity-20"></div>
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-amber-700/60 bg-[#0A0A0F] flex items-center justify-center text-3xl md:text-4xl shadow-[0_0_30px_rgba(180,83,9,0.3)] z-10 relative">
                {podiumOrder[2].avatar}
                <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center border-2 border-[#0A0A0F]">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-t-2xl w-full h-24 flex flex-col items-center justify-start pt-4 border-b-0">
              <h3 className="font-bold text-gray-200 text-sm md:text-base text-center truncate w-full px-2">{podiumOrder[2].name}</h3>
              <p className="text-purple-400 font-mono font-semibold text-sm mt-1">{podiumOrder[2].score}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Rest of the list */}
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        {rest.map((athlete, index) => (
          <motion.div
            key={athlete.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className={`flex items-center justify-between p-4 rounded-xl backdrop-blur-xl transition-all duration-300 hover:bg-white/10 ${
              athlete.isUser
                ? 'bg-[#7000FF]/10 border border-[#7000FF]/50 shadow-[0_0_20px_rgba(112,0,255,0.2)]'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 text-center text-gray-400 font-mono font-bold text-lg">
                #{athlete.rank}
              </div>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl border border-white/10 shadow-inner">
                {athlete.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold ${athlete.isUser ? 'text-white' : 'text-gray-200'}`}>
                    {athlete.name}
                  </h4>
                  {athlete.isUser && (
                    <span className="text-[10px] uppercase tracking-wider bg-[#7000FF] text-white px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(112,0,255,0.6)]">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-mono text-xl font-bold text-purple-400">
                  {athlete.score.toLocaleString()}
                </span>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                athlete.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-[#FF3366]/10 text-[#FF3366]'
              }`}>
                {athlete.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
