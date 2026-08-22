import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MetisLogo } from '../../components/ui/MetisLogo';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getAllActiveTeams } from '../../services/auth';
import { getActiveEvent } from '../../services/event';
import { Team, Event } from '../../types';
import { ArrowRight, ArrowLeft, Users, Search, ChevronRight, KeyRound, Sparkles } from 'lucide-react';

export const Join: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [activeEvt, activeTeams] = await Promise.all([
          getActiveEvent(),
          getAllActiveTeams(),
        ]);
        if (isMounted) {
          setEvent(activeEvt);
          setTeams(activeTeams);
        }
      } catch (err) {
        console.error('Error loading teams for join screen:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectTeam = (team: Team) => {
    navigate(`/verify?code=${encodeURIComponent(team.team_code)}`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCode.trim().toUpperCase();
    if (!clean) {
      setError('Please enter your Team Code.');
      return;
    }
    if (clean.length < 3) {
      setError('Team code is too short.');
      return;
    }
    navigate(`/verify?code=${encodeURIComponent(clean)}`);
  };

  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.team_code.toLowerCase().includes(q) ||
      t.name.replace(/[^0-9a-z]/gi, '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col justify-between px-3.5 sm:px-6 py-6 sm:py-10 max-w-xl mx-auto selection:bg-orange-500/30">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <MetisLogo size="sm" />
        <span className="text-xs font-mono text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
          STEP 1 OF 2
        </span>
      </div>

      {/* Main Container */}
      <main className="my-auto py-6 space-y-4">
        <GlassCard variant="orange-glow" className="p-5 sm:p-7 space-y-5 border-orange-500/30">
          <div className="space-y-1.5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-2 border border-orange-500/30 shadow-lg shadow-orange-500/15">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              Select Your Team
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Tap your registered team to continue to identity & PIN verification.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search team name or number (e.g. 6, Acumen)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>

          {/* Teams Selection List */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
            {isLoading ? (
              <div className="py-12 text-center text-xs font-mono text-slate-400 animate-pulse">
                Loading official competition roster...
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs text-slate-400">No teams found matching "{searchQuery}".</p>
                <button
                  onClick={() => setShowManualInput(true)}
                  className="text-xs text-orange-400 hover:text-orange-300 font-bold underline cursor-pointer"
                >
                  Enter code manually instead
                </button>
              </div>
            ) : (
              filteredTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleSelectTeam(team)}
                  className="w-full p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-orange-500/50 transition-all flex items-center justify-between text-left group active:scale-[0.99] cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center font-black font-display text-sm border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      {team.name.replace(/[^0-9]/g, '') || team.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold font-display text-white text-sm group-hover:text-orange-400 transition-colors">
                        {team.name}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        Code: <span className="text-slate-300 font-semibold">{team.team_code}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-orange-400/80 group-hover:text-orange-400 text-[11px] sm:text-xs">
                      Select
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Manual Code Option Toggle */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            {!showManualInput ? (
              <button
                type="button"
                onClick={() => setShowManualInput(true)}
                className="text-[11px] sm:text-xs text-slate-400 hover:text-orange-400 transition-colors font-semibold cursor-pointer"
              >
                + Prefer typing a team code manually?
              </button>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-3 pt-2 animate-fade-in text-left">
                <Input
                  label="Team Code"
                  type="text"
                  placeholder="e.g. ACUM-J1BI"
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  className="font-mono font-bold text-center uppercase text-sm"
                  autoFocus
                />
                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
                    {error}
                  </div>
                )}
                <Button type="submit" variant="primary" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue with Code
                </Button>
              </form>
            )}
          </div>
        </GlassCard>
      </main>
    </div>
  );
};
