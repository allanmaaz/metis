import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Bell, X, LogOut, Sun, Moon, Sparkles, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ParticipantHeader: React.FC = () => {
  const { participant, logoutParticipant } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isDark = theme === 'dark';

  return (
    <>
      <header
        className={`sticky top-0 z-30 w-full backdrop-blur-xl px-4 py-2.5 transition-colors duration-300 ${
          isDark
            ? 'bg-[#0B0F19]/95 border-b border-white/5 text-white'
            : 'bg-white/95 border-b border-slate-200/80 text-slate-900 shadow-xs'
        }`}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Left: Menu Drawer Toggle */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-1 text-slate-400 hover:text-orange-500 transition-colors"
            aria-label="Open team menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Center: Brand & Subtitle */}
          <Link to="/dashboard" className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5">
              {/* Flame Logo */}
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="currentColor"/>
                </svg>
              </div>
              <span className={`text-base font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                MET<span className="text-orange-500">I</span>S
              </span>
            </div>
            <span className="text-[8px] font-bold text-orange-500 uppercase tracking-widest font-mono">
              CONTROL CENTER
            </span>
          </Link>

          {/* Right: Theme Toggle & Notification Bell */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className={`p-1.5 rounded-xl transition-colors ${
                isDark ? 'text-amber-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/news"
              className={`relative p-1.5 rounded-xl transition-colors ${
                isDark ? 'text-slate-300 hover:text-orange-400' : 'text-slate-700 hover:text-orange-500'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-orange-500 text-white text-[8px] font-black flex items-center justify-center shadow-xs">
                12
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-over Team Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div
            className={`relative w-72 max-w-[85vw] h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200 ${
              isDark ? 'bg-[#131B2E] text-white border-r border-white/5' : 'bg-white text-slate-900'
            }`}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {participant?.team.name.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm leading-tight">
                      Team {participant?.team.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {participant?.team.team_code}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Switcher in Drawer */}
              <div
                className={`p-3.5 rounded-2xl flex items-center justify-between ${
                  isDark ? 'bg-[#1E293B] border border-white/5' : 'bg-slate-50 border border-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold">
                  {isDark ? <Moon className="w-4 h-4 text-orange-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1 rounded-xl text-xs font-extrabold bg-orange-500 text-white shadow-xs"
                >
                  Toggle
                </button>
              </div>

              {/* Verified Member Details */}
              <div
                className={`p-4 rounded-2xl space-y-1.5 ${
                  isDark ? 'bg-[#1E293B] border border-white/5' : 'bg-slate-50 border border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    Active Trader
                  </span>
                  <span className="text-[9px] font-black uppercase text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono">
                    Verified
                  </span>
                </div>
                <div className="font-bold text-sm">
                  {participant?.member.full_name}
                </div>
              </div>

              {/* Team PIN Info */}
              <div
                className={`p-4 rounded-2xl space-y-1 ${
                  isDark ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-orange-50/70 border border-orange-200/80'
                }`}
              >
                <span className="text-[10px] font-extrabold uppercase text-orange-500 block">
                  Team Access PIN
                </span>
                <span className="font-mono font-black text-lg tracking-widest block text-orange-500">
                  {participant?.team.pin_hash || '4821'}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                logoutParticipant();
              }}
              className={`w-full py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs ${
                isDark
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Team Session</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ParticipantHeader;
