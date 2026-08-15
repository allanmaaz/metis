import React from 'react';
import { MetisLogo } from '../ui/MetisLogo';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ParticipantHeader: React.FC = () => {
  const { participant, logoutParticipant } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel-subtle border-b border-white/10 backdrop-blur-xl px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Round */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <MetisLogo size="sm" />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              {participant?.event.name || 'METIS 2026'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">
              {participant?.event.round_name || 'VIRTUAL TRADING ARENA'}
            </span>
          </div>
        </Link>

        {/* Right: Team Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {participant ? (
            <div className="flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 px-3 py-1.5 rounded-xl transition-colors">
              <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                {participant.team.name.charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  Team {participant.team.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[100px] sm:max-w-[140px]">
                  {participant.member.full_name}
                </span>
              </div>
              <button
                onClick={logoutParticipant}
                title="Log out of session"
                className="ml-1 p-1 text-slate-400 hover:text-rose-400 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/join"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-1.5 rounded-xl shadow-md transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              Join Team
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
