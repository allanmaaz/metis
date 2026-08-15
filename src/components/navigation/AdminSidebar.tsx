import React from 'react';
import { NavLink } from 'react-router-dom';
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
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAdminDomain } from '../../App';

export const AdminSidebar: React.FC = () => {
  const { admin, logoutAdmin } = useAuth();
  const prefix = isAdminDomain ? '' : '/control';

  const navItems = [
    { label: 'Overview', path: `${prefix}/dashboard`, icon: LayoutDashboard },
    { label: 'Market Control', path: `${prefix}/market`, icon: Power, badge: 'LIVE' },
    { label: 'Stocks & Prices', path: `${prefix}/stocks`, icon: BarChart3 },
    { label: 'Teams & Members', path: `${prefix}/teams`, icon: Users2 },
    { label: 'Trade Monitor', path: `${prefix}/trades`, icon: Receipt },
    { label: 'News Publisher', path: `${prefix}/news`, icon: Newspaper },
    { label: 'Leaderboard', path: `${prefix}/leaderboard`, icon: Trophy },
    { label: 'Audit Log', path: `${prefix}/audit`, icon: History },
    { label: 'Event Settings', path: `${prefix}/settings`, icon: Settings },
  ];

  return (
    <aside className="w-72 h-screen sticky top-0 flex flex-col justify-between bg-white/95 border-r border-slate-200/80 p-6 select-none shrink-0 shadow-sm backdrop-blur-md">
      {/* Brand & Logo */}
      <div className="space-y-6">
        <div className="flex items-center gap-3.5 px-2">
          {/* Flame Icon Logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="currentColor"/>
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-extrabold font-display text-slate-900 tracking-tight leading-none">
              METIS
            </span>
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">
              CONTROL CENTER
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/10 to-orange-500/5 text-orange-600 border border-orange-200/80 shadow-sm shadow-orange-500/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3.5">
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive ? 'text-orange-500' : 'text-slate-500'
                        }`}
                      />
                      <span className="tracking-tight">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-200 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Card & Sign Out */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        {/* Profile Card */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/70 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-orange-500/20">
              {admin?.full_name?.charAt(0) || 'M'}
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs font-bold text-slate-900 truncate">
                {admin?.full_name || 'Metis Event Director'}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                {admin?.email || 'admin@metis.com'}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logoutAdmin}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-200 rounded-2xl transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
