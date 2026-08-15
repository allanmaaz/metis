import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import {
  getTeams,
  getTeamMembers,
  createTeam,
  regenerateTeamCode,
  regenerateTeamPin,
  adjustTeamCash,
  setTeamStatus,
  deleteTeam,
  clearAllTeams,
} from '../../services/admin';
import { Event, Team, TeamMember } from '../../types';
import { CreateTeamModal } from '../../components/admin/CreateTeamModal';
import { CashAdjustModal } from '../../components/admin/CashAdjustModal';
import { TeamCredentialsModal } from '../../components/admin/TeamCredentialsModal';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, formatWealth } from '../../lib/formatting';
import {
  Users2,
  Plus,
  RotateCcw,
  DollarSign,
  UserX,
  UserCheck,
  Search,
  Copy,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Trash2,
  Printer,
  FileText,
  Share2,
} from 'lucide-react';
import { useRealtimeSubscription } from '../../lib/realtimeBus';

export const AdminTeams: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [membersMap, setMembersMap] = useState<Record<string, TeamMember[]>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Popovers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [selectedCredentialsTeam, setSelectedCredentialsTeam] = useState<Team | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeAdjustTeam, setActiveAdjustTeam] = useState<Team | null>(null);
  const [selectedDetailTeam, setSelectedDetailTeam] = useState<Team | null>(null);
  const [selectedRosterTeam, setSelectedRosterTeam] = useState<Team | null>(null);
  const [activeMenuTeamId, setActiveMenuTeamId] = useState<string | null>(null);

  // Show/Hide PIN toggle map
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadTeams = useCallback(async () => {
    try {
      const activeEvent = await getActiveEvent();
      setEvent(activeEvent);
      const teamList = await getTeams(activeEvent.id);
      setTeams(teamList);

      // Load members for all teams
      const membersPromises = teamList.map(async (t) => {
        const mems = await getTeamMembers(t.id);
        return { teamId: t.id, members: mems };
      });
      const memResults = await Promise.all(membersPromises);
      const map: Record<string, TeamMember[]> = {};
      memResults.forEach((r) => {
        map[r.teamId] = r.members;
      });
      setMembersMap(map);
    } catch (err) {
      console.error('Error loading teams:', err);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  useRealtimeSubscription(['TEAM_UPDATED', 'LEADERBOARD_UPDATED', 'PORTFOLIO_CHANGED'], loadTeams, 1500);

  const handleRegenerateCode = async (teamId: string) => {
    const res = await regenerateTeamCode(teamId);
    if (res.success) {
      loadTeams();
    }
  };

  const handleRegeneratePin = async (teamId: string) => {
    const res = await regenerateTeamPin(teamId);
    if (res.success) {
      loadTeams();
    }
  };

  const handleToggleStatus = async (team: Team) => {
    const nextStatus = team.status === 'ELIMINATED' ? 'ACTIVE' : 'ELIMINATED';
    const reason = nextStatus === 'ELIMINATED' ? 'Eliminated by event admin' : 'Restored by event admin';
    await setTeamStatus(team.id, nextStatus, reason);
    setActiveMenuTeamId(null);
    loadTeams();
  };

  const handleDeleteTeam = async (team: Team) => {
    if (window.confirm(`Are you sure you want to permanently delete Team "${team.name}"?`)) {
      await deleteTeam(team.id);
      setActiveMenuTeamId(null);
      loadTeams();
    }
  };

  const handleClearAllTeams = async () => {
    if (window.confirm('Are you sure you want to remove ALL teams and start with an empty roster?')) {
      await clearAllTeams(event?.id);
      loadTeams();
    }
  };

  const handleCreateTeam = async (data: any) => {
    const res = await createTeam(data);
    if (res.success) {
      loadTeams();
    }
    return res;
  };

  const handleCashAdjust = async (teamId: string, amount: number, reason: string) => {
    const res = await adjustTeamCash(teamId, amount, reason);
    if (res.success) {
      loadTeams();
    }
    return res;
  };

  const togglePinVisibility = (teamId: string) => {
    setVisiblePins((prev) => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const copyToClipboard = (text: string, teamId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(teamId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCopySingleCredentials = (team: Team) => {
    const pin = team.pin_hash || '4821';
    const text = `🏛️ *METIS 2026 — Team Access Credentials*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 *Team Name:* ${team.name}
🎟️ *Team Code:* \`${team.team_code}\`
🔑 *Access PIN:* \`${pin}\`
💰 *Starting Capital:* ${formatWealth(team.cash_balance)}
🌐 *Participant Portal:* https://metis-bvx.pages.dev
━━━━━━━━━━━━━━━━━━━━━━━━━━
_Keep your credentials confidential. Log in at the portal to trade._`;
    navigator.clipboard.writeText(text);
    setToastMessage(`Credentials for ${team.name} copied to clipboard!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.team_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalTeams = filteredTeams.length;
  const totalPages = Math.max(1, Math.ceil(totalTeams / pageSize));
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5 sm:gap-3 whitespace-nowrap shrink-0">
          <Users2 className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500 shrink-0" />
          <span>Team & Participant Management</span>
        </h1>

        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          {teams.length > 0 && (
            <button
              onClick={() => {
                setSelectedCredentialsTeam(null);
                setIsCredentialsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 text-xs sm:text-sm font-extrabold transition-all shadow-xs cursor-pointer"
              title="Export or print all team credentials and graphic passes"
            >
              <Printer className="w-4 h-4" />
              <span>Export Passes (PDF)</span>
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-orange-500/25 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Team</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Search teams by name or team code..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
        />
      </div>

      {/* 1. Mobile / Tablet Cards View (Visible on screens < lg) */}
      <div className="block lg:hidden space-y-3">
        {paginatedTeams.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-sm font-medium border border-slate-200/80">
            {teams.length === 0 ? 'No Teams Registered Yet' : 'No matching teams found'}
          </div>
        ) : (
          paginatedTeams.map((team, idx) => {
            const members = membersMap[team.id] || [];
            const isEliminated = team.status === 'ELIMINATED';
            const isDisabled = team.status === 'DISABLED';
            const isPinVisible = visiblePins[team.id];
            const openUpward = idx >= Math.max(1, paginatedTeams.length - 2) && paginatedTeams.length > 2;

            return (
              <div
                key={team.id}
                className={`bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 transition-colors ${
                  isEliminated ? 'opacity-60 bg-slate-50/60' : ''
                }`}
              >
                {/* Header: Avatar, Name & Status + 3-dots */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-orange-500/20 shrink-0">
                      {team.name.charAt(0) || 'T'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-base text-slate-900 truncate">
                          {team.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full font-mono border ${
                            isEliminated
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : isDisabled
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}
                        >
                          {team.status}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {isEliminated ? 'Eliminated' : 'Round 2'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Unified 3-dots Menu */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() =>
                        setActiveMenuTeamId(
                          activeMenuTeamId === team.id ? null : team.id
                        )
                      }
                      title="Team Actions"
                      className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/80 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuTeamId === team.id && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setActiveMenuTeamId(null)}
                        />
                        <div
                          className={`absolute right-0 ${
                            openUpward ? 'bottom-full mb-1.5' : 'top-10'
                          } w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl py-1.5 z-50 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100`}
                        >
                          {/* Section 1: Overview & Balance */}
                          <button
                            onClick={() => {
                              setSelectedDetailTeam(team);
                              setActiveMenuTeamId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Full Overview</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveAdjustTeam(team);
                              setActiveMenuTeamId(null);
                            }}
                            disabled={isEliminated}
                            className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            <span className="w-3.5 text-center font-black text-orange-600 text-xs">$</span>
                            <span>Adjust Cash Balance</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRosterTeam(team);
                              setActiveMenuTeamId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Users2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Manage Roster ({members.length})</span>
                          </button>

                          <div className="border-t border-slate-100 my-1" />

                          {/* Section 2: Credentials */}
                          <button
                            onClick={() => {
                              handleCopySingleCredentials(team);
                              setActiveMenuTeamId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-orange-500" />
                            <span>Copy Credentials</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCredentialsTeam(team);
                              setIsCredentialsModalOpen(true);
                              setActiveMenuTeamId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            <span>Print Pass (PDF)</span>
                          </button>
                          <button
                            onClick={() => {
                              handleRegenerateCode(team.id);
                              setActiveMenuTeamId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                            <span>Regenerate Code</span>
                          </button>
                          <button
                            onClick={() => {
                              handleRegeneratePin(team.id);
                              setActiveMenuTeamId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                            <span>Regenerate PIN</span>
                          </button>

                          <div className="border-t border-slate-100 my-1" />

                          {/* Section 3: Status & Danger */}
                          <button
                            onClick={() => {
                              handleToggleStatus(team);
                              setActiveMenuTeamId(null);
                            }}
                            className={`w-full px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                              isEliminated
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                          >
                            {isEliminated ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Restore Team</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Eliminate Team</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteTeam(team);
                              setActiveMenuTeamId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Team</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Credentials Bar */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Code:</span>
                    <span className="font-black text-orange-600">{team.team_code}</span>
                    <button
                      onClick={() => copyToClipboard(team.team_code, team.id)}
                      className="text-slate-400 hover:text-orange-600 p-0.5"
                      title="Copy code"
                    >
                      {copiedCodeId === team.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="text-[10px] uppercase font-bold text-slate-400">PIN:</span>
                    <span className="font-bold">
                      {isPinVisible ? team.pin_hash || '4821' : '••••'}
                    </span>
                    <button
                      onClick={() => togglePinVisibility(team.id)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title={isPinVisible ? 'Hide PIN' : 'Show PIN'}
                    >
                      {isPinVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedRosterTeam(team)}
                    className="flex items-center gap-1.5 text-slate-600 font-bold hover:text-orange-600 font-mono"
                  >
                    <Users2 className="w-3.5 h-3.5 text-orange-500" />
                    <span>{members.length} Members</span>
                    <span className="text-[10px] text-orange-500 font-bold">›</span>
                  </button>

                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-slate-400 text-[10px]">Cash:</span>
                    <span className="font-black text-slate-900">
                      {formatWealth(team.cash_balance)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Bar */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setActiveAdjustTeam(team)}
                    disabled={isEliminated}
                    className="px-3 py-2 rounded-xl text-xs font-extrabold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <span>Adjust Cash</span>
                  </button>

                  <button
                    onClick={() => setSelectedDetailTeam(team)}
                    className="px-3 py-2 rounded-xl text-xs font-extrabold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Detail</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Desktop Table View (Visible on screens >= lg) */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/80 shadow-sm">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-slate-50/80 border-b border-slate-100 text-[10.5px] font-black uppercase text-slate-400 tracking-wider font-mono">
            <tr>
              <th className="py-4 px-6 w-[28%] text-left whitespace-nowrap align-middle rounded-tl-3xl">
                Team & Status
              </th>
              <th className="py-4 px-6 w-[24%] text-left whitespace-nowrap align-middle">
                Access Credentials
              </th>
              <th className="py-4 px-4 w-[16%] text-center whitespace-nowrap align-middle">
                Members
              </th>
              <th className="py-4 px-6 w-[18%] text-right whitespace-nowrap align-middle">
                Available Cash
              </th>
              <th className="py-4 px-6 w-[14%] text-center whitespace-nowrap align-middle rounded-tr-3xl">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedTeams.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                      <Users2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-800">
                      {teams.length === 0 ? 'No Teams Registered Yet' : 'No matching teams found'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {teams.length === 0
                        ? 'Get started by registering your first competing team to generate their unique code and access PIN.'
                        : 'Try adjusting your search terms.'}
                    </p>
                    {teams.length === 0 && (
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Register First Team</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTeams.map((team, idx) => {
                const members = membersMap[team.id] || [];
                const isEliminated = team.status === 'ELIMINATED';
                const isDisabled = team.status === 'DISABLED';
                const isPinVisible = visiblePins[team.id];
                const openUpward = idx >= Math.max(1, paginatedTeams.length - 2) && paginatedTeams.length > 2;

                return (
                  <tr
                    key={team.id}
                    className={`hover:bg-slate-50/80 transition-colors group ${
                      isEliminated ? 'opacity-50 bg-slate-50/40' : ''
                    }`}
                  >
                    {/* 1. Team & Status */}
                    <td className="py-4 px-6 align-middle text-left">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-orange-500/20 shrink-0">
                          {team.name.charAt(0) || 'T'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-sm text-slate-900 tracking-tight truncate block">
                            {team.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full font-mono border ${
                                isEliminated
                                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                                  : isDisabled
                                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              }`}
                            >
                              {team.status}
                            </span>
                            <span className="text-[9.5px] text-slate-400 font-mono">
                              {isEliminated ? 'Eliminated' : 'Round 2'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Access Credentials */}
                    <td className="py-4 px-6 align-middle text-left font-mono text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Code:</span>
                          <span className="font-black text-orange-600">{team.team_code}</span>
                          <button
                            onClick={() => copyToClipboard(team.team_code, team.id)}
                            className="text-slate-400 hover:text-orange-600 p-0.5 cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCodeId === team.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">PIN:</span>
                          <span className="font-bold">
                            {isPinVisible ? team.pin_hash || '4821' : '••••'}
                          </span>
                          <button
                            onClick={() => togglePinVisibility(team.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            title={isPinVisible ? 'Hide PIN' : 'Show PIN'}
                          >
                            {isPinVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* 3. Registered Members */}
                    <td className="py-4 px-4 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedRosterTeam(team)}
                        title="Click to view team members"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-800 hover:text-orange-600 font-extrabold text-xs font-mono border border-slate-200/80 hover:border-orange-200 transition-all cursor-pointer group"
                      >
                        <Users2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-500 transition-colors" />
                        <span>{members.length}</span>
                        <span className="text-[10px] text-orange-500 font-bold">›</span>
                      </button>
                    </td>

                    {/* 4. Available Cash */}
                    <td className="py-4 px-6 align-middle text-right font-mono whitespace-nowrap">
                      <div className="font-black text-sm text-slate-900">
                        {formatWealth(team.cash_balance)}
                      </div>
                    </td>

                    {/* 5. Actions: Unified 3-dots Menu */}
                    <td className="py-4 px-6 align-middle text-center">
                      <div className="relative inline-flex items-center justify-center">
                        <button
                          onClick={() =>
                            setActiveMenuTeamId(
                              activeMenuTeamId === team.id ? null : team.id
                            )
                          }
                          title="Team Actions"
                          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200/80 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuTeamId === team.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setActiveMenuTeamId(null)}
                            />
                            <div
                              className={`absolute right-0 ${
                                openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                              } w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl py-1.5 z-50 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100`}
                            >
                              {/* Section 1: Overview & Balance */}
                              <button
                                onClick={() => {
                                  setSelectedDetailTeam(team);
                                  setActiveMenuTeamId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Full Overview</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveAdjustTeam(team);
                                  setActiveMenuTeamId(null);
                                }}
                                disabled={isEliminated}
                                className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors disabled:opacity-40 cursor-pointer"
                              >
                                <span className="w-3.5 text-center font-black text-orange-600 text-xs">$</span>
                                <span>Adjust Cash Balance</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRosterTeam(team);
                                  setActiveMenuTeamId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Users2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Manage Roster ({members.length})</span>
                              </button>

                              <div className="border-t border-slate-100 my-1" />

                              {/* Section 2: Credentials */}
                              <button
                                onClick={() => {
                                  handleCopySingleCredentials(team);
                                  setActiveMenuTeamId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-orange-500" />
                                <span>Copy Credentials</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCredentialsTeam(team);
                                  setIsCredentialsModalOpen(true);
                                  setActiveMenuTeamId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span>Print Pass (PDF)</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleRegenerateCode(team.id);
                                  setActiveMenuTeamId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                                <span>Regenerate Code</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleRegeneratePin(team.id);
                                  setActiveMenuTeamId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                                <span>Regenerate PIN</span>
                              </button>

                              <div className="border-t border-slate-100 my-1" />

                              {/* Section 3: Status & Danger */}
                              <button
                                onClick={() => {
                                  handleToggleStatus(team);
                                  setActiveMenuTeamId(null);
                                }}
                                className={`w-full px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                                  isEliminated
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-amber-600 hover:bg-amber-50'
                                }`}
                              >
                                {isEliminated ? (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Restore Team</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Eliminate Team</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteTeam(team);
                                  setActiveMenuTeamId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Team</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Bottom Pagination Bar */}
        <div className="p-4 sm:px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing{' '}
            <span className="font-bold text-slate-800">
              {totalTeams === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * pageSize, totalTeams)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{totalTeams}</span> teams
          </div>

          <div className="flex items-center gap-2">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                  currentPage === page
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500 shadow-xs ml-2"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Team Details Modal */}
      {selectedDetailTeam && (
        <Modal
          isOpen={!!selectedDetailTeam}
          onClose={() => setSelectedDetailTeam(null)}
          title={
            <div className="flex items-center gap-2">
              <span className="text-white font-black">{selectedDetailTeam.name} — Full Overview</span>
            </div>
          }
          subtitle={`Access Code: ${selectedDetailTeam.team_code} · Team ID: ${selectedDetailTeam.id}`}
        >
          <div className="space-y-4">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block font-mono tracking-wider">
                  Available Cash
                </span>
                <span className="text-xl font-black font-mono text-white mt-1 block">
                  {formatCurrency(selectedDetailTeam.cash_balance)}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {formatWealth(selectedDetailTeam.cash_balance)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block font-mono tracking-wider">
                  Team PIN
                </span>
                <span className="text-xl font-black font-mono text-orange-400 mt-1 block tracking-widest">
                  {selectedDetailTeam.pin_hash || '4821'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Used for verified login
                </span>
              </div>
            </div>

            {/* Roster Members */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block font-mono">
                Registered Competitors ({(membersMap[selectedDetailTeam.id] || []).length})
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(membersMap[selectedDetailTeam.id] || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No registered members yet.</p>
                ) : (
                  (membersMap[selectedDetailTeam.id] || []).map((member, idx) => (
                    <div
                      key={member.id || idx}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 font-black flex items-center justify-center text-xs border border-orange-500/30 font-mono">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-extrabold text-white block text-sm">{member.full_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {member.is_trader ? '⚡ Primary Trader' : 'Team Member'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                        ● Verified
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Team Roster Modal */}
      {selectedRosterTeam && (
        <Modal
          isOpen={!!selectedRosterTeam}
          onClose={() => setSelectedRosterTeam(null)}
          title={`Team ${selectedRosterTeam.name} — Members Roster`}
          subtitle={`Total: ${(membersMap[selectedRosterTeam.id] || []).length} registered competitor(s)`}
        >
          <div className="space-y-4">
            {/* Header Credentials Box */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase font-mono tracking-wider">Team Code:</span>
                <span className="font-mono font-black text-orange-400 text-base">{selectedRosterTeam.team_code}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-bold block text-[10px] uppercase font-mono tracking-wider">Access PIN:</span>
                <span className="font-mono font-black text-white text-base tracking-widest">{selectedRosterTeam.pin_hash || '4821'}</span>
              </div>
            </div>

            {/* List of members */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block font-mono">
                Team Competitors Roster
              </span>
              {(membersMap[selectedRosterTeam.id] || []).length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  No members have been added to this team yet.
                </div>
              ) : (
                (membersMap[selectedRosterTeam.id] || []).map((member, idx) => (
                  <div
                    key={member.id || idx}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-xs flex items-center justify-between hover:border-orange-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 font-black text-xs flex items-center justify-center font-mono border border-orange-500/30">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-white block">
                          {member.full_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {member.is_trader ? '⚡ Primary Trader' : 'Team Member'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ● Active
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedRosterTeam(null)}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition-colors shadow-xs"
              >
                Close Roster
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Team Modal */}
      {event && (
        <CreateTeamModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          eventId={event.id}
          onConfirmCreate={handleCreateTeam}
        />
      )}

      {/* Cash Adjust Modal */}
      {activeAdjustTeam && (
        <CashAdjustModal
          team={activeAdjustTeam}
          isOpen={!!activeAdjustTeam}
          onClose={() => setActiveAdjustTeam(null)}
          onConfirmAdjust={handleCashAdjust}
        />
      )}

      {/* Team Credentials & PDF Passes Modal */}
      <TeamCredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => {
          setIsCredentialsModalOpen(false);
          setSelectedCredentialsTeam(null);
        }}
        teams={teams}
        membersMap={membersMap}
        singleTeam={selectedCredentialsTeam}
      />
    </div>
  );
};

export default AdminTeams;
