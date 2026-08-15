import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Briefcase, FileText, Trophy } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ScrollAwareBottomNav: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Market', path: '/market', icon: BarChart2 },
    { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { label: 'News', path: '/news', icon: FileText },
    { label: 'Ranks', path: '/leaderboard', icon: Trophy },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-safe px-4 mb-3 transition-all duration-300"
      aria-label="Participant Bottom Navigation"
    >
      <div
        className={`pointer-events-auto w-full max-w-lg backdrop-blur-2xl rounded-full p-2 shadow-2xl grid grid-cols-5 gap-1.5 transition-all duration-300 ${
          isDark
            ? 'bg-[#131B2E]/95 border border-white/15 shadow-black/60'
            : 'bg-white/95 border border-slate-200/90 shadow-slate-900/20'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-gradient-to-b from-orange-500/25 to-orange-500/15 text-orange-400 border border-orange-500/30 shadow-xs'
                      : 'bg-orange-50 text-orange-600 border border-orange-200/80 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive
                        ? 'text-orange-500 stroke-[2.5] scale-105'
                        : 'stroke-[2] text-slate-400 hover:text-slate-200'
                    }`}
                  />
                  <span
                    className={`text-[10px] tracking-tight mt-1 truncate max-w-full leading-none ${
                      isActive
                        ? isDark
                          ? 'font-black text-orange-400'
                          : 'font-black text-orange-600'
                        : isDark
                        ? 'font-bold text-slate-400'
                        : 'font-bold text-slate-500'
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
