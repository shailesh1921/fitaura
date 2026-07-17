import { motion } from 'motion/react';

const STATS = [
  { value: '10,000+', label: 'Plans Generated', subtext: 'Across 40+ countries' },
  { value: '98%', label: 'Goal Completion', subtext: 'Verified athlete data' },
  { value: '0.4s', label: 'Generation Time', subtext: 'Neural processing' },
  { value: '4.9/5', label: 'Average Rating', subtext: 'From verified users' },
];

export default function Stats() {
  return (
    <section className="w-full py-16 md:py-24 px-6 sm:px-12 md:px-20 bg-white border-t border-zinc-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          {STATS.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <h4 className="font-display font-light text-4xl md:text-5xl text-charcoal tracking-tight mb-2">
                {stat.value}
              </h4>
              <div className="font-mono text-[10px] tracking-widest text-terracotta uppercase mb-1">
                {stat.label}
              </div>
              <p className="text-zinc-400 text-xs font-sans">
                {stat.subtext}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
