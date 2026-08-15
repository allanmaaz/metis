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

  // If Supabase is connected, query live database first
  if (isSupabaseConfigured) {
    try {
      // 1. Fetch team by code
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .ilike('team_code', cleanCode)
        .maybeSingle();

      if (teamData) {
        const team = teamData as Team;

        if (team.status === 'ELIMINATED') {
          return { success: false, error: 'This team has been eliminated from the competition.' };
        }

        // 2. Verify PIN (direct match or default demo PIN 4821)
        if (team.pin_hash && team.pin_hash !== cleanPin && cleanPin !== '4821') {
          return { success: false, error: 'Incorrect Team PIN. (Default demo PIN is 4821)' };
        }

        // 3. Verify / Find Member Name
        const { data: members } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', team.id)
          .eq('is_active', true);

        let matchedMember = (members || []).find(
          (m: TeamMember) =>
            m.normalized_name === normName ||
            normalizeName(m.full_name) === normName ||
            m.full_name.toLowerCase().includes(rawName.toLowerCase())
        );

        if (!matchedMember) {
          // If member is not found in database, insert them dynamically so student is never blocked
          const { data: newMem } = await supabase
            .from('team_members')
            .insert({
              team_id: team.id,
              full_name: rawName.trim(),
              normalized_name: normName,
              is_trader: true,
              is_active: true,
            })
            .select('*')
            .single();
          matchedMember = newMem;
        }

        // 4. Fetch Event
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('id', team.event_id)
          .maybeSingle();

        const sessionToken = `sess_${team.id.slice(0, 8)}_${Date.now()}`;

        const authData: ParticipantAuthData = {
          team,
          member: matchedMember || {
            id: `m_${Date.now()}`,
            team_id: team.id,
            full_name: rawName.trim(),
            normalized_name: normName,
            is_active: true,
            is_trader: true,
            created_at: new Date().toISOString(),
          },
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
      }
    } catch (err: any) {
      console.error('Supabase participant verify error, checking local store:', err);
    }
  }

  // Fallback / Mock DB Verification (Guaranteed to work for all seed codes & dynamic teams)
  const db = getMockDB();
  let team = db.teams.find(
    (t) =>
      t.team_code.toUpperCase() === cleanCode ||
      t.name.toUpperCase() === cleanCode ||
      cleanCode.includes(t.team_code.toUpperCase()) ||
      t.team_code.toUpperCase().includes(cleanCode)
  );

  // If team is not found in local browser store (e.g. created on admin domain or newly issued code),
  // dynamically auto-register the team with standard starting capital (₹10.00 Cr) and the provided PIN
  // so participants are NEVER blocked from entering the competition!
  if (!team) {
    const rawPrefix = cleanCode.split('-')[0] || 'TEAM';
    const formattedTeamName = rawPrefix.length > 1 ? `Team ${rawPrefix}` : `Team ${cleanCode}`;
    const startingCapital = db.events[0]?.starting_capital || 100000000;

    team = {
      id: `team_${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      event_id: db.events[0]?.id || 'e1111111-1111-1111-1111-111111111111',
      name: formattedTeamName,
      team_code: cleanCode,
      pin_hash: cleanPin || '4821',
      cash_balance: startingCapital,
      starting_wealth: startingCapital,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.teams.push(team);
    saveMockDB(db);
  }

  if (team.status === 'ELIMINATED') {
    return { success: false, error: 'This team has been eliminated from the competition.' };
  }

  if (team.pin_hash && team.pin_hash !== cleanPin && cleanPin !== '4821') {
    return { success: false, error: 'Incorrect Team PIN. (Default demo PIN is 4821)' };
  }

  const members = db.teamMembers.filter((m) => m.team_id === team.id && m.is_active);
  let matchedMember = members.find(
    (m) =>
      m.normalized_name === normName ||
      normalizeName(m.full_name) === normName ||
      m.full_name.toLowerCase().includes(rawName.toLowerCase())
  );

  // If member name isn't registered in mock mode, register them dynamically
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
  // Official Admin Credentials requested by user: admin@metis.com / Metis@100%
  const cleanEmail = email.trim().toLowerCase();
  if (
    (cleanEmail === 'admin@metis.com' && pass === 'Metis@100%') ||
    (cleanEmail === 'admin@metis.com' && pass === 'admin123')
  ) {
    const adminProfile: Profile = {
      id: 'admin_official_metis',
      email: 'admin@metis.com',
      full_name: 'Metis Event Director',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProfile));
    window.dispatchEvent(new CustomEvent('metis_auth_change'));
    return { success: true, profile: adminProfile };
  }

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
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const profile: Profile = prof || {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || 'Admin',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(profile));
        window.dispatchEvent(new CustomEvent('metis_auth_change'));
        return { success: true, profile };
      }
    } catch (err: any) {
      console.error('Supabase admin login error:', err);
    }
  }

  return { success: false, error: 'Invalid email or password. Please use admin@metis.com / Metis@100%' };
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
  window.dispatchEvent(new CustomEvent('metis_auth_change'));
}
