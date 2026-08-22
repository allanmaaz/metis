import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MetisLogo } from '../../components/ui/MetisLogo';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { verifyParticipant, getTeamMembersByCode } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { Team, TeamMember } from '../../types';
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Lock, ChevronDown, UserCheck, Users } from 'lucide-react';
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

  const [teamInfo, setTeamInfo] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isCustomName, setIsCustomName] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  useEffect(() => {
    if (codeParam) {
      setTeamCode(codeParam.toUpperCase());
    }
  }, [codeParam]);

  // Dynamically load registered team members whenever teamCode changes
  useEffect(() => {
    let isMounted = true;
    const loadMembers = async () => {
      const clean = teamCode.trim().toUpperCase();
      if (!clean) {
        setMembers([]);
        setTeamInfo(null);
        return;
      }

      setIsLoadingMembers(true);
      try {
        const res = await getTeamMembersByCode(clean);
        if (isMounted) {
          setTeamInfo(res.team);
          setMembers(res.members);
          if (res.members && res.members.length > 0) {
            // Auto-select the first member by default
            setName((prev) => (prev && res.members.some((m) => m.full_name === prev) ? prev : res.members[0].full_name));
            setIsCustomName(false);
          }
        }
      } catch (err) {
        console.error('Error loading team members:', err);
      } finally {
        if (isMounted) setIsLoadingMembers(false);
      }
    };

    const debounce = setTimeout(loadMembers, 200);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [teamCode]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamCode.trim()) {
      setError('Team code is required.');
      return;
    }
    if (!name.trim()) {
      setError('Please select or enter your registered full name.');
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
                  {teamInfo ? (
                    <>
                      Confirm your identity for <span className="font-bold text-white">{teamInfo.name}</span> (<span className="font-mono text-orange-400 font-bold">{teamCode}</span>).
                    </>
                  ) : (
                    <>
                      Confirm your identity on the official roster for code <span className="font-mono text-orange-400 font-bold">{teamCode || '---'}</span>.
                    </>
                  )}
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                {/* Team Code Display / Edit */}
                <Input
                  label="Team Code"
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  className="font-mono font-bold text-center uppercase"
                />

                {/* Member Name: Dropdown Selector OR Manual Text */}
                {members.length > 0 && !isCustomName ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-0.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-orange-400" />
                        <span>Select Your Name</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomName(true);
                          setName('');
                        }}
                        className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
                      >
                        + Type manually
                      </button>
                    </div>

                    <div className="relative">
                      <select
                        value={name}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomName(true);
                            setName('');
                          } else {
                            setName(e.target.value);
                            setError(null);
                          }
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-white/15 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all appearance-none cursor-pointer"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.full_name} className="bg-slate-900 text-white py-2">
                            {m.is_trader ? '⭐ ' : '👤 '}
                            {m.full_name} {m.is_trader ? '— (Designated Trader)' : '— (Team Analyst / Viewer)'}
                          </option>
                        ))}
                        <option value="__CUSTOM__" className="bg-slate-900 text-orange-400">
                          ✍️ Other / Add another team member...
                        </option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Role Notice */}
                    {members.some((m) => m.full_name === name && m.is_trader) ? (
                      <div className="text-[11px] text-emerald-400/90 font-medium px-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        <span>Authorized for live order execution (Primary Trader)</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-300/90 font-medium px-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        <span>Team Viewer / Analyst mode (Live real-time market data)</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {members.length > 0 && (
                      <div className="flex items-center justify-between px-0.5">
                        <label className="text-xs font-bold text-slate-300">
                          Your Full Name
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomName(false);
                            setName(members[0]?.full_name || '');
                          }}
                          className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
                        >
                          ← Select from team roster ({members.length})
                        </button>
                      </div>
                    )}
                    <Input
                      label={members.length === 0 ? 'Your Registered Full Name' : undefined}
                      type="text"
                      placeholder="e.g. Farhan Khan"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError(null);
                      }}
                      autoFocus
                    />
                    <div className="text-[11px] text-slate-400 px-1">
                      {members.some((m) => m.is_trader)
                        ? 'ℹ️ Another member is already Primary Trader. You will join in Team Viewer mode.'
                        : '⭐ You will be registered as your team\'s Primary Trader.'}
                    </div>
                  </div>
                )}

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
    </div>
  );
};
