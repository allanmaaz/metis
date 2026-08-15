import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Briefcase, FileText, Trophy } from 'lucide-react';
import { useScrollDirection } from '../../hooks/useScrollDirection';

export const ScrollAwareBottomNav: React.FC = () => {
  const scrollDirection = useScrollDirection();
  const isCompact = scrollDirection === 'down';

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Market', path: '/market', icon: BarChart2 },
    { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { label: 'News', path: '/news', icon: FileText },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-safe px-3 mb-2 transition-all duration-300"
      aria-label="Participant Bottom Navigation"
    >
      <div
        className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-xl rounded-full px-2 py-1.5 shadow-xl border border-slate-200/90 max-w-sm w-full justify-between gap-1 transition-all duration-300"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 font-extrabold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-orange-500 fill-orange-500/20' : 'text-slate-500'
                    }`}
                  />
                  <span
                    className={`text-[10px] tracking-tight mt-0.5 ${
                      isActive ? 'font-black text-orange-600' : 'font-semibold text-slate-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default ScrollAwareBottomNav;
