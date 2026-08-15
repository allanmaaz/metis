import React from 'react';
import { NavLink } from 'react-router-dom';
import { MetisLogo } from '../ui/MetisLogo';
import {
  LayoutDashboard,
  Power,
  BarChart3,
  Users2,
  Receipt,
  Newspaper,
  Trophy,
  History,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const { admin, logoutAdmin } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/control/dashboard', icon: LayoutDashboard },
    { label: 'Market Control', path: '/control/market', icon: Power, badge: 'Live' },
    { label: 'Stocks & Prices', path: '/control/stocks', icon: BarChart3 },
    { label: 'Teams & Members', path: '/control/teams', icon: Users2 },
    { label: 'Trade Monitor', path: '/control/trades', icon: Receipt },
    { label: 'News Publisher', path: '/control/news', icon: Newspaper },
    { label: 'Leaderboard', path: '/control/leaderboard', icon: Trophy },
    { label: 'Audit Log', path: '/control/audit', icon: History },
    { label: 'Event Settings', path: '/control/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col justify-between glass-panel border-r border-white/10 p-5 select-none shrink-0">
      {/* Brand & Title */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <MetisLogo size="md" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3" /> Control Center
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              METIS ADMIN SUITE
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/30 shadow-md font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Logout */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
            {admin?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-xs font-bold text-white truncate">
              {admin?.full_name || 'Admin'}
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              {admin?.email || 'admin@metis.internal'}
            </span>
          </div>
        </div>

        <button
          onClick={logoutAdmin}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out of Control
        </button>
      </div>
    </aside>
  );
};
