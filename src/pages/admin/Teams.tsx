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
} from 'lucide-react';
import { useRealtimeSubscription } from '../../lib/realtimeBus';

export const AdminTeams: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [membersMap, setMembersMap] = useState<Record<string, TeamMember[]>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Popovers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeAdjustTeam, setActiveAdjustTeam] = useState<Team | null>(null);
  const [selectedDetailTeam, setSelectedDetailTeam] = useState<Team | null>(null);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users2 className="w-7 h-7 text-orange-500" />
            Team & Participant Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage rosters, generate team codes & PINs, grant manual cash credits, and enforce eliminations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {teams.length > 0 && (
            <button
              onClick={handleClearAllTeams}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-extrabold transition-all shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Teams</span>
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm transition-all shadow-sm shadow-orange-500/20"
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

      {/* Teams Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[150px]">Team Name</th>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[220px]">Access Credentials</th>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[160px]">Registered Members</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap min-w-[150px]">Available Cash</th>
                <th className="py-3.5 px-6 text-center whitespace-nowrap min-w-[120px]">Status</th>
                <th className="py-3.5 px-6 text-center whitespace-nowrap min-w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTeams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
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
                          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-sm hover:opacity-95 transition-opacity"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Register First Team</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTeams.map((team) => {
                  const members = membersMap[team.id] || [];
                  const isEliminated = team.status === 'ELIMINATED';
                  const isDisabled = team.status === 'DISABLED';
                  const isPinVisible = visiblePins[team.id];

                  return (
                    <tr
                      key={team.id}
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        isEliminated ? 'opacity-50 bg-slate-50/40' : ''
                      }`}
                    >
                      {/* 1. Team Name */}
                      <td className="py-4 px-6 align-middle whitespace-nowrap">
                        <span className="font-extrabold text-base text-slate-900 tracking-tight block">
                          {team.name}
                        </span>
                      </td>

                      {/* 2. Access Credentials */}
                      <td className="py-4 px-6 align-middle whitespace-nowrap">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">
                            Team Code
                          </span>
                          {/* Code Pill with Copy */}
                          <div className="inline-flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl bg-orange-50/80 border border-orange-200/80 text-orange-600 font-mono font-black text-xs min-w-[150px]">
                            <span className="whitespace-nowrap font-mono">{team.team_code}</span>
                            <button
                              onClick={() => copyToClipboard(team.team_code, team.id)}
                              className="text-slate-400 hover:text-orange-600 transition-colors"
                              title="Copy team code"
                            >
                              {copiedCodeId === team.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* PIN with Eye Toggle & Regenerate */}
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 pt-0.5">
                            <span>
                              PIN: {isPinVisible ? team.pin_hash || '4821' : '••••'}
                            </span>
                            <button
                              onClick={() => togglePinVisibility(team.id)}
                              className="text-slate-400 hover:text-slate-700 transition-colors"
                              title={isPinVisible ? 'Hide PIN' : 'Show PIN'}
                            >
                              {isPinVisible ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleRegeneratePin(team.id)}
                              className="text-slate-400 hover:text-orange-500 transition-colors"
                              title="Regenerate PIN"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 3. Registered Members */}
                      <td className="py-4 px-6 align-middle whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 text-slate-800 font-extrabold text-xs font-mono border border-slate-200/80">
                          <Users2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{members.length === 1 ? '1 Member' : `${members.length} Members`}</span>
                        </div>
                      </td>

                      {/* 4. Available Cash */}
                      <td className="py-4 px-6 align-middle text-right font-mono whitespace-nowrap">
                        <div className="font-black text-base text-slate-900">
                          {formatCurrency(team.cash_balance)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans font-medium">
                          ({formatWealth(team.cash_balance)})
                        </div>
                      </td>

                      {/* 5. Status */}
                      <td className="py-4 px-6 align-middle text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center gap-0.5">
                          <span
                            className={`text-[10px] font-black uppercase px-3 py-1 rounded-full font-mono border ${
                              isEliminated
                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                : isDisabled
                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}
                          >
                            {team.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium font-mono">
                            {isEliminated ? 'Eliminated' : 'Round 2'}
                          </span>
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td className="py-4 px-6 align-middle text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 relative">
                          <div className="flex flex-col gap-1.5">
                            {/* Adjust Cash Button */}
                            <button
                              onClick={() => setActiveAdjustTeam(team)}
                              disabled={isEliminated}
                              className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                            >
                              <span className="text-orange-500 font-black">$</span>
                              <span>Adjust Cash</span>
                            </button>

                            {/* View Details Button */}
                            <button
                              onClick={() => setSelectedDetailTeam(team)}
                              className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Details</span>
                            </button>
                          </div>

                          {/* 3-dots Menu Button */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenuTeamId(
                                  activeMenuTeamId === team.id ? null : team.id
                                )
                              }
                              className="w-8 h-8 rounded-xl bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 border border-slate-200/80 flex items-center justify-center transition-all shadow-xs"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuTeamId === team.id && (
                              <div className="absolute right-0 top-10 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-1 z-30 space-y-0.5 text-left">
                                <button
                                  onClick={() => handleRegenerateCode(team.id)}
                                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                                  <span>Regenerate Code</span>
                                </button>
                                <button
                                  onClick={() => handleRegeneratePin(team.id)}
                                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                                  <span>Regenerate PIN</span>
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(team)}
                                  className={`w-full px-3.5 py-2 text-xs font-bold flex items-center gap-2 ${
                                    isEliminated
                                      ? 'text-emerald-600 hover:bg-emerald-50'
                                      : 'text-rose-600 hover:bg-rose-50'
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
                                  onClick={() => handleDeleteTeam(team)}
                                  className="w-full px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Team</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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
              <span>{selectedDetailTeam.name} — Full Overview</span>
            </div>
          }
          subtitle={`Access Code: ${selectedDetailTeam.team_code} · Team ID: ${selectedDetailTeam.id}`}
        >
          <div className="space-y-5">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] font-extrabold uppercase text-slate-400 block">
                  Available Cash
                </span>
                <span className="text-xl font-black font-mono text-slate-900 mt-1 block">
                  {formatCurrency(selectedDetailTeam.cash_balance)}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatWealth(selectedDetailTeam.cash_balance)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] font-extrabold uppercase text-slate-400 block">
                  Team PIN
                </span>
                <span className="text-xl font-black font-mono text-orange-500 mt-1 block tracking-wider">
                  {selectedDetailTeam.pin_hash || '4821'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Used for verified login
                </span>
              </div>
            </div>

            {/* Roster Members */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                Registered Roster Members ({(membersMap[selectedDetailTeam.id] || []).length})
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(membersMap[selectedDetailTeam.id] || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No registered members yet.</p>
                ) : (
                  (membersMap[selectedDetailTeam.id] || []).map((member, idx) => (
                    <div
                      key={member.id || idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-600 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900">{member.full_name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">
                        Verified
                      </span>
                    </div>
                  ))
                )}
              </div>
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
    </div>
  );
};

export default AdminTeams;
