import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ScrollAwareBottomNav } from '../navigation/ScrollAwareBottomNav';
import { ParticipantHeader } from '../navigation/ParticipantHeader';

export const ParticipantRoute: React.FC = () => {
  const { isParticipantAuthenticated } = useAuth();

  if (!isParticipantAuthenticated) {
    return <Navigate to="/join" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-500/20 pb-28">
      <ParticipantHeader />
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-3 sm:py-4">
        <Outlet />
      </main>
      <ScrollAwareBottomNav />
    </div>
  );
};
