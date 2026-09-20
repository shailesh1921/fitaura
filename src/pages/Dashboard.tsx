import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Zap, Brain, Shield, Activity, ArrowRight, Sparkles,
  Camera, Utensils, Flame, BarChart3, Heart,
  Scan, Users, Cpu, FlaskConical, ChevronDown
} from 'lucide-react';
import { CyberParticleCanvas } from '../components/CyberParticleCanvas';
import { TiltCard } from '../components/TiltCard';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { useBeastMode } from '../context/BeastModeContext';
import DietModule from '../components/DietModule';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

// Quick-access cards linking to all existing features
const FEATURE_LINKS = [
  // NEW React Pages
  { title: '3D Muscle Heatmap', desc: 'Real-time 3D fatigue visualization', icon: Flame, href: '/heatmap', gradient: 'from-red-500 to-orange-500', isNew: true },
  { title: 'Indian Nutrition', desc: '80+ foods, Build My Plate', icon: Utensils, href: '/nutrition', gradient: 'from-amber-400 to-yellow-500', isNew: true },
  { title: 'Performance Lab', desc: 'Recharts analytics dashboard', icon: BarChart3, href: '/analytics-dashboard', gradient: 'from-purple-500 to-indigo-500', isNew: true },
  // Existing feature links (PRESERVED)
  { title: 'Food Scanner', desc: 'AI-powered food recognition', icon: Camera, href: '/app/food-scanner.html', gradient: 'from-green-400 to-emerald-500' },
  { title: 'Food Camera', desc: 'Scan meals for macros', icon: Scan, href: '/app/food-camera.html', gradient: 'from-lime-400 to-green-500' },
  { title: 'Nutrition Engine', desc: 'Indian diet protocols', icon: Utensils, href: '/app/diet.html', gradient: 'from-amber-400 to-orange-500' },
  { title: 'Muscle Heatmap', desc: 'Per-muscle fatigue map', icon: Flame, href: '/app/muscle-heatmap.html', gradient: 'from-red-400 to-rose-500' },
  { title: 'Performance Twin', desc: 'Digital twin simulation', icon: Cpu, href: '/app/performanceTwin.html', gradient: 'from-cyan-400 to-blue-500' },
  { title: 'Analytics (Legacy)', desc: 'Training data dashboard', icon: BarChart3, href: '/app/analytics.html', gradient: 'from-blue-400 to-indigo-500' },
  { title: 'Recovery Lab', desc: 'Sleep & recovery tracking', icon: Heart, href: '/app/recovery-lab.html', gradient: 'from-pink-400 to-rose-500' },
  { title: 'Cardio Engine', desc: 'Zone-based cardio plans', icon: Activity, href: '/app/cardio.html', gradient: 'from-orange-400 to-red-500' },
  { title: 'Athlete Hub', desc: 'Community & social', icon: Users, href: '/app/athlete-hub.html', gradient: 'from-teal-400 to-cyan-500' },
  { title: 'Progress Photos', desc: 'Visual transformation log', icon: Camera, href: '/app/progress-photos.html', gradient: 'from-fuchsia-400 to-pink-500' },
  { title: 'Device Sync', desc: 'Wearable integration', icon: Zap, href: '/app/device-sync.html', gradient: 'from-yellow-400 to-amber-500' },
  { title: 'Performance Lab (Legacy)', desc: 'Deep analytics & insights', icon: FlaskConical, href: '/app/performance-lab.html', gradient: 'from-violet-400 to-purple-500' },
];

