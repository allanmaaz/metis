import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ScrollAwareBottomNav } from '../navigation/ScrollAwareBottomNav';
import { ParticipantHeader } from '../navigation/ParticipantHeader';
import { supabase, isSupabaseConfigured, isValidUuid } from '../../lib/supabase';

export const ParticipantRoute: React.FC = () => {
  const { isParticipantAuthenticated, participant, logoutParticipant } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (participant?.team?.id && isSupabaseConfigured && isValidUuid(participant.team.id)) {
      supabase
        .from('teams')
        .select('id, status')
        .eq('id', participant.team.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!data || data.status === 'ELIMINATED' || data.status === 'DISABLED') {
            logoutParticipant();
            navigate('/join');
          }
        });
    }
  }, [participant?.team?.id, logoutParticipant, navigate]);

  if (!isParticipantAuthenticated || !participant?.team?.team_code || !participant?.sessionToken) {
    return <Navigate to="/join" replace />;
  }

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-orange-500/20 pb-28 md:pb-8 transition-colors duration-300 ${
        isDark ? 'bg-[#0B0F19] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      <ParticipantHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-6">
        <Outlet />
      </main>
      <div className="md:hidden">
        <ScrollAwareBottomNav />
      </div>
    </div>
  );
};

export default ParticipantRoute;
