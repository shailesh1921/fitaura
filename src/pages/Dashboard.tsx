import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, ArrowRight, Camera, Utensils, Flame, BarChart3, Heart,
  Scan, Users, Cpu, FlaskConical, ChevronRight,
  Mic, LineChart, Sparkles
} from 'lucide-react';
import { useBeastMode } from '../context/BeastModeContext';
import { AnimatedCounter } from '../components/AnimatedCounter';
import DietModule from '../components/DietModule';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

// All legacy and complementary feature links (100% PRESERVED)
const DIRECTORY_TOOLS = [
  { title: 'Food Scanner', desc: 'AI visual food identifier', icon: Camera, href: '/app/food-scanner.html', tag: 'Vision' },
  { title: 'Food Camera', desc: 'Meal photo macro estimator', icon: Scan, href: '/app/food-camera.html', tag: 'Camera' },
  { title: 'Nutrition Engine (Legacy)', desc: 'Original diet protocols', icon: Utensils, href: '/app/diet.html', tag: 'Diet' },
  { title: 'Muscle Heatmap (Legacy)', desc: '2D muscle fatigue map', icon: Flame, href: '/app/muscle-heatmap.html', tag: 'Biomechanics' },
  { title: 'Performance Twin', desc: 'Digital athletic twin simulation', icon: Cpu, href: '/app/performanceTwin.html', tag: 'Simulation' },
  { title: 'Analytics Hub (Legacy)', desc: 'Historical training records', icon: BarChart3, href: '/app/analytics.html', tag: 'Logs' },
  { title: 'Recovery Lab', desc: 'HRV and sleep architecture', icon: Heart, href: '/app/recovery-lab.html', tag: 'Recovery' },
  { title: 'Cardio Engine', desc: 'Heart-rate zone mapping', icon: Activity, href: '/app/cardio.html', tag: 'Cardio' },
  { title: 'Athlete Hub', desc: 'Global social leaderboards', icon: Users, href: '/app/athlete-hub.html', tag: 'Community' },
  { title: 'Progress Photos', desc: 'Body composition timeline', icon: Camera, href: '/app/progress-photos.html', tag: 'Photos' },
  { title: 'Device Sync', desc: 'Apple Health & Wearable integration', icon: Sparkles, href: '/app/device-sync.html', tag: 'IoT' },
  { title: 'Performance Lab (Legacy)', desc: 'Deep physiological insights', icon: FlaskConical, href: '/app/performance-lab.html', tag: 'Lab' },
];

