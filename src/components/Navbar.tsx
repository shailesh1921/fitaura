import { NavLink } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Navbar() {
  const navLinks = [
    { name: 'Dashboard', to: '/' },
    { name: 'Workout', to: '/workout' },
    { name: 'AI Coach', to: '/diet' },
    { name: '3D Heatmap', to: '/heatmap' },
    { name: 'Indian Nutrition', to: '/nutrition' },
    { name: 'Analytics', to: '/analytics-dashboard' },
  ];

  return (
    <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-6xl z-50 items-center justify-between px-6 py-3 rounded-full bg-[#0D0D12]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">
      {/* Brand Logo */}
      <NavLink to="/" className="flex items-center gap-2.5 text-white no-underline group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-zinc-400 flex items-center justify-center text-black shadow-sm group-hover:scale-105 transition-transform">
          <Activity size={18} className="text-black" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-sm tracking-wider uppercase text-white">
            FitAura
          </span>
          <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase -mt-0.5">
            Physiology OS
          </span>
        </div>
      </NavLink>

      {/* Center Nav Links */}
      <nav className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 no-underline ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>

      {/* Right CTAs */}
      <div className="flex items-center gap-3">
        <a
          href="/app/dashboard.html"
          className="text-xs font-mono tracking-wider text-zinc-400 hover:text-white transition-colors no-underline px-3 py-1.5"
        >
          Legacy Hub
        </a>
        <NavLink
          to="/workout"
          className="px-4 py-2 rounded-full text-xs font-semibold tracking-wide bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm no-underline flex items-center gap-1.5"
        >
          <span>Launch Session</span>
        </NavLink>
      </div>
    </header>
  );
}
