import { motion } from 'motion/react';
import { Zap, Brain, Shield, Activity, ArrowRight, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Coach',
    description: 'Neural engine that adapts to your RPE, detects plateaus, and autoregulates your training in real-time.',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    icon: Activity,
    title: 'Adaptive Engine',
    description: 'Exponential fatigue decay modeling with per-muscle-group recovery tracking and deload logic.',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    icon: Shield,
    title: 'Offline-First',
    description: 'Log entire workouts underground with zero signal. Data syncs seamlessly when you surface.',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    icon: Zap,
    title: 'Indian Nutrition',
    description: 'Hyper-localized macro profiles for North/South Indian diets. Paneer, dal, roti — all precision-mapped.',
    gradient: 'from-amber-400 to-orange-500',
  },
];

const STATS = [
  { value: '10,000+', label: 'Plans Generated' },
  { value: '98%', label: 'Goal Completion' },
  { value: '0.4s', label: 'AI Response Time' },
  { value: '4.9/5', label: 'Athlete Rating' },
];

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #7000FF 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #00F0FF 0%, transparent 70%)' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Status badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{ background: 'rgba(112, 0, 255, 0.1)', border: '1px solid rgba(112, 0, 255, 0.2)' }}
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-xs font-mono tracking-wider text-purple-300">AI ENGINE v3.0 ACTIVE</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.95] mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="block">Your Body.</span>
            <span className="block bg-gradient-to-r from-purple-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Our Intelligence.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The world's most advanced AI fitness platform. Real-time autoregulation, 
            exponential fatigue modeling, and hyper-localized Indian nutrition — all in your pocket.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={() => window.location.href = '/workout'}
              className="group px-8 py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2"
              style={{ 
                background: 'linear-gradient(135deg, #7000FF, #5000CC)',
                boxShadow: '0 0 20px rgba(112, 0, 255, 0.4), 0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              Start Training
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => window.location.href = '/diet'}
              className="px-8 py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 text-zinc-300 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Talk to AI Coach
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 rounded-full border border-zinc-700 flex justify-center pt-1.5">
            <motion.div 
              animate={{ y: [0, 8], opacity: [1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1 rounded-full bg-zinc-500" 
            />
          </div>
        </motion.div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="border-y border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-4 block">Core Intelligence</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Built Different.
              <span className="block text-zinc-500 font-light italic" style={{ fontFamily: 'var(--font-serif)' }}>
                Engineered for dominance.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative rounded-2xl p-8 transition-all duration-500 cursor-pointer overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Hover glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${feature.gradient} pointer-events-none`}
                  style={{ opacity: 0, mixBlendMode: 'overlay' }}
                />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-12 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#7000FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="font-bold text-lg tracking-widest uppercase">FitAura</span>
          </div>
          <p className="text-zinc-600 text-xs font-mono tracking-wider">
            © 2024 FitAura AI. Built with obsession.
          </p>
        </div>
      </footer>
    </div>
  );
};
