import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Briefcase, Newspaper, Trophy } from 'lucide-react';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { motion } from 'framer-motion';

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
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-safe px-4 mb-3 sm:mb-5"
      aria-label="Participant Bottom Navigation"
    >
      <motion.div
        layout
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className={`pointer-events-auto flex items-center glass-nav rounded-full px-2 py-1.5 shadow-2xl border border-white/10 ${
          isCompact ? 'gap-1 px-3 py-2' : 'gap-1 sm:gap-2'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center justify-center rounded-full transition-all duration-200 ${
                  isCompact ? 'p-2.5 sm:p-3' : 'px-3.5 py-2 sm:px-4 sm:py-2.5'
                } ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg shadow-orange-500/30"
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-5 h-5" />
                    {!isCompact && (
                      <span className="text-xs sm:text-sm font-medium tracking-wide">
                        {item.label}
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </motion.div>
    </nav>
  );
};
