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
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
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
  KeyRound,
  Lock,
  Search,
  ShieldAlert,
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

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.team_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
            <Users2 className="w-8 h-8 text-orange-500" />
            Team & Participant Management
          </h1>
          <p className="text-xs text-slate-400">
            Manage rosters, generate team codes & PINs, grant manual cash credits, and enforce eliminations.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Register New Team
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search teams by name or team code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/80 text-white placeholder:text-slate-500 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Teams Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Team Name</th>
                <th className="py-3 px-4">Access Credentials</th>
                <th className="py-3 px-4">Registered Members</th>
                <th className="py-3 px-4 text-right">Available Cash</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTeams.map((team) => {
                const members = membersMap[team.id] || [];
                const isEliminated = team.status === 'ELIMINATED';

                return (
                  <tr key={team.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-base text-white block">
                        {team.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {team.id.slice(0, 8)}
                      </span>
                    </td>

                    {/* Access Credentials */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                          {team.team_code}
                        </span>
                        <button
                          onClick={() => handleRegenerateCode(team.id)}
                          title="Regenerate team code"
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>PIN: {team.pin_hash || '4821'}</span>
                        <button
                          onClick={() => handleRegeneratePin(team.id)}
                          title="Regenerate PIN"
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Member Roster */}
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div className="max-w-[200px] truncate">
                        {members.map((m) => m.full_name).join(', ') || 'No members added'}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {members.length} verified roster members
                      </span>
                    </td>

                    {/* Cash Balance */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className="text-sm font-bold text-white block">
                        {formatCurrency(team.cash_balance)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({formatWealth(team.cash_balance)})
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isEliminated
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {team.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveAdjustTeam(team)}
                          leftIcon={<DollarSign className="w-3.5 h-3.5 text-orange-400" />}
                        >
                          Adjust Cash
                        </Button>

                        <Button
                          variant={isEliminated ? 'profit' : 'danger'}
                          size="sm"
                          onClick={() => handleToggleStatus(team)}
                          leftIcon={
                            isEliminated ? (
                              <UserCheck className="w-3.5 h-3.5" />
                            ) : (
                              <UserX className="w-3.5 h-3.5" />
                            )
                          }
                        >
                          {isEliminated ? 'Restore' : 'Eliminate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {/* Cash Adjustment Modal */}
      <CashAdjustModal
        isOpen={Boolean(activeAdjustTeam)}
        onClose={() => setActiveAdjustTeam(null)}
        team={activeAdjustTeam}
        onConfirmAdjust={handleCashAdjust}
      />
    </div>
  );
};
