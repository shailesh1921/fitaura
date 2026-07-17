export default function Footer() {
  return (
    <footer className="bg-charcoal text-[#FAF6F0] pt-24 pb-12 px-6 sm:px-12 md:px-20 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl font-bold tracking-tight mb-6">FITAURA</h2>
            <p className="font-sans text-sm text-zinc-400 mb-8 max-w-sm leading-relaxed">
              Advanced metabolic mapping and athletic protocol generation. Designed for those who demand precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter email for early access" 
                className="bg-transparent border border-zinc-700 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-[#C05C46] transition-colors w-full sm:w-64"
              />
              <button className="bg-[#FAF6F0] text-charcoal hover:bg-[#C05C46] hover:text-white px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest transition-colors duration-300">
                Subscribe
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2 lg:col-start-8">
            <h5 className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 mb-6">Platform</h5>
            <ul className="space-y-4">
              <li><a href="#" className="font-sans text-sm text-zinc-300 hover:text-[#C05C46] transition-colors">Intelligence</a></li>
              <li><a href="#" className="font-sans text-sm text-zinc-300 hover:text-[#C05C46] transition-colors">Biomechanics</a></li>
              <li><a href="#" className="font-sans text-sm text-zinc-300 hover:text-[#C05C46] transition-colors">Nutrition</a></li>
              <li><a href="#" className="font-sans text-sm text-zinc-300 hover:text-[#C05C46] transition-colors">Athletes</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h5 className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 mb-6">Company</h5>
            <ul className="space-y-4">
              <li><a href="#" className="font-sans text-sm text-zinc-300 hover:text-[#C05C46] transition-colors">About Us</a></li>
              <li><a href="#" className="font-sans text-sm text-zinc-300 hover:text-[#C05C46] transition-colors">Research</a></li>
              <li><a href="#" className="font-sans text-sm text-zinc-300 hover:text-[#C05C46] transition-colors">Careers</a></li>
              <li><a href="#" className="font-sans text-sm text-zinc-300 hover:text-[#C05C46] transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-zinc-800 gap-4">
          <div className="font-sans text-xs text-zinc-500">
            © {new Date().getFullYear()} FitAura Intelligence. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="font-sans text-xs text-zinc-500 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="font-sans text-xs text-zinc-500 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
