import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MetisLogo } from '../../components/ui/MetisLogo';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowRight, KeyRound, Shield } from 'lucide-react';

export const Join: React.FC = () => {
  const navigate = useNavigate();
  const [teamCode, setTeamCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = teamCode.trim().toUpperCase();
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

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/">
          <MetisLogo size="sm" />
        </Link>
        <span className="text-xs font-mono text-slate-400">
          STEP 1 OF 2
        </span>
      </div>

      {/* Main Form */}
      <main className="my-auto py-8">
        <GlassCard variant="orange-glow" className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-3 border border-orange-500/30">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold font-display text-white tracking-tight">
              Join METIS Arena
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Enter your official team access code provided by the event organizers.
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-4">
            <Input
              label="Team Code"
              type="text"
              value={teamCode}
              onChange={(e) => {
                setTeamCode(e.target.value.toUpperCase());
                setError(null);
              }}
              className="text-center font-mono font-bold tracking-widest text-lg uppercase"
              autoFocus
            />

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Continue to Member Verification
            </Button>
          </form>
        </GlassCard>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-slate-400" />
        <span>End-to-end verified team sessions</span>
      </footer>
    </div>
  );
};
