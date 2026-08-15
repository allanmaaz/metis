import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MetisLogo } from '../../components/ui/MetisLogo';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { adminSignIn } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setAdminSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await adminSignIn(email, password);
    setIsLoading(false);

    if (result.success && result.profile) {
      setAdminSession(result.profile);
      navigate('/control/dashboard');
    } else {
      setError(result.error || 'Access denied. Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-12 max-w-md mx-auto bg-[#070B12]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link to="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Arena
        </Link>
        <span className="text-xs font-mono font-bold tracking-widest text-orange-400 uppercase">
          CONTROL ACCESS
        </span>
      </div>

      {/* Top Logo */}
      <div className="text-center space-y-2 mt-4">
        <MetisLogo size="lg" className="justify-center" />
        <span className="text-xs font-mono font-bold tracking-widest text-orange-400 uppercase">
          CONTROL CENTER ACCESS
        </span>
      </div>

      {/* Login Card */}
      <GlassCard variant="orange-glow" className="p-6 sm:p-8 space-y-6 my-auto">
        <div className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-3 border border-orange-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-white tracking-tight">
            Organizer Sign In
          </h2>
          <p className="text-xs text-slate-400">
            Enter administrative credentials to manage events, market states, and prices.
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            label="Admin Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="admin@metis.internal"
            leftIcon={<Mail className="w-4 h-4" />}
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center">
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
            Access Control Center
          </Button>
        </form>
      </GlassCard>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 font-mono">
        RESTRICTED ACCESS · AUTHORIZED EVENT DIRECTORS ONLY
      </footer>
    </div>
  );
};
