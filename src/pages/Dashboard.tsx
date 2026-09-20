import { motion } from 'motion/react';
import { 
  Zap, Brain, Shield, Activity,
  Camera, Utensils, Flame, BarChart3, Heart,
  Scan, Users, Cpu, FlaskConical
} from 'lucide-react';
import Hero from '../components/Hero';
import DietModule from '../components/DietModule';
import Stats from '../components/Stats';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

// Quick-access cards linking to all existing features
const FEATURE_LINKS = [
  { title: 'Food Scanner', desc: 'AI-powered food recognition', icon: Camera, href: '/app/food-scanner.html', gradient: 'from-green-400 to-emerald-500' },
  { title: 'Food Camera', desc: 'Scan meals for macros', icon: Scan, href: '/app/food-camera.html', gradient: 'from-lime-400 to-green-500' },
  { title: 'Nutrition Engine', desc: 'Indian diet protocols', icon: Utensils, href: '/app/diet.html', gradient: 'from-amber-400 to-orange-500' },
  { title: 'Muscle Heatmap', desc: 'Per-muscle fatigue map', icon: Flame, href: '/app/muscle-heatmap.html', gradient: 'from-red-400 to-rose-500' },
  { title: 'Performance Lab', desc: 'Deep analytics & insights', icon: FlaskConical, href: '/app/performance-lab.html', gradient: 'from-violet-400 to-purple-500' },
  { title: 'Performance Twin', desc: 'Digital twin simulation', icon: Cpu, href: '/app/performanceTwin.html', gradient: 'from-cyan-400 to-blue-500' },
  { title: 'Analytics', desc: 'Training data dashboard', icon: BarChart3, href: '/app/analytics.html', gradient: 'from-blue-400 to-indigo-500' },
  { title: 'Recovery Lab', desc: 'Sleep & recovery tracking', icon: Heart, href: '/app/recovery-lab.html', gradient: 'from-pink-400 to-rose-500' },
  { title: 'Cardio Engine', desc: 'Zone-based cardio plans', icon: Activity, href: '/app/cardio.html', gradient: 'from-orange-400 to-red-500' },
  { title: 'Athlete Hub', desc: 'Community & social', icon: Users, href: '/app/athlete-hub.html', gradient: 'from-teal-400 to-cyan-500' },
  { title: 'Progress Photos', desc: 'Visual transformation log', icon: Camera, href: '/app/progress-photos.html', gradient: 'from-fuchsia-400 to-pink-500' },
  { title: 'Device Sync', desc: 'Wearable integration', icon: Zap, href: '/app/device-sync.html', gradient: 'from-yellow-400 to-amber-500' },
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

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
      
      {/* ─── ORIGINAL HERO VIDEO SECTION ─── */}
      <Hero />

      {/* ─── QUICK ACCESS: ALL FEATURES ─── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <span className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-3 block">Command Center</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              All Your Tools.
              <span className="text-zinc-500 font-light italic" style={{ fontFamily: 'var(--font-serif)' }}> One tap away.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {FEATURE_LINKS.map((feature, i) => (
              <motion.a
                key={feature.title}
                href={feature.href}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="group relative rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden block no-underline"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon size={18} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-white mb-0.5">{feature.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{feature.desc}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ORIGINAL DIET MODULE (Macro Cards) ─── */}
      <div className="bg-[#FAF6F0]">
        <DietModule />
      </div>

      {/* ─── CORE INTELLIGENCE FEATURES ─── */}
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
            {CORE_FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative rounded-2xl p-8 transition-all duration-500 cursor-pointer overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
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

      {/* ─── ORIGINAL STATS ─── */}
      <div className="bg-white">
        <Stats />
      </div>

      {/* ─── ORIGINAL TESTIMONIALS ─── */}
      <div className="bg-[#FAF6F0]">
        <Testimonials />
      </div>

      {/* ─── FOOTER ─── */}
      <div className="bg-[#FAF6F0]">
        <Footer />
      </div>
    </div>
  );
};
