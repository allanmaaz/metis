import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../navigation/AdminSidebar';

export const AdminRoute: React.FC = () => {
  const { isAdminAuthenticated } = useAuth();

  if (!isAdminAuthenticated) {
    return <Navigate to="/control/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[#070B12] text-slate-100">
      <AdminSidebar />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto px-6 sm:px-10 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
