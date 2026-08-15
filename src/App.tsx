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

// Admin Root Redirection Handler
const AdminRootRedirect: React.FC = () => {
  const { isAdminAuthenticated } = useAuth();
  return isAdminAuthenticated ? (
    <Navigate to="/control/dashboard" replace />
  ) : (
    <Navigate to="/control/login" replace />
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Entry Routes */}
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

            {/* Admin Control Routes */}
            <Route path="/control" element={<AdminRootRedirect />} />
            <Route path="/control/login" element={<AdminLogin />} />

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

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
