import React from 'react';
import { MetisLogo } from '../ui/MetisLogo';
import { MarketStatusBadge } from '../ui/MarketStatusBadge';
import { MarketStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ParticipantHeaderProps {
  marketStatus?: MarketStatus;
}

export const ParticipantHeader: React.FC<ParticipantHeaderProps> = ({
  marketStatus = 'OPEN',
}) => {
  const { participant, logoutParticipant } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel-subtle border-b border-white/10 backdrop-blur-xl px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Logo & Event Info */}
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

        {/* Center: Market Status Indicator & Simulated Tag */}
        <div className="flex items-center gap-2 sm:gap-3">
          <MarketStatusBadge status={marketStatus} size="sm" />
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            Simulated Market
          </span>
        </div>

        {/* Right: Team Name & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {participant ? (
            <div className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 px-3 py-1.5 rounded-xl transition-colors">
              <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                {participant.team.name.charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  Team {participant.team.name}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[90px] sm:max-w-[120px]">
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
