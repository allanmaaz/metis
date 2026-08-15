import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen flex flex-col justify-between px-4 sm:px-6 py-8 max-w-5xl mx-auto selection:bg-orange-500/30">
      {/* Top Bar */}
      <header className="flex items-center justify-between w-full">
        <MetisLogo size="md" />
      </header>

      {/* Hero Section */}
      <main className="my-auto py-12 flex flex-col items-center text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-orange-500/30 text-orange-300 text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-orange-500/10">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
          <span>THE STRATEGIC MARKET CHALLENGE</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display tracking-tight text-white leading-none">
            Where Strategy <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Meets Fortune.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto font-normal leading-relaxed">
            A high-stakes, mobile-first virtual market arena. Read breaking news, decode market catalysts, execute strategic trades, and lead the live rankings.
          </p>
        </div>

        {/* Active Event Card */}
        <div className="w-full max-w-md">
          <GlassCard
            variant="orange-glow"
            className="p-6 sm:p-7 text-left space-y-5 border-orange-500/40 relative overflow-hidden"
          >
            {/* Background geometric flare */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <Badge variant="green" size="md" dot>
                {event?.status === 'ACTIVE' ? 'LIVE EVENT' : 'UPCOMING EVENT'}
              </Badge>
              <span className="text-xs font-mono text-slate-400">
                {event?.round_name || 'Round 2'}
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-extrabold font-display text-white tracking-tight">
                {event?.name || 'METIS 2026'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {event?.description || 'Virtual Stock Market Championship'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Starting Capital</span>
                <span className="text-base font-bold font-display text-emerald-400">
                  {formatWealth(event?.starting_capital || 100000000)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Qualification</span>
                <span className="text-base font-bold font-display text-amber-400">
                  Top {event?.qualification_count || 5} Teams
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleEnter}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full"
            >
              {isParticipantAuthenticated ? 'ENTER YOUR ARENA' : 'ENTER EVENT'}
            </Button>
          </GlassCard>
        </div>

        {/* 3 Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl pt-4">
          <div className="glass-panel p-4 rounded-2xl text-left flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Live News Wire</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Strategic announcements & regulatory shifts that move prices.
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl text-left flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant Execution</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Atomic buy/sell orders with real-time portfolio rebalancing.
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl text-left flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Dynamic Ranks</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time competitive leaderboard calculating total wealth.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
