import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Bot, Trophy, User } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const BottomTabBar = () => {
  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (_) {
      // Ignore if not running on native device
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] pb-[env(safe-area-inset-bottom)]"
      style={{
        height: '65px',
        background: 'rgba(10, 10, 15, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {[
          { to: '/', icon: Home, label: 'Home', end: true },
          { to: '/workout', icon: Dumbbell, label: 'Train' },
          { to: '/diet', icon: Bot, label: 'AI Coach' },
          { to: '/leaderboard', icon: Trophy, label: 'Rank' },
          { to: '/profile', icon: User, label: 'Profile' },
        ].map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={triggerHaptic}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-[20%] h-full transition-all duration-200 relative ${
                isActive ? 'text-purple-400' : 'text-zinc-500'
              }`
            }
            style={{ WebkitTapHighlightColor: 'transparent', textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <>
                {/* Glow dot above active icon */}
                {isActive && (
                  <div
                    className="absolute -top-[1px] w-6 h-[2px] rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #7000FF, transparent)',
                      boxShadow: '0 0 8px rgba(112, 0, 255, 0.6)',
                    }}
                  />
                )}
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.5}
                  className={`mb-0.5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
