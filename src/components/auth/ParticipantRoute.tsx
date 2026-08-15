import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ScrollAwareBottomNav } from '../navigation/ScrollAwareBottomNav';
import { ParticipantHeader } from '../navigation/ParticipantHeader';

export const ParticipantRoute: React.FC = () => {
  const { isParticipantAuthenticated } = useAuth();
  const { theme } = useTheme();

  if (!isParticipantAuthenticated) {
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
