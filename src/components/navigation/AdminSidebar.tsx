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
    <aside className="w-72 h-screen sticky top-0 flex flex-col justify-between bg-white/95 border-r border-slate-200/80 p-5 select-none shrink-0 shadow-sm backdrop-blur-md overflow-y-auto">
      {/* Brand & Logo */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 px-1">
          {/* Flame Icon Logo */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="currentColor"/>
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-black font-display text-slate-900 tracking-tight leading-none">
              METIS
            </span>
            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-1">
              CONTROL CENTER
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/10 to-orange-500/5 text-orange-600 border border-orange-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-orange-500' : 'text-slate-500'
                        }`}
                      />
                      <span className="tracking-tight">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-200 font-mono">
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

      {/* Bottom Section: Event Status Card + Profile Card + Sign Out */}
      <div className="space-y-3 pt-3 border-t border-slate-100 mt-2">
        {/* Mini Event Status Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              Event Status
            </span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-mono">
              ● MARKET OPEN
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-medium block">
              Session ends in
            </span>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-base font-black text-slate-900">
                12 : 14 : 32
              </span>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex gap-2">
                <span>HRS</span>
                <span>MIN</span>
                <span>SEC</span>
              </div>
            </div>
          </div>

          {/* Mini Sparkline */}
          <div className="h-6 w-full pt-1">
            <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path
                d="M0,20 Q15,12 30,18 T60,8 T85,12 T100,3"
                fill="none"
                stroke="#FF6B00"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Profile Card */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/70 transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-orange-500/20">
              {admin?.full_name?.charAt(0) || 'M'}
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs font-bold text-slate-900 truncate">
                {admin?.full_name || 'Metis Event Director'}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {admin?.email || 'admin@metis.com'}
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logoutAdmin}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-200 rounded-2xl transition-all shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
