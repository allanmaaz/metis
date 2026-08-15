import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, X, LogOut, Users, Shield, KeyRound, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ParticipantHeader: React.FC = () => {
  const { participant, logoutParticipant } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 border-b border-slate-200/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {/* Left: Menu Drawer Toggle */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 text-orange-500 hover:text-orange-600 transition-colors"
            aria-label="Open team menu"
          >
            <Menu className="w-6 h-6" />
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
              <span className="text-lg font-black font-display text-slate-900 tracking-tight">
                MET<span className="text-orange-500">I</span>S
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              {participant?.event.round_name || 'ROUND 2'} — VIRTUAL MARKET
            </span>
          </Link>

          {/* Right: Notification Bell */}
          <Link to="/news" className="relative p-1.5 text-slate-700 hover:text-orange-500 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
              3
            </span>
          </Link>
        </div>
      </header>

      {/* Slide-over Team Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                    {participant?.team.name.charAt(0) || 'M'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Team {participant?.team.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {participant?.team.team_code}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Verified Member Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    Signed in as
                  </span>
                  <span className="text-[10px] font-black uppercase text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 font-mono">
                    Verified
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900">
                  {participant?.member.full_name}
                </div>
              </div>

              {/* Team PIN Info */}
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-orange-600 block">
                  Team Access PIN
                </span>
                <span className="font-mono font-black text-lg text-slate-900 tracking-widest block">
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
              className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
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
