import { motion } from 'motion/react';

const QUOTES = [
  {
    quote: "The intelligence mapped a protocol that completely rebuilt my metabolic foundation. It feels less like software and more like a high-end human performance lab.",
    author: "Elena R.",
    role: "Elite CrossFitter"
  },
  {
    quote: "Precision I haven't seen outside of professional coaching. The dynamic macro adjustments saved me weeks of plateau and accelerated my tissue recovery.",
    author: "Marcus T.",
    role: "Endurance Athlete"
  }
];

export default function Testimonials() {
  return (
    <section className="w-full py-24 md:py-32 px-6 sm:px-12 md:px-20 bg-charcoal text-[#FAF6F0] relative overflow-hidden">
      {/* Subtle grain overlay for the dark section */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-16"
        >
          <div className="w-8 h-[1px] bg-[#C05C46]" />
          <span className="text-xs font-mono tracking-widest text-[#C05C46] uppercase">Athlete Feedback</span>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {QUOTES.map((item, i) => (
            <motion.div 
              key={item.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              <div className="text-[#C05C46] font-serif text-6xl leading-none mb-4 opacity-50">"</div>
              <p className="font-display text-2xl md:text-3xl leading-snug tracking-tight mb-8 font-light">
                {item.quote}
              </p>
              <div className="mt-auto">
                <h5 className="font-mono text-xs tracking-widest uppercase mb-1">{item.author}</h5>
                <p className="font-sans text-xs text-zinc-400">{item.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
