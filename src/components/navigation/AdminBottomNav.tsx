import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Power, BarChart3, Newspaper, Trophy } from 'lucide-react';
import { isAdminDomain } from '../../App';

export const AdminBottomNav: React.FC = () => {
  const prefix = isAdminDomain ? '' : '/control';

  const navItems = [
    { label: 'Overview', path: `${prefix}/dashboard`, icon: Home },
    { label: 'Market Control', path: `${prefix}/market`, icon: Power },
    { label: 'Stocks & Prices', path: `${prefix}/stocks`, icon: BarChart3 },
    { label: 'News', path: `${prefix}/news`, icon: Newspaper },
    { label: 'Leaderboard', path: `${prefix}/leaderboard`, icon: Trophy },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-safe px-3 mb-2.5"
      aria-label="Admin Bottom Navigation"
    >
      <div className="pointer-events-auto w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-full p-1.5 shadow-2xl shadow-slate-900/15 border border-slate-200/90 grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-0.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-orange-500 stroke-[2.5]' : 'stroke-[2]'
                    }`}
                  />
                  <span
                    className={`text-[8.5px] tracking-tight mt-0.5 truncate max-w-full ${
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

export default AdminBottomNav;
