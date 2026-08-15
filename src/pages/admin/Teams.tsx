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
} from '../../services/admin';
import { Event, Team, TeamMember } from '../../types';
import { CreateTeamModal } from '../../components/admin/CreateTeamModal';
import { CashAdjustModal } from '../../components/admin/CashAdjustModal';
import { formatCurrency, formatWealth } from '../../lib/formatting';
import {
  Users2,
  Plus,
  RotateCcw,
  DollarSign,
  UserX,
  UserCheck,
  Search,
} from 'lucide-react';

export const AdminTeams: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [membersMap, setMembersMap] = useState<Record<string, TeamMember[]>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeAdjustTeam, setActiveAdjustTeam] = useState<Team | null>(null);

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
    const interval = setInterval(loadTeams, 3000);
    return () => clearInterval(interval);
  }, [loadTeams]);

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
    loadTeams();
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

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.team_code.toLowerCase().includes(searchQuery.toLowerCase())
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

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm transition-all shadow-sm shadow-orange-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Team</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Search teams by name or team code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
        />
      </div>

      {/* Teams Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-6">Team Name</th>
                <th className="py-3.5 px-6">Access Credentials</th>
                <th className="py-3.5 px-6">Registered Members</th>
                <th className="py-3.5 px-6 text-right">Available Cash</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No teams matching query.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => {
                  const members = membersMap[team.id] || [];
                  const isEliminated = team.status === 'ELIMINATED';

                  return (
                    <tr
                      key={team.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isEliminated ? 'opacity-50 bg-slate-50/40' : ''
                      }`}
                    >
                      {/* Team Name */}
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-base text-slate-900">
                          {team.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          ID: {team.id}
                        </div>
                      </td>

                      {/* Credentials */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
                              {team.team_code}
                            </span>
                            <button
                              onClick={() => handleRegenerateCode(team.id)}
                              title="Regenerate Code"
                              className="p-1 text-slate-400 hover:text-orange-500 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                            <span>PIN: {team.pin_hash || '••••'}</span>
                            <button
                              onClick={() => handleRegeneratePin(team.id)}
                              title="Regenerate PIN"
                              className="p-0.5 text-slate-400 hover:text-orange-500 transition-colors"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Members */}
                      <td className="py-4 px-6">
                        {members.length > 0 ? (
                          <div className="space-y-0.5">
                            <div className="text-xs font-semibold text-slate-700 truncate max-w-xs">
                              {members.map((m) => m.full_name).join(', ')}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {members.length} verified roster member{members.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No members added
                          </span>
                        )}
                      </td>

                      {/* Cash */}
                      <td className="py-4 px-6 text-right font-mono">
                        <div className="font-bold text-base text-slate-900">
                          {formatCurrency(team.cash_balance)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ({formatWealth(team.cash_balance)})
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full font-mono border ${
                            isEliminated
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}
                        >
                          {team.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setActiveAdjustTeam(team)}
                            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200/80 hover:border-orange-200 transition-all flex items-center gap-1 shadow-xs"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                            <span>Adjust Cash</span>
                          </button>

                          <button
                            onClick={() => handleToggleStatus(team)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all shadow-xs border ${
                              isEliminated
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'
                                : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200'
                            }`}
                          >
                            {isEliminated ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Eliminate</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
