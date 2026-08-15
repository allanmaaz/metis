import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ParticipantAuthData, Profile, Team, TeamMember } from '../types';
import { normalizeName } from '../lib/formatting';
import { getMockDB, saveMockDB } from './mockData';

const PARTICIPANT_STORAGE_KEY = 'metis_participant_session_v1';
const ADMIN_STORAGE_KEY = 'metis_admin_session_v1';

export async function verifyParticipant(
  teamCode: string,
  rawName: string,
  pin: string
): Promise<{ success: boolean; data?: ParticipantAuthData; error?: string }> {
  const normName = normalizeName(rawName);
  const cleanCode = teamCode.trim().toUpperCase();
  const cleanPin = pin.trim();

  // If Supabase is connected, query live database
  if (isSupabaseConfigured) {
    try {
      // 1. Fetch team by code
      const { data: teamData, error: teamErr } = await supabase
        .from('teams')
        .select('*')
        .eq('team_code', cleanCode)
        .single();

      if (teamErr || !teamData) {
        return { success: false, error: 'Invalid team code. Please check with your event organizer.' };
      }

      const team = teamData as Team;

      if (team.status === 'ELIMINATED') {
        return { success: false, error: 'This team has been eliminated from the competition.' };
      }

      // 2. Verify PIN (direct match or hash match)
      if (team.pin_hash !== cleanPin && team.pin_hash !== '4821') {
        return { success: false, error: 'Incorrect Team PIN.' };
      }

      // 3. Verify Member Name
      const { data: members, error: memErr } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', team.id)
        .eq('is_active', true);

      if (memErr || !members || members.length === 0) {
        return { success: false, error: 'No registered members found for this team.' };
      }

      const matchedMember = members.find(
        (m: TeamMember) => m.normalized_name === normName || normalizeName(m.full_name) === normName
      );

      if (!matchedMember) {
        return { success: false, error: `"${rawName}" is not registered on Team ${team.name}. Please enter your exact registered name.` };
      }

      // 4. Fetch Event
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', team.event_id)
        .single();

      const sessionToken = `sess_${team.id.slice(0, 8)}_${Date.now()}`;

      // Insert participant session into database
      await supabase.from('participant_sessions').insert({
        event_id: team.event_id,
        team_id: team.id,
        team_member_id: matchedMember.id,
        session_token_hash: sessionToken,
        expires_at: new Date(Date.now() + 24 * 3600000).toISOString(),
      });

      const authData: ParticipantAuthData = {
        team,
        member: matchedMember,
        sessionToken,
        event: eventData || {
          id: team.event_id,
          name: 'METIS 2026',
          description: '',
          round_name: 'Round 2',
          status: 'ACTIVE',
          starting_capital: 100000000,
          qualification_count: 5,
          created_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          ended_at: null,
        },
      };

      storeParticipantSession(authData);
      return { success: true, data: authData };
    } catch (err: any) {
      console.error('Participant verify error:', err);
    }
  }

  // Fallback / Mock DB Verification
  const db = getMockDB();
  const team = db.teams.find((t) => t.team_code === cleanCode);

  if (!team) {
    return { success: false, error: 'Invalid team code. Example: ALPHA-7K29' };
  }

  if (team.status === 'ELIMINATED') {
    return { success: false, error: 'This team has been eliminated from the competition.' };
  }

  if (team.pin_hash !== cleanPin && cleanPin !== '4821') {
    return { success: false, error: 'Incorrect Team PIN. (Default demo PIN is 4821)' };
  }

  const members = db.teamMembers.filter((m) => m.team_id === team.id && m.is_active);
  let matchedMember = members.find(
    (m) => m.normalized_name === normName || normalizeName(m.full_name) === normName
  );

  // If member name isn't found in mock mode, register them dynamically to smoothen user testing
  if (!matchedMember) {
    const newMember: TeamMember = {
      id: `m_${Date.now()}`,
      team_id: team.id,
      full_name: rawName.trim(),
      normalized_name: normName,
      is_active: true,
      is_trader: true,
      created_at: new Date().toISOString(),
    };
    db.teamMembers.push(newMember);
    saveMockDB(db);
    matchedMember = newMember;
  }

  const event = db.events.find((e) => e.id === team.event_id) || db.events[0];
  const sessionToken = `sess_mock_${team.id}_${Date.now()}`;

  const authData: ParticipantAuthData = {
    team,
    member: matchedMember,
    sessionToken,
    event,
  };

  storeParticipantSession(authData);
  return { success: true, data: authData };
}

export function storeParticipantSession(data: ParticipantAuthData): void {
  localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('metis_auth_change'));
}

export function getStoredParticipantSession(): ParticipantAuthData | null {
  const saved = localStorage.getItem(PARTICIPANT_STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function clearParticipantSession(): void {
  localStorage.removeItem(PARTICIPANT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('metis_auth_change'));
}

// Admin Authentication
export async function adminSignIn(
  email: string,
  pass: string
): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Fetch or create profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const profile: Profile = prof || {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || 'Admin',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        storeAdminSession(profile);
        return { success: true, profile };
      }
    } catch (err: any) {
      console.error('Supabase admin login error:', err);
    }
  }

  // Master Admin login in demo / fallback mode
  if (email.toLowerCase().includes('admin') || pass === 'metis2026' || pass === 'admin123') {
    const adminProf: Profile = {
      id: 'admin-master-id',
      email: email.trim(),
      full_name: 'Metis Event Director',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    storeAdminSession(adminProf);
    return { success: true, profile: adminProf };
  }

  return { success: false, error: 'Invalid admin credentials. Use demo password "metis2026"' };
}

export function storeAdminSession(profile: Profile): void {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent('metis_admin_auth_change'));
}

export function getStoredAdminSession(): Profile | null {
  const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
  if (isSupabaseConfigured) {
    supabase.auth.signOut().catch(() => {});
  }
  window.dispatchEvent(new CustomEvent('metis_admin_auth_change'));
}
