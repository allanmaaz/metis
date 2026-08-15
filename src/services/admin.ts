import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Team, TeamMember, TeamStatus } from '../types';
import { normalizeName } from '../lib/formatting';
import { getMockDB, saveMockDB } from './mockData';

export async function getTeams(eventId: string): Promise<Team[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data as Team[];
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  }

  const db = getMockDB();
  return db.teams.filter((t) => t.event_id === eventId);
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('is_active', true);

      if (!error && data) {
        return data as TeamMember[];
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  }

  const db = getMockDB();
  return db.teamMembers.filter((m) => m.team_id === teamId && m.is_active);
}

export async function createTeam(data: {
  event_id: string;
  name: string;
  starting_capital?: number;
  members: string[];
}): Promise<{ success: boolean; data?: Team; error?: string }> {
  const teamName = data.name.trim();
  const capital = data.starting_capital || 100000000;
  const prefix = teamName.toUpperCase().slice(0, 4).replace(/[^A-Z]/g, 'TEAM');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const teamCode = `${prefix}-${randomSuffix}`;
  const pin = Math.floor(1000 + Math.random() * 9000).toString();

  if (isSupabaseConfigured) {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .insert({
          event_id: data.event_id,
          name: teamName,
          team_code: teamCode,
          pin_hash: pin,
          cash_balance: capital,
          starting_wealth: capital,
          status: 'ACTIVE',
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      // Insert members
      if (data.members.length > 0) {
        const memberRows = data.members
          .filter((m) => m.trim().length > 0)
          .map((m) => ({
            team_id: team.id,
            full_name: m.trim(),
            normalized_name: normalizeName(m),
            is_active: true,
            is_trader: true,
          }));

        if (memberRows.length > 0) {
          await supabase.from('team_members').insert(memberRows);
        }
      }

      return { success: true, data: team as Team };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const db = getMockDB();
  const newTeam: Team = {
    id: `t_${Date.now()}`,
    event_id: data.event_id,
    name: teamName,
    team_code: teamCode,
    pin_hash: pin,
    cash_balance: capital,
    starting_wealth: capital,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.teams.push(newTeam);

  data.members.forEach((m) => {
    if (m.trim().length > 0) {
      db.teamMembers.push({
        id: `m_${Date.now()}_${Math.random()}`,
        team_id: newTeam.id,
        full_name: m.trim(),
        normalized_name: normalizeName(m),
        is_active: true,
        is_trader: true,
        created_at: new Date().toISOString(),
      });
    }
  });

  saveMockDB(db);
  return { success: true, data: newTeam };
}

export async function regenerateTeamCode(teamId: string): Promise<{ success: boolean; newCode?: string; error?: string }> {
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const newCode = `METIS-${randomSuffix}`;

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ team_code: newCode, updated_at: new Date().toISOString() })
        .eq('id', teamId);

      if (error) return { success: false, error: error.message };
      return { success: true, newCode };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const db = getMockDB();
  const team = db.teams.find((t) => t.id === teamId);
  if (team) {
    team.team_code = newCode;
    team.updated_at = new Date().toISOString();
    saveMockDB(db);
    return { success: true, newCode };
  }
  return { success: false, error: 'Team not found' };
}

export async function regenerateTeamPin(teamId: string): Promise<{ success: boolean; newPin?: string; error?: string }> {
  const newPin = Math.floor(1000 + Math.random() * 9000).toString();

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ pin_hash: newPin, updated_at: new Date().toISOString() })
        .eq('id', teamId);

      if (error) return { success: false, error: error.message };
      return { success: true, newPin };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const db = getMockDB();
  const team = db.teams.find((t) => t.id === teamId);
  if (team) {
    team.pin_hash = newPin;
    team.updated_at = new Date().toISOString();
    saveMockDB(db);
    return { success: true, newPin };
  }
  return { success: false, error: 'Team not found' };
}

export async function adjustTeamCash(
  teamId: string,
  amount: number,
  reason: string,
  adminId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('adjust_team_cash', {
        p_team_id: teamId,
        p_amount: amount,
        p_reason: reason,
        p_admin_id: adminId || null,
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const db = getMockDB();
  const team = db.teams.find((t) => t.id === teamId);
  if (!team) return { success: false, error: 'Team not found' };

  const prev = team.cash_balance;
  if (prev + amount < 0) {
    return { success: false, error: 'Adjustment would result in negative cash balance' };
  }

  team.cash_balance += amount;
  team.updated_at = new Date().toISOString();

  db.auditLogs.unshift({
    id: `al_${Date.now()}`,
    event_id: team.event_id,
    actor_type: 'ADMIN',
    actor_id: adminId || null,
    action: 'CASH_ADJUSTMENT',
    entity_type: 'TEAM',
    entity_id: team.id,
    old_value: { cash: prev, team: team.name },
    new_value: { cash: team.cash_balance, adjustment: amount, team: team.name },
    reason,
    metadata: null,
    created_at: new Date().toISOString(),
  });

  saveMockDB(db);
  return {
    success: true,
    data: { team_name: team.name, previous_balance: prev, adjustment: amount, new_balance: team.cash_balance },
  };
}

export async function setTeamStatus(
  teamId: string,
  status: TeamStatus,
  reason: string,
  adminId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('set_team_status', {
        p_team_id: teamId,
        p_status: status,
        p_reason: reason,
        p_admin_id: adminId || null,
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const db = getMockDB();
  const team = db.teams.find((t) => t.id === teamId);
  if (!team) return { success: false, error: 'Team not found' };

  const oldStatus = team.status;
  team.status = status;
  team.updated_at = new Date().toISOString();

  db.auditLogs.unshift({
    id: `al_${Date.now()}`,
    event_id: team.event_id,
    actor_type: 'ADMIN',
    actor_id: adminId || null,
    action: `TEAM_STATUS_${status}`,
    entity_type: 'TEAM',
    entity_id: team.id,
    old_value: { status: oldStatus, team: team.name },
    new_value: { status, team: team.name },
    reason,
    metadata: null,
    created_at: new Date().toISOString(),
  });

  saveMockDB(db);
  return { success: true, data: { team_name: team.name, old_status: oldStatus, new_status: status } };
}