const CORE_FEATURES = [
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

const ROTATING_PHRASES = [
  '⚡ Neural Autoregulation Engine',
  '🧬 Live 3D Biomechanics & Heatmaps',
  '🍛 Hyper-Localized Indian Nutrition',
  '🎙️ Voice-Activated AI Coaching',
];

export const Dashboard = () => {
  const { beastMode } = useBeastMode();
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Scroll-linked parallax transforms
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 140]);
  const glowOpacity = useTransform(scrollY, [0, 400], [0.3, 0.05]);
  const scaleGlow = useTransform(scrollY, [0, 600], [1, 1.25]);

  // Morphing subtitle timer
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] text-white overflow-hidden selection:bg-[#7000FF]/40">
      
      {/* 🌌 1. INTERACTIVE CYBER-MESH PARTICLES CANVAS */}
      <CyberParticleCanvas />

      {/* Cybernetic Grid Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* ─── 2. CINEMATIC KINETIC HERO SECTION ─── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 pt-16 overflow-hidden z-10">
        
        {/* Parallax Ambient Glow Orbs */}
        <motion.div
          className="pointer-events-none absolute w-[550px] h-[550px] rounded-full blur-[140px] transition-colors duration-700 -top-20 -left-20"
          style={{
            y: heroY,
            opacity: glowOpacity,
            scale: scaleGlow,
            background: beastMode
              ? 'radial-gradient(circle, #FF0033 0%, transparent 70%)'
              : 'radial-gradient(circle, #7000FF 0%, transparent 70%)',
          }}
        />
        <motion.div
          className="pointer-events-none absolute w-[400px] h-[400px] rounded-full blur-[120px] transition-colors duration-700 top-1/3 -right-20"
          style={{
            y: heroY,
            opacity: glowOpacity,
            background: beastMode
              ? 'radial-gradient(circle, #FF5500 0%, transparent 70%)'
              : 'radial-gradient(circle, #00F0FF 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Cyber Status Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 backdrop-blur-xl transition-all duration-500 cursor-default"
            style={{ 
              background: beastMode ? 'rgba(255, 0, 51, 0.12)' : 'rgba(112, 0, 255, 0.12)', 
              border: `1px solid ${beastMode ? 'rgba(255, 0, 51, 0.35)' : 'rgba(112, 0, 255, 0.3)'}`,
              boxShadow: `0 0 20px ${beastMode ? 'rgba(255, 0, 51, 0.2)' : 'rgba(112, 0, 255, 0.15)'}`
            }}
          >
            <Sparkles size={14} className={beastMode ? 'text-red-400 animate-spin' : 'text-purple-400'} />
            <span className={`text-xs font-mono tracking-widest uppercase font-semibold ${
              beastMode ? 'text-red-300' : 'text-purple-300'
            }`}>
              {beastMode ? 'BEAST MODE OVERDRIVE' : 'NEURAL PLATFORM v4.0'}
            </span>
          </motion.div>

          {/* ⚡ Kinetic Staggered Headline */}
          <h1 
            className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.95] mb-6 select-none"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <motion.span
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              Your Body.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`block bg-clip-text text-transparent transition-all duration-700 ${
                beastMode 
                  ? 'bg-gradient-to-r from-red-500 via-orange-400 to-rose-500 drop-shadow-[0_0_30px_rgba(255,0,51,0.4)]'
                  : 'bg-gradient-to-r from-purple-400 via-purple-300 to-cyan-400 drop-shadow-[0_0_30px_rgba(112,0,255,0.3)]'
              }`}
            >
              Our Intelligence.
            </motion.span>
          </h1>

          {/* 🔄 Dynamic Morphing Subtitle */}
          <div className="h-10 mb-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={phraseIndex}
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                transition={{ duration: 0.4 }}
                className="font-mono text-sm sm:text-base tracking-wide font-medium"
                style={{ color: beastMode ? '#FF5500' : '#00F0FF' }}
              >
                {ROTATING_PHRASES[phraseIndex]}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed font-sans"
          >
            The multi-national AI fitness platform redefining human performance. Real-time autoregulation, 
            3D fatigue modeling, and hyper-localized Indian nutrition.
          </motion.p>

          {/* 🔘 Multi-Layered Animated CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex flex-wrap gap-4 justify-center items-center"
          >
            {/* Primary Glowing Button */}
            <motion.a
              href="/workout"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="relative group p-[2px] rounded-full overflow-hidden transition-all duration-300 block no-underline"
              style={{
                boxShadow: beastMode 
                  ? '0 0 30px rgba(255, 0, 51, 0.45)' 
                  : '0 0 30px rgba(112, 0, 255, 0.4)'
              }}
            >
              {/* Rotating Gradient Border */}
              <div 
                className="absolute inset-0 transition-all duration-700 animate-spin"
                style={{
                  animationDuration: '4s',
                  background: beastMode
                    ? 'conic-gradient(from 0deg, #FF0033, #FF5500, #FF0033)'
                    : 'conic-gradient(from 0deg, #7000FF, #00F0FF, #7000FF)',
                }}
              />
              <div className="relative px-8 py-4 rounded-full bg-[#0A0A0F] font-semibold text-sm tracking-wide flex items-center gap-2 group-hover:bg-opacity-90 transition-colors">
                <span>Start Training</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.a>

            {/* AI Coach Button */}
            <motion.a 
              href="/diet"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="px-8 py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 text-zinc-300 hover:text-white block no-underline border border-white/10 hover:border-white/20 bg-white/[0.03] backdrop-blur-xl"
            >
              Talk to AI Coach
            </motion.a>

            {/* 3D Heatmap Quick Launch */}
            <motion.a 
              href="/heatmap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-4 rounded-full font-semibold text-xs tracking-wider uppercase font-mono transition-all duration-300 text-red-400 hover:text-red-300 block no-underline border border-red-500/20 hover:border-red-500/40 bg-red-500/[0.05] backdrop-blur-xl flex items-center gap-2"
            >
              <Flame size={15} />
              <span>3D Heatmap</span>
            </motion.a>
          </motion.div>

        </div>

        {/* Scroll Cue Indicator */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-16 text-zinc-500 flex flex-col items-center gap-1 cursor-pointer"
          onClick={() => {
            window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
          }}
        >
          <span className="text-[10px] font-mono tracking-widest uppercase">Explore Command Center</span>
          <ChevronDown size={18} />
        </motion.div>
      </section>

      {/* ─── SELF-DRAWING NEON DIVIDER LINE ─── */}
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-[1px] w-full origin-left"
          style={{
            background: beastMode
              ? 'linear-gradient(90deg, transparent, #FF0033, transparent)'
              : 'linear-gradient(90deg, transparent, #7000FF, #00F0FF, transparent)',
          }}
        />
      </div>

      {/* ─── 3. 🃏 3D HOLOGRAPHIC TILT CARDS (COMMAND CENTER) ─── */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <span 
                className="text-xs font-mono tracking-widest uppercase mb-2 block font-semibold"
                style={{ color: beastMode ? '#FF5500' : '#00F0FF' }}
              >
                Full Suite Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Command Center.
                <span className="text-zinc-500 font-light italic" style={{ fontFamily: 'var(--font-serif)' }}> Every weapon ready.</span>
              </h2>
            </div>
            <div className="text-zinc-500 text-xs font-mono">
              Hover to tilt cards in 3D space
            </div>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {FEATURE_LINKS.map(feature => (
              <TiltCard
                key={feature.title}
                href={feature.href}
                gradient={feature.gradient}
                isNew={feature.isNew}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${feature.gradient} shadow-md transition-transform duration-300 group-hover:scale-110`}>
                  <feature.icon size={20} className="text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                  {feature.desc}
                </p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SELF-DRAWING NEON DIVIDER LINE ─── */}
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-[1px] w-full origin-right"
          style={{
            background: beastMode
              ? 'linear-gradient(90deg, transparent, #FF0033, transparent)'
              : 'linear-gradient(90deg, transparent, #00F0FF, #7000FF, transparent)',
          }}
        />
      </div>

      {/* ─── 4. 📈 DYNAMIC NUMBER COUNT-UP STATS SECTION ─── */}
      <section className="py-20 px-6 relative z-10 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedCounter target="10,000+" label="Plans Generated" subtext="Across 40+ countries" />
            <AnimatedCounter target="98%" label="Goal Completion" subtext="Verified athlete data" />
            <AnimatedCounter target="0.4s" label="AI Response Time" subtext="Neural cloud inference" />
            <AnimatedCounter target="4.9/5" label="Athlete Rating" subtext="Over 1,200 reviews" />
          </div>
        </div>
      </section>

      {/* ─── 5. CORE ARCHITECTURE HIGHLIGHTS ─── */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span 
              className="text-xs font-mono tracking-widest uppercase mb-4 block font-semibold"
              style={{ color: beastMode ? '#FF0033' : '#7000FF' }}
            >
              Architectural Standard
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Engineered Without Compromise.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CORE_FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl p-8 transition-all duration-300 cursor-pointer overflow-hidden border border-white/[0.07] bg-white/[0.02] backdrop-blur-xl"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. ORIGINAL DIET MODULE & TESTIMONIALS (PRESERVED) ─── */}
      <div className="relative z-10 border-t border-white/[0.05]">
        <DietModule />
      </div>

      <div className="relative z-10 border-t border-white/[0.05]">
        <Testimonials />
      </div>

      {/* ─── FOOTER (PRESERVED) ─── */}
      <div className="relative z-10 border-t border-white/[0.05]">
        <Footer />
      </div>

    </div>
  );
};
