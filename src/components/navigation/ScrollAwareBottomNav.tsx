import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Briefcase, FileText, Trophy } from 'lucide-react';

export const ScrollAwareBottomNav: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Market', path: '/market', icon: BarChart2 },
    { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { label: 'News', path: '/news', icon: FileText },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-safe px-4 mb-3 transition-all duration-300"
      aria-label="Participant Bottom Navigation"
    >
      <div
        className="pointer-events-auto w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-full p-1.5 shadow-2xl shadow-slate-900/15 border border-slate-200/90 grid grid-cols-5 gap-1 transition-all duration-300"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-orange-500 stroke-[2.5]' : 'text-slate-400 stroke-[2]'
                    }`}
                  />
                  <span
                    className={`text-[9px] tracking-tight mt-0.5 truncate max-w-full ${
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
