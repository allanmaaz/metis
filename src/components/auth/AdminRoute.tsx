import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../navigation/AdminSidebar';
import { isAdminDomain } from '../../App';
import { Menu } from 'lucide-react';

export const AdminRoute: React.FC = () => {
  const { isAdminAuthenticated, admin } = useAuth();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  if (!isAdminAuthenticated) {
    return <Navigate to={isAdminDomain ? '/' : '/control/login'} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-500/20">
      {/* Mobile Top Navbar (Visible on < lg screens) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-1.5 text-orange-500 hover:text-orange-600 rounded-xl transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="currentColor"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black font-display text-slate-900 tracking-tight leading-none">
                METIS
              </span>
              <span className="text-[8px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">
                CONTROL
              </span>
            </div>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          {admin?.full_name?.charAt(0) || 'M'}
        </div>
      </header>

      {/* Responsive Sidebar (Persistent on Desktop, Slide-over Drawer on Mobile) */}
      <AdminSidebar
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Admin Content View */}
      <main className="flex-1 min-w-0 h-auto lg:h-screen overflow-y-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminRoute;
