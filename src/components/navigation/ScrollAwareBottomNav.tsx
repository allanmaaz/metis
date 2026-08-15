import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Briefcase, Newspaper, Trophy } from 'lucide-react';
import { useScrollDirection } from '../../hooks/useScrollDirection';

export const ScrollAwareBottomNav: React.FC = () => {
  const scrollDirection = useScrollDirection();
  const isCompact = scrollDirection === 'down';

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Market', path: '/market', icon: TrendingUp },
    { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { label: 'News', path: '/news', icon: Newspaper },
    { label: 'Ranks', path: '/leaderboard', icon: Trophy },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-safe px-3 mb-3 sm:mb-5 transition-all duration-300"
      aria-label="Participant Bottom Navigation"
    >
      <div
        className={`pointer-events-auto flex items-center glass-nav rounded-2xl sm:rounded-full p-1.5 shadow-2xl border border-white/10 max-w-md w-full sm:w-auto justify-between sm:justify-center gap-1 transition-all duration-300 ${
          isCompact ? 'py-2 px-3' : 'px-2 py-1.5'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-center gap-1.5 rounded-xl sm:rounded-full font-medium transition-all duration-200 ${
                  isCompact
                    ? 'p-2.5'
                    : 'flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs sm:text-sm'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md shadow-orange-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
              {!isCompact && (
                <span className="truncate tracking-wide text-xs">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
