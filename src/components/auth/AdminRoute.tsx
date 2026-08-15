import React, { useState } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../navigation/AdminSidebar';
import { AdminBottomNav } from '../navigation/AdminBottomNav';
import { isAdminDomain } from '../../App';
import { Menu, Bell } from 'lucide-react';

export const AdminRoute: React.FC = () => {
  const { isAdminAuthenticated, admin } = useAuth();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  if (!isAdminAuthenticated) {
    return <Navigate to={isAdminDomain ? '/' : '/control/login'} replace />;
  }

  const prefix = isAdminDomain ? '' : '/control';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-500/20">
      {/* Mobile Top Navbar (Visible on < lg screens) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-xs">
        {/* Left: Hamburger Menu */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="p-1 text-slate-500 hover:text-orange-500 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: Brand & Subtitle */}
        <Link to={`${prefix}/dashboard`} className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="currentColor"/>
              </svg>
            </div>
            <span className="text-base font-black font-display text-slate-900 tracking-tight">
              MET<span className="text-orange-500">I</span>S
            </span>
          </div>
          <span className="text-[7.5px] font-bold text-orange-500 uppercase tracking-widest font-mono">
            CONTROL CENTER
          </span>
        </Link>

        {/* Right Action: Clean Quick Status / Logout Icon */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[9px] font-extrabold text-emerald-600 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>
      </header>

      {/* Responsive Sidebar (Persistent on Desktop, Slide-over Drawer on Mobile) */}
      <AdminSidebar
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Admin Content View */}
      <main className="flex-1 min-w-0 h-auto lg:h-screen overflow-y-auto px-3 sm:px-8 lg:px-10 py-4 sm:py-8 pb-28 lg:pb-8">
        <div className="max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
          <Outlet />
        </div>
      </main>

      {/* Floating Bottom Nav on Mobile */}
      <AdminBottomNav />
    </div>
  );
};

export default AdminRoute;
