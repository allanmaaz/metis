import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BarChart2, Briefcase, FileText, Trophy, History } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getPublishedNews } from '../../services/news';
import { getActiveEvent } from '../../services/event';
import { useRealtimeSubscription } from '../../lib/realtimeBus';

export const ScrollAwareBottomNav: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const isDark = theme === 'dark';
  const [unreadNewsCount, setUnreadNewsCount] = useState<number>(0);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState<boolean>(true);

  const checkUnreadNews = useCallback(async () => {
    try {
      const allNews = await getPublishedNews();
      const total = allNews.length;
      const readRaw = localStorage.getItem('metis_read_news_count');
      const readCount = readRaw ? parseInt(readRaw, 10) : 0;

      if (location.pathname === '/news') {
        localStorage.setItem('metis_read_news_count', total.toString());
        setUnreadNewsCount(0);
      } else {
        setUnreadNewsCount(Math.max(0, total - readCount));
      }
    } catch {}
  }, [location.pathname]);

  const checkEventVisibility = useCallback(async () => {
    try {
      const activeEvent = await getActiveEvent();
      setIsLeaderboardVisible(activeEvent.is_leaderboard_visible !== false);
    } catch {}
  }, []);

  useEffect(() => {
    checkUnreadNews();
    checkEventVisibility();
  }, [checkUnreadNews, checkEventVisibility]);

  useRealtimeSubscription(['NEWS_UPDATED'], checkUnreadNews, 1000);
  useRealtimeSubscription(['LEADERBOARD_UPDATED', 'MARKET_SESSION_CHANGED'], checkEventVisibility, 2000);

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Market', path: '/market', icon: BarChart2 },
    { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { label: 'News', path: '/news', icon: FileText, badge: unreadNewsCount },
    { label: 'History', path: '/history', icon: History },
    ...(isLeaderboardVisible
      ? [{ label: 'Ranks', path: '/leaderboard', icon: Trophy }]
      : []),
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-safe px-4 mb-3 transition-all duration-300"
      aria-label="Participant Bottom Navigation"
    >
      <div
        className={`pointer-events-auto w-full max-w-lg backdrop-blur-2xl rounded-full p-1.5 shadow-2xl grid ${navItems.length === 6 ? 'grid-cols-6' : 'grid-cols-5'} gap-1 transition-all duration-300 ${
          isDark
            ? 'bg-[#131B2E]/95 border border-white/15 shadow-black/60'
            : 'bg-white/95 border border-slate-200/90 shadow-slate-900/20'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const badgeCount = item.badge || 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? isDark
                      ? 'bg-gradient-to-b from-orange-500/25 to-orange-500/15 text-orange-400 border border-orange-500/30 shadow-xs'
                      : 'bg-orange-50 text-orange-600 border border-orange-200/80 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive
                          ? 'text-orange-500 stroke-[2.5] scale-105'
                          : 'stroke-[2] text-slate-400 hover:text-slate-200'
                      }`}
                    />
                    {badgeCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black font-mono flex items-center justify-center shadow-xs animate-bounce">
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] tracking-tight mt-1 truncate max-w-full leading-none ${
                      isActive
                        ? isDark
                          ? 'font-black text-orange-400'
                          : 'font-black text-orange-600'
                        : isDark
                        ? 'font-bold text-slate-400'
                        : 'font-bold text-slate-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default ScrollAwareBottomNav;
