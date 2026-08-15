import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MetisLogo } from '../../components/ui/MetisLogo';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { verifyParticipant } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Verify: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setParticipantSession } = useAuth();

  const codeParam = searchParams.get('code') || '';
  const [teamCode, setTeamCode] = useState(codeParam);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifiedData, setVerifiedData] = useState<any>(null);

  useEffect(() => {
    if (codeParam) {
      setTeamCode(codeParam.toUpperCase());
    }
  }, [codeParam]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamCode.trim()) {
      setError('Team code is required.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your registered full name.');
      return;
    }
    if (!pin.trim()) {
      setError('Please enter the 4-digit Team PIN.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await verifyParticipant(teamCode, name, pin);
    setIsLoading(false);

    if (result.success && result.data) {
      setVerifiedData(result.data);
      setParticipantSession(result.data);
      setIsSuccess(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B00', '#FBBF24', '#10B981', '#ffffff'],
      });

      // Smooth transition to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(result.error || 'Verification failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-8 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link to="/join" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <MetisLogo size="sm" />
        <span className="text-xs font-mono text-orange-400">
          STEP 2 OF 2
        </span>
      </div>

      {/* Main Verification Card */}
      <main className="my-auto py-8">
        <GlassCard variant="orange-glow" className="p-6 sm:p-8 space-y-6">
          {isSuccess && verifiedData ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  VERIFIED & AUTHORIZED
                </span>
                <h3 className="text-2xl font-extrabold font-display text-white">
                  Welcome to Team {verifiedData.team.name}
                </h3>
                <p className="text-sm text-slate-300 font-medium">
                  {verifiedData.member.full_name}
                </p>
              </div>
              <div className="pt-2 text-xs text-slate-400 font-mono animate-pulse">
                Entering live trading arena...
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1 text-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-3 border border-orange-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold font-display text-white tracking-tight">
                  Team Member Verification
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Confirm your identity on the official roster for code <span className="font-mono text-orange-400 font-bold">{teamCode || '---'}</span>.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                {/* Team Code Display / Edit */}
                <Input
                  label="Team Code"
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ALPHA-7K29"
                  className="font-mono font-bold text-center uppercase"
                />

                {/* Member Name */}
                <Input
                  label="Your Registered Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Mohammed Maaz"
                  autoFocus
                />

                {/* Team PIN */}
                <Input
                  label="4-Digit Team PIN"
                  type="password"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••"
                  className="font-mono text-center tracking-widest text-lg"
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                {/* Error Alert */}
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Verify & Enter Market
                </Button>
              </form>
            </>
          )}
        </GlassCard>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400">
        Session remains persistently active throughout the competition.
      </footer>
    </div>
  );
};
