import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../navigation/AdminSidebar';
import { isAdminDomain } from '../../App';

export const AdminRoute: React.FC = () => {
  const { isAdminAuthenticated } = useAuth();

  if (!isAdminAuthenticated) {
    return <Navigate to={isAdminDomain ? '/' : '/control/login'} replace />;
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-500/20">
      <AdminSidebar />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto px-6 sm:px-10 py-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
