import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getTeamMembers } from '../../services/admin';
import { TeamMember } from '../../types';
import { TradingRulesModal } from '../participant/TradingRulesModal';
import { TradeHistoryModal } from '../participant/TradeHistoryModal';
import {
  Menu,
  Bell,
  X,
  LogOut,
  Sun,
  Moon,
  Copy,
  Check,
  Eye,
  EyeOff,
  Users,
  BookOpen,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  Share2,
  History,
  Receipt,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ParticipantHeader: React.FC = () => {
  const { participant, logoutParticipant, setParticipantSession } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (participant?.team.id) {
      getTeamMembers(participant.team.id).then(setMembers);
    }
  }, [participant?.team.id]);

  const handleCopyCredentials = () => {
    if (!participant) return;
    const shareText = `🚀 METIS 2026 Arena Credentials:\nTeam: ${participant.team.name}\nTeam Code: ${participant.team.team_code}\nPIN: ${participant.team.pin_hash || '4821'}\nEnter arena at: https://metis-bvx.pages.dev/join`;
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSwitchTrader = (member: TeamMember) => {
    if (!participant) return;
    const updated = {
      ...participant,
      member,
    };
    setParticipantSession(updated);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-30 w-full backdrop-blur-xl px-4 py-2.5 transition-colors duration-300 ${
          isDark
            ? 'bg-[#0B0F19]/95 border-b border-white/5 text-white'
            : 'bg-white/95 border-b border-slate-200/80 text-slate-900 shadow-xs'
        }`}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Left: Menu Drawer Toggle */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-1 text-slate-400 hover:text-orange-500 transition-colors"
            aria-label="Open team menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Center: Clean Brand */}
          <Link to="/dashboard" className="flex items-center gap-1.5">
            {/* Flame Logo */}
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="currentColor"/>
              </svg>
            </div>
            <span className={`text-base font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              MET<span className="text-orange-500">I</span>S
            </span>
          </Link>

          {/* Right: Theme Toggle & Notification Bell */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className={`p-1.5 rounded-xl transition-colors ${
                isDark ? 'text-amber-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/news"
              className={`relative p-1.5 rounded-xl transition-colors ${
                isDark ? 'text-slate-300 hover:text-orange-400' : 'text-slate-700 hover:text-orange-500'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-orange-500 text-white text-[8px] font-black flex items-center justify-center shadow-xs">
                12
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-over Team Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div
            className={`relative w-80 max-w-[85vw] h-full shadow-2xl p-5 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200 overflow-y-auto ${
              isDark ? 'bg-[#131B2E] text-white border-r border-white/5' : 'bg-white text-slate-900'
            }`}
          >
            <div className="space-y-4">
              {/* 1. Header Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {participant?.team.name.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h3 className="font-black text-sm leading-tight">
                      Team {participant?.team.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {participant?.team.team_code}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2. Theme Switcher (Segmented Control) */}
              <div
                className={`p-1 rounded-2xl flex items-center border ${
                  isDark ? 'bg-[#0B0F19] border-white/5' : 'bg-slate-100 border-slate-200/80'
                }`}
              >
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                    isDark
                      ? 'bg-[#1E293B] text-orange-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                    !isDark
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
              </div>

              {/* 3. Team Access Credentials with 1-Click Share & Copy */}
              <div
                className={`p-3.5 rounded-2xl space-y-2 border ${
                  isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-400">
                  <span>Access Credentials</span>
                  <span className="text-emerald-500 font-mono">Verified</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Team Code</span>
                    <span className="font-mono font-black text-sm text-orange-500">
                      {participant?.team.team_code}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-[10px] text-slate-400 font-medium">PIN</span>
                      <button
                        onClick={() => setIsPinVisible(!isPinVisible)}
                        className="text-slate-400 hover:text-slate-200"
                        title={isPinVisible ? 'Hide PIN' : 'Reveal PIN'}
                      >
                        {isPinVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                    <span className="font-mono font-black text-sm text-orange-500 tracking-wider">
                      {isPinVisible ? participant?.team.pin_hash || '4821' : '••••'}
                    </span>
                  </div>
                </div>

                {/* Copy to Clipboard Button */}
                <button
                  onClick={handleCopyCredentials}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all mt-1 ${
                    isCopied
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isDark
                      ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Credentials!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-orange-500" />
                      <span>Share Code & PIN</span>
                    </>
                  )}
                </button>
              </div>

              {/* 4. Active Trader & Registered Team Roster */}
              <div
                className={`p-3.5 rounded-2xl space-y-2 border ${
                  isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-orange-500" />
                    <span>Team Roster ({members.length || 4})</span>
                  </div>
                  <span className="text-[9px] text-slate-400">Tap to switch</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(members.length > 0
                    ? members
                    : [
                        { id: '1', full_name: participant?.member.full_name || 'Mohammed Maaz' },
                        { id: '2', full_name: 'Rahul Kumar' },
                        { id: '3', full_name: 'Arjun Rao' },
                        { id: '4', full_name: 'Zaid Ahmed' },
                      ]
                  ).map((m: any) => {
                    const isCurrent =
                      m.full_name.toLowerCase() ===
                      (participant?.member.full_name || '').toLowerCase();

                    return (
                      <button
                        key={m.id}
                        onClick={() => handleSwitchTrader(m)}
                        className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-orange-500/15 text-orange-400 font-extrabold border border-orange-500/30'
                            : isDark
                            ? 'hover:bg-white/5 text-slate-300'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-4 h-4 rounded-full bg-slate-500/20 text-[9px] font-bold flex items-center justify-center">
                            {m.full_name.charAt(0)}
                          </span>
                          <span className="truncate">{m.full_name}</span>
                        </div>
                        {isCurrent && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Trading Rules & History */}
              <div className="space-y-1.5">
                {/* Trade & Order History Modal Trigger */}
                <button
                  onClick={() => setIsHistoryModalOpen(true)}
                  className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between border transition-all ${
                    isDark
                      ? 'bg-[#1E293B] border-white/5 hover:bg-[#28354D] text-slate-200'
                      : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-orange-500" />
                    <span>Trade & Order History</span>
                  </div>
                  <span className="text-slate-400 text-xs">›</span>
                </button>

                {/* Competition Guidelines Modal Trigger */}
                <button
                  onClick={() => setIsRulesModalOpen(true)}
                  className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between border transition-all ${
                    isDark
                      ? 'bg-[#1E293B] border-white/5 hover:bg-[#28354D] text-slate-200'
                      : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-orange-500" />
                    <span>Arena Rules & Guidelines</span>
                  </div>
                  <span className="text-slate-400 text-xs">›</span>
                </button>

                {/* Sound Chimes Toggle */}
                <button
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between border transition-all ${
                    isDark
                      ? 'bg-[#1E293B] border-white/5 hover:bg-[#28354D] text-slate-200'
                      : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSoundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                    <span>Order Sound Chimes</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold font-mono uppercase px-2 py-0.5 rounded-full ${
                      isSoundEnabled
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}
                  >
                    {isSoundEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom Actions: Leave Team Session */}
            <div className="pt-4 border-t border-white/5 space-y-2 mt-4">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  logoutParticipant();
                }}
                className={`w-full py-2.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs ${
                  isDark
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>Leave Team Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      <TradingRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        qualificationCount={participant?.event.qualification_count || 5}
      />

      {/* Trade History Modal */}
      <TradeHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        teamId={participant?.team.id}
        teamName={participant?.team.name}
      />
    </>
  );
};

export default ParticipantHeader;