export const Dashboard = () => {
  const { beastMode } = useBeastMode();
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'recovery'>('workout');

  return (
    <div className="min-h-screen bg-[#08080A] text-white selection:bg-white/20 font-sans">
      
      {/* ─── 1. HERO SECTION (Apple / Whoop High-Contrast Standard) ─── */}
      <section className="relative pt-28 sm:pt-36 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* Subtle Architectural Backlight (No rainbow slop) */}
        <div 
          className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full opacity-20 blur-[130px] pointer-events-none transition-colors duration-700"
          style={{
            background: beastMode 
              ? 'radial-gradient(circle, #FF0033 0%, transparent 70%)' 
              : 'radial-gradient(circle, #FFFFFF 0%, #7000FF 40%, transparent 75%)'
          }}
        />

        {/* Minimalist Status Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8 bg-[#121217] border border-white/[0.08] shadow-sm"
        >
          <div className={`w-2 h-2 rounded-full ${beastMode ? 'bg-[#FF0033] animate-ping' : 'bg-[#10B981]'}`} />
          <span className="text-xs font-mono tracking-wider uppercase text-zinc-400 font-medium">
            {beastMode ? 'BEAST MODE OVERDRIVE' : 'FitAura 4.0 · Precision Biometrics'}
          </span>
        </motion.div>

        {/* Executive Headline (Solid White, Swiss Typography) */}
        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-[-0.03em] leading-[1.05] max-w-4xl text-white mb-6"
        >
          Precision Training.
          <span className="block text-zinc-400 font-normal">Real-Time Physiology.</span>
        </motion.h1>

        {/* Clear, Grounded Product Description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-sans"
        >
          The intelligent fitness operating system. Autoregulated RPE protocols, interactive 3D fatigue biomechanics, and hyper-localized Indian macronutrient programming.
        </motion.p>

        {/* High-Contrast Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-3.5 justify-center items-center mb-16"
        >
          <a
            href="/workout"
            className="px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide bg-white text-black hover:bg-zinc-200 transition-all duration-200 shadow-md flex items-center gap-2 no-underline"
          >
            <span>Start Training Session</span>
            <ArrowRight size={16} />
          </a>

          <a
            href="/heatmap"
            className="px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide bg-[#14141B] hover:bg-[#1A1A24] text-zinc-200 border border-white/[0.1] transition-all duration-200 flex items-center gap-2 no-underline"
          >
            <Flame size={16} className="text-red-400" />
            <span>3D Biomechanics</span>
          </a>

          <a
            href="/nutrition"
            className="px-6 py-3.5 rounded-full text-sm font-semibold tracking-wide bg-[#14141B] hover:bg-[#1A1A24] text-zinc-300 border border-white/[0.08] transition-all duration-200 flex items-center gap-2 no-underline"
          >
            <Utensils size={15} className="text-amber-400" />
            <span>Indian Nutrition</span>
          </a>
        </motion.div>

        {/* ─── 2. HIGH-FIDELITY PRODUCT INTERFACE PREVIEW (Apple/Linear Style) ─── */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl rounded-3xl p-1 bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
        >
          <div className="rounded-[22px] bg-[#0E0E14] border border-white/[0.08] p-6 sm:p-8 text-left overflow-hidden">
            
            {/* Mockup Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.06] gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                  <Activity size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white tracking-wide">HYPERTROPHY CYCLE · BLOCK 04</div>
                  <div className="text-xs font-mono text-zinc-400">Push Autoregulation · Session 12 of 16</div>
                </div>
              </div>

              {/* Mockup Quick Tabs */}
              <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.05]">
                {(['workout', 'nutrition', 'recovery'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      activeTab === tab 
                        ? 'bg-white text-black font-semibold shadow-sm' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Mockup Content Grid */}
            <AnimatePresence mode="wait">
              {activeTab === 'workout' && (
                <motion.div 
                  key="workout"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6"
                >
                  {/* Card A: Readiness & Target */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Session Readiness</div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-mono font-bold text-white">88%</span>
                      <span className="text-xs font-medium text-emerald-400">Optimal Strain</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '88%' }} />
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Fatigue decay model shows chest and anterior delts fully recovered. Target RPE ceiling: 8.5.
                    </p>
                  </div>

                  {/* Card B: Live Exercise Table */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-xs font-mono text-zinc-500 uppercase mb-3">Target Progression</div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-white/[0.04]">
                        <span className="text-white font-medium">Barbell Bench Press</span>
                        <span className="font-mono text-zinc-300">4 × 8 @ 87.5 kg</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-white/[0.04]">
                        <span className="text-white font-medium">Incline DB Press</span>
                        <span className="font-mono text-zinc-300">3 × 10 @ 32 kg</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white font-medium">Overhead Rope Extension</span>
                        <span className="font-mono text-zinc-300">3 × 12 @ 27 kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Card C: Total Session Volume */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Projected Volume</div>
                      <div className="text-3xl font-mono font-bold text-white mb-2">14,280 kg</div>
                      <div className="text-xs text-zinc-400">+4.2% over previous microcycle</div>
                    </div>
                    <a 
                      href="/workout"
                      className="mt-4 w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-center text-white transition-colors no-underline block"
                    >
                      Open Live Logger →
                    </a>
                  </div>
                </motion.div>
              )}

              {activeTab === 'nutrition' && (
                <motion.div 
                  key="nutrition"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6"
                >
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Daily Target</div>
                    <div className="text-3xl font-mono font-bold text-white mb-2">2,450 kcal</div>
                    <div className="text-xs text-zinc-400">Hypertrophy Surplus (+250 kcal)</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-xs font-mono text-zinc-500 uppercase mb-3">Macronutrient Split</div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Protein (40%)</span>
                        <span className="text-white font-bold">165g / 180g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Carbohydrates (35%)</span>
                        <span className="text-white font-bold">210g / 240g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Fats (25%)</span>
                        <span className="text-white font-bold">58g / 68g</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Suggested Thali</div>
                      <div className="text-sm font-semibold text-white mb-1">Paneer Bhurji + 2 Roti + Dal</div>
                      <div className="text-xs text-zinc-400">42g Protein · 610 kcal</div>
                    </div>
                    <a 
                      href="/nutrition"
                      className="mt-4 w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-center text-white transition-colors no-underline block"
                    >
                      Build Indian Plate →
                    </a>
                  </div>
                </motion.div>
              )}

              {activeTab === 'recovery' && (
                <motion.div 
                  key="recovery"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6"
                >
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Sleep Architecture</div>
                    <div className="text-3xl font-mono font-bold text-white mb-2">7h 48m</div>
                    <div className="text-xs text-emerald-400">Deep Sleep: 1h 42m (Optimal)</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Autonomic Nervous System</div>
                    <div className="text-3xl font-mono font-bold text-white mb-2">74 ms</div>
                    <div className="text-xs text-zinc-400">HRV Baseline: +8% above 30-day average</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono text-zinc-500 uppercase mb-1">AI Recommendation</div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Full capacity for heavy axial loading today. Proceed with planned training.
                      </p>
                    </div>
                    <a 
                      href="/diet"
                      className="mt-4 w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-center text-white transition-colors no-underline block"
                    >
                      Consult AI Coach →
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </section>

      {/* ─── 3. BENTO GRID ARCHITECTURE (Linear / Apple Standard) ─── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase mb-2">Platform Capabilities</div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Engineered for Serious Athletics.
          </h2>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Bento 1 (Large 2-column card): 3D Biomechanics */}
          <div className="md:col-span-2 rounded-3xl p-8 bg-[#0E0E14] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between group hover:border-white/[0.15] transition-all">
            <div className="relative z-10 max-w-md">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6">
                <Flame size={20} />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-semibold mb-2 block">Interactive 3D Engine</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                Live 3D Muscle Fatigue Heatmap
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                Visualizing per-muscle group recovery in true 3D space. Our exponential fatigue decay algorithm calculates training strain, secondary spillover, and deload thresholds in real-time.
              </p>
            </div>

            <div className="relative z-10">
              <a 
                href="/heatmap"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-red-400 transition-colors no-underline group-hover:translate-x-1 transition-transform"
              >
                <span>Launch 3D Model</span>
                <ChevronRight size={16} />
              </a>
            </div>

            {/* Subtle Gradient Backlight */}
            <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-red-500/10 blur-[100px] pointer-events-none" />
          </div>

          {/* Bento 2: Indian Nutrition Engine */}
          <div className="rounded-3xl p-8 bg-[#0E0E14] border border-white/[0.08] flex flex-col justify-between group hover:border-white/[0.15] transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                <Utensils size={20} />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold mb-2 block">Localized Macro Mapping</span>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Indian Nutrition Intelligence
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Over 80 regional Indian dishes with authentic macronutrient profiles. Build virtual thalis and balance macros for vegetarian and non-vegetarian goals.
              </p>
            </div>

            <a 
              href="/nutrition"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-amber-400 transition-colors no-underline"
            >
              <span>Explore Food Database</span>
              <ChevronRight size={16} />
            </a>
          </div>

          {/* Bento 3: Voice AI Coach */}
          <div className="rounded-3xl p-8 bg-[#0E0E14] border border-white/[0.08] flex flex-col justify-between group hover:border-white/[0.15] transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                <Mic size={20} />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold mb-2 block">Hands-Free Coaching</span>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Voice-Activated AI Assistant
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Speak directly to your AI coach in the gym. Built with Web Speech API for voice queries and audio speech synthesis response.
              </p>
            </div>

            <a 
              href="/diet"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-purple-400 transition-colors no-underline"
            >
              <span>Speak with AI Coach</span>
              <ChevronRight size={16} />
            </a>
          </div>

          {/* Bento 4 (2-column card): Real-Time Analytics */}
          <div className="md:col-span-2 rounded-3xl p-8 bg-[#0E0E14] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between group hover:border-white/[0.15] transition-all">
            <div className="relative z-10 max-w-md">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                <LineChart size={20} />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold mb-2 block">Recharts Performance Lab</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                Progress Trajectory & RPE Distribution
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                Interactive strength curves, volume comparisons across training microcycles, and streak counters to keep you consistent.
              </p>
            </div>

            <div className="relative z-10">
              <a 
                href="/analytics-dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-400 transition-colors no-underline"
              >
                <span>View Performance Lab</span>
                <ChevronRight size={16} />
              </a>
            </div>

            <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
          </div>

        </div>
      </section>

      {/* ─── 4. EXECUTIVE STATS SECTION (Swiss Monochromatic Typography) ─── */}
      <section className="py-20 px-6 border-y border-white/[0.06] bg-[#0A0A0F]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedCounter target="10,000+" label="Training Protocols" subtext="Across 40+ countries" />
            <AnimatedCounter target="98%" label="Plan Adherence" subtext="Verified athlete data" />
            <AnimatedCounter target="0.4s" label="Inference Latency" subtext="Client-side engine" />
            <AnimatedCounter target="4.9/5" label="Athlete Rating" subtext="Over 1,200 reviews" />
          </div>
        </div>
      </section>

      {/* ─── 5. COMPLETE FEATURE DIRECTORY (ALL LEGACY & SPECIALTY TOOLS PRESERVED) ─── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase mb-2">Ecosystem Directory</div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              All Specialized Modules.
            </h2>
          </div>
          <div className="text-xs font-mono text-zinc-500">
            12 active tools connected
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {DIRECTORY_TOOLS.map((tool) => (
            <a
              key={tool.title}
              href={tool.href}
              className="p-4 rounded-2xl bg-[#0E0E14] border border-white/[0.06] hover:border-white/[0.15] hover:bg-[#13131A] transition-all duration-200 flex items-center justify-between no-underline group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
                  <tool.icon size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-zinc-200 transition-colors">
                    {tool.title}
                  </div>
                  <div className="text-xs text-zinc-500">{tool.desc}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.05]">
                {tool.tag}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ─── 6. ORIGINAL DIET MODULE & TESTIMONIALS (PRESERVED) ─── */}
      <div className="border-t border-white/[0.06]">
        <DietModule />
      </div>

      <div className="border-t border-white/[0.06]">
        <Testimonials />
      </div>

      {/* ─── FOOTER (PRESERVED) ─── */}
      <div className="border-t border-white/[0.06]">
        <Footer />
      </div>

    </div>
  );
};
