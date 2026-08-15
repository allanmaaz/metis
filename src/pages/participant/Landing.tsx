import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MetisLogo } from '../../components/ui/MetisLogo';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getActiveEvent } from '../../services/event';
import { Event } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, ShieldCheck, Zap, Award, BarChart2, Lock } from 'lucide-react';
import { formatWealth } from '../../lib/formatting';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isParticipantAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    getActiveEvent().then(setEvent);
  }, []);

  const handleEnter = () => {
    if (isParticipantAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/join');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 sm:px-6 py-6 sm:py-10 max-w-5xl mx-auto selection:bg-orange-500/30 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header - Centered */}
      <header className="flex items-center justify-center w-full py-2">
        <MetisLogo size="lg" />
      </header>

      {/* Hero Section */}
      <main className="my-auto py-8 sm:py-12 flex flex-col items-center text-center space-y-6 sm:space-y-8">
        {/* Pulsing Event Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border border-orange-500/30 text-orange-300 text-xs sm:text-sm font-extrabold tracking-wider shadow-lg shadow-orange-500/10 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span className="font-mono uppercase tracking-widest text-[11px] sm:text-xs">
            THE STRATEGIC MARKET CHALLENGE
          </span>
        </div>

        {/* Hero Title - Centered & Balanced */}
        <div className="space-y-4 max-w-3xl px-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white leading-tight sm:leading-none">
            Where Strategy{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Meets Fortune.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-medium">
            High-velocity virtual stock trading arena. Real-time regulatory wires, portfolio rebalancing, and live competitive leaderboards.
          </p>
        </div>

        {/* Active Event Card */}
        <div className="w-full max-w-md pt-2">
          <GlassCard
            variant="orange-glow"
            className="p-6 sm:p-8 text-left space-y-5 border-orange-500/40 relative overflow-hidden shadow-2xl shadow-orange-500/10"
          >
            {/* Background geometric flare */}
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <Badge variant="green" size="md" dot>
                {event?.status === 'ACTIVE' ? 'LIVE EVENT' : 'UPCOMING EVENT'}
              </Badge>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60">
                {event?.round_name || 'Round 2'}
              </span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
                {event?.name || 'METIS 2026'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {event?.description || 'Virtual Stock Market Championship'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Starting Capital</span>
                <span className="text-base sm:text-lg font-black font-display text-emerald-400">
                  {formatWealth(event?.starting_capital || 100000000)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Qualification</span>
                <span className="text-base sm:text-lg font-black font-display text-amber-400">
                  Top {event?.qualification_count || 5} Teams
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleEnter}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full py-3.5 font-black text-sm tracking-wide shadow-lg shadow-orange-500/25"
            >
              {isParticipantAuthenticated ? 'ENTER YOUR ARENA' : 'ENTER EVENT'}
            </Button>
          </GlassCard>
        </div>

        {/* 3 Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-3xl pt-4">
          <div className="glass-panel p-4 rounded-2xl text-left flex items-start gap-3 border border-slate-800/80 hover:border-orange-500/30 transition-all">
            <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Live News Wire</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Strategic announcements & regulatory shifts that move market prices.
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl text-left flex items-start gap-3 border border-slate-800/80 hover:border-emerald-500/30 transition-all">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant Execution</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Atomic buy/sell orders with real-time portfolio rebalancing.
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl text-left flex items-start gap-3 border border-slate-800/80 hover:border-amber-500/30 transition-all">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Dynamic Ranks</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Real-time competitive leaderboard calculating total wealth.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
