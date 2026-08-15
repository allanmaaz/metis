import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Power, BarChart3, Newspaper, Trophy } from 'lucide-react';
import { isAdminDomain } from '../../App';

export const AdminBottomNav: React.FC = () => {
  const prefix = isAdminDomain ? '' : '/control';

  const navItems = [
    { label: 'Overview', path: `${prefix}/dashboard`, icon: Home },
    { label: 'Market', path: `${prefix}/market`, icon: Power },
    { label: 'Stocks', path: `${prefix}/stocks`, icon: BarChart3 },
    { label: 'News', path: `${prefix}/news`, icon: Newspaper },
    { label: 'Leaderboard', path: `${prefix}/leaderboard`, icon: Trophy },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-safe px-3 mb-3"
      aria-label="Admin Bottom Navigation"
    >
      <div className="pointer-events-auto w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-full p-2 shadow-2xl shadow-slate-900/20 border border-slate-200/90 grid grid-cols-5 gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 border border-orange-200/80 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'text-orange-500 stroke-[2.5] scale-105' : 'stroke-[2] text-slate-500'
                    }`}
                  />
                  <span
                    className={`text-[10px] tracking-tight mt-1 truncate max-w-full leading-none ${
                      isActive ? 'font-black text-orange-600' : 'font-bold text-slate-500'
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

export default AdminBottomNav;
