import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';

// Participant Pages
import { Landing } from './pages/participant/Landing';
import { Join } from './pages/participant/Join';
import { Verify } from './pages/participant/Verify';
import { Dashboard } from './pages/participant/Dashboard';
import { Market } from './pages/participant/Market';
import { Portfolio } from './pages/participant/Portfolio';
import { News } from './pages/participant/News';
import { Leaderboard } from './pages/participant/Leaderboard';

// Admin Pages
import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminMarketControl } from './pages/admin/MarketControl';
import { AdminStocks } from './pages/admin/Stocks';
import { AdminTeams } from './pages/admin/Teams';
import { AdminTrades } from './pages/admin/Trades';
import { AdminNews } from './pages/admin/News';
import { AdminLeaderboard } from './pages/admin/Leaderboard';
import { AdminAudit } from './pages/admin/Audit';
import { AdminSettings } from './pages/admin/Settings';

// Route Guards
import { ParticipantRoute } from './components/auth/ParticipantRoute';
import { AdminRoute } from './components/auth/AdminRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 2000,
    },
  },
});

// Check if user is accessing through an admin subdomain (e.g. metis-admin.pages.dev, admin.metis.pages.dev, admin.localhost)
export const isAdminDomain =
  typeof window !== 'undefined' &&
  (window.location.hostname.startsWith('admin.') ||
    window.location.hostname.includes('-admin.') ||
    window.location.hostname.startsWith('metis-admin.'));

// Root Screen based on Subdomain and Auth State
const DynamicRoot: React.FC = () => {
  const { isAdminAuthenticated } = useAuth();
  if (isAdminDomain) {
    return isAdminAuthenticated ? <AdminRoute /> : <AdminLogin />;
  }
  return <Landing />;
};

import { ThemeProvider } from './context/ThemeContext';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            {/* If on admin subdomain, root "/" renders Admin directly */}
            {isAdminDomain ? (
              <>
                <Route
                  path="/"
                  element={
                    <DynamicRootWrapper />
                  }
                />
                <Route element={<AdminRoute />}>
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/market" element={<AdminMarketControl />} />
                  <Route path="/stocks" element={<AdminStocks />} />
                  <Route path="/teams" element={<AdminTeams />} />
                  <Route path="/trades" element={<AdminTrades />} />
                  <Route path="/news" element={<AdminNews />} />
                  <Route path="/leaderboard" element={<AdminLeaderboard />} />
                  <Route path="/audit" element={<AdminAudit />} />
                  <Route path="/settings" element={<AdminSettings />} />

                  {/* Backwards compatibility for /control routes */}
                  <Route path="/control/dashboard" element={<AdminDashboard />} />
                  <Route path="/control/market" element={<AdminMarketControl />} />
                  <Route path="/control/stocks" element={<AdminStocks />} />
                  <Route path="/control/teams" element={<AdminTeams />} />
                  <Route path="/control/trades" element={<AdminTrades />} />
                  <Route path="/control/news" element={<AdminNews />} />
                  <Route path="/control/leaderboard" element={<AdminLeaderboard />} />
                  <Route path="/control/audit" element={<AdminAudit />} />
                  <Route path="/control/settings" element={<AdminSettings />} />
                </Route>
                <Route path="/control/login" element={<Navigate to="/" replace />} />
                <Route path="/control" element={<Navigate to="/" replace />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                {/* Public Participant Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/join" element={<Join />} />
                <Route path="/verify" element={<Verify />} />

                {/* Participant Protected Routes */}
                <Route element={<ParticipantRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                </Route>

                {/* Admin Control Routes (Path Based on Main Domain) */}
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/control/login" element={<AdminLogin />} />
                <Route path="/control" element={<AdminRedirectHandler />} />

                {/* Admin Protected Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/control/dashboard" element={<AdminDashboard />} />
                  <Route path="/control/market" element={<AdminMarketControl />} />
                  <Route path="/control/stocks" element={<AdminStocks />} />
                  <Route path="/control/teams" element={<AdminTeams />} />
                  <Route path="/control/trades" element={<AdminTrades />} />
                  <Route path="/control/news" element={<AdminNews />} />
                  <Route path="/control/leaderboard" element={<AdminLeaderboard />} />
                  <Route path="/control/audit" element={<AdminAudit />} />
                  <Route path="/control/settings" element={<AdminSettings />} />
                </Route>
              </>
            )}

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
}

// Wrapper to render Admin Login or Admin Dashboard on root
const DynamicRootWrapper: React.FC = () => {
  const { isAdminAuthenticated } = useAuth();
  return isAdminAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <AdminLogin />
  );
};

// Admin Redirect Handler for main domain
const AdminRedirectHandler: React.FC = () => {
  const { isAdminAuthenticated } = useAuth();
  return isAdminAuthenticated ? (
    <Navigate to="/control/dashboard" replace />
  ) : (
    <Navigate to="/control/login" replace />
  );
};

export default App;
