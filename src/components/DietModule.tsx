import { motion } from 'motion/react';
import { Target, Zap, Activity, Brain, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    id: 'weight-loss',
    title: 'Fat Loss',
    description: 'Caloric deficit protocols engineered to preserve lean tissue.',
    icon: Target,
    macros: { protein: 40, carbs: 35, fat: 25 },
    color: '#C05C46' // Terracotta
  },
  {
    id: 'muscle-gain',
    title: 'Hypertrophy',
    description: 'Surplus energy mapping for maximal tissue cross-section.',
    icon: Zap,
    macros: { protein: 30, carbs: 50, fat: 20 },
    color: '#B89047' // Muted Gold
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    description: 'Iso-caloric equilibrium for athletic performance and recovery.',
    icon: Activity,
    macros: { protein: 30, carbs: 40, fat: 30 },
    color: '#4A5840' // Olive
  },
  {
    id: 'custom-ai',
    title: 'AI Custom',
    description: 'Dynamic macro adjustments based on real-time biometric feedback.',
    icon: Brain,
    macros: { protein: 35, carbs: 40, fat: 25 },
    color: '#1A1A1A' // Charcoal
  }
];

function MacroBar({ label, percentage, color }: { label: string, percentage: number, color: string }) {
  return (
    <div className="mb-2.5 w-full">
      <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase text-zinc-500 mb-1.5">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-0.5 bg-zinc-200/60 overflow-hidden w-full">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="h-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function DietModule() {
  return (
    <section id="diet-plan" className="w-full py-24 md:py-32 px-6 sm:px-12 md:px-20 bg-[#FAF6F0] relative overflow-hidden">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16 md:mb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-[1px] bg-terracotta" />
            <span className="text-xs font-mono tracking-widest text-terracotta uppercase">Nutrition Intelligence</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold text-4xl md:text-6xl text-charcoal leading-[1.1] tracking-tight max-w-2xl"
          >
            Precision Macros.<br />
            <span className="font-serif italic font-light text-zinc-500">Dynamically mapped.</span>
          </motion.h2>
        </div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-zinc-500 font-sans text-sm md:text-base max-w-sm leading-relaxed"
        >
          Our neural network processes your biometrics, daily output, and goal timeline to generate a macronutrient structure optimized for tissue response.
        </motion.p>
      </div>

      {/* Interactive Cards (Horizontal Scroll on Mobile) */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex overflow-x-auto pb-12 -mx-6 px-6 md:mx-0 md:px-0 gap-6 no-scrollbar snap-x snap-mandatory">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 * index, ease: [0.16, 1, 0.3, 1] }}
              className="flex-none w-[85vw] sm:w-[320px] bg-white rounded-2xl p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group snap-center relative overflow-hidden flex flex-col justify-between"
              style={{ minHeight: '380px' }}
            >
              {/* Subtle background gradient on hover */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
                style={{ background: `radial-gradient(circle at top right, ${plan.color}22 0%, transparent 70%)` }}
              />

              <div>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundColor: `${plan.color}15`, color: plan.color }}
                >
                  <plan.icon size={22} strokeWidth={1.5} />
                </div>
                
                <h3 className="font-display font-medium text-xl text-charcoal mb-3">{plan.title}</h3>
                <p className="text-zinc-500 text-sm font-sans leading-relaxed mb-8 h-10">
                  {plan.description}
                </p>
                
                <div className="space-y-4 w-full">
                  <MacroBar label="Protein" percentage={plan.macros.protein} color={plan.color} />
                  <MacroBar label="Carbs" percentage={plan.macros.carbs} color={plan.color} />
                  <MacroBar label="Fat" percentage={plan.macros.fat} color={plan.color} />
                </div>
              </div>

              <button className="mt-8 flex items-center gap-2 text-xs font-mono tracking-widest uppercase transition-colors duration-300" style={{ color: plan.color }}>
                View Plan <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Processing Visualizer (Editorial styling) */}
      <div className="max-w-7xl mx-auto mt-20 pt-20 border-t border-zinc-200/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl text-charcoal tracking-tight mb-6"
            >
              How the <span className="font-serif italic font-light">Intelligence</span> operates.
            </motion.h3>
            
            <div className="space-y-8 mt-12">
              {[
                { step: '01', title: 'Data Ingestion', desc: 'We ingest your age, weight, body fat %, and metabolic history.' },
                { step: '02', title: 'Algorithmic Processing', desc: 'The AI maps a caloric baseline and applies your selected goal protocol.' },
                { step: '03', title: 'Dynamic Output', desc: 'A continuously evolving macro blueprint is delivered to your dashboard.' }
              ].map((item, i) => (
                <motion.div 
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="flex gap-6"
                >
                  <div className="text-xs font-mono tracking-widest text-terracotta mt-1">{item.step}</div>
                  <div>
                    <h4 className="font-display font-medium text-lg text-charcoal mb-1">{item.title}</h4>
                    <p className="text-zinc-500 text-sm font-sans leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Abstract Data Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="w-full aspect-square md:aspect-[4/3] bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm relative overflow-hidden flex items-center justify-center"
          >
            {/* Minimalist Data Flow Animation */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Central Core */}
              <motion.div 
                animate={{ scale: [1, 1.05, 1], rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 rounded-full border border-zinc-200 border-dashed absolute flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-zinc-50" />
              </motion.div>
              
              {/* Scanning line */}
              <motion.div
                animate={{ y: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-full h-[1px] bg-terracotta/20 left-0 top-1/2"
              />
              
              {/* Floating Data Points */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [Math.random() * -50, Math.random() * 50],
                    x: [Math.random() * -50, Math.random() * 50],
                    opacity: [0.2, 0.8, 0.2]
                  }}
                  transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, repeatType: "mirror" }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-zinc-300"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`
                  }}
                />
              ))}
              
              <div className="z-10 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-zinc-100 shadow-sm">
                <span className="font-mono text-[10px] tracking-widest text-charcoal uppercase">Processing Data</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
