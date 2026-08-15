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
    <div className="min-h-screen flex flex-col pb-24">
      <ParticipantHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <Outlet />
      </main>
      <ScrollAwareBottomNav />
    </div>
  );
};
