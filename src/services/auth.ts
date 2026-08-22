import { supabase, isSupabaseConfigured, isValidUuid } from '../lib/supabase';
import { ParticipantAuthData, Profile, Team, TeamMember } from '../types';
import { normalizeName } from '../lib/formatting';
import { getMockDB, saveMockDB } from './mockData';

const PARTICIPANT_STORAGE_KEY = 'metis_participant_session_v1';
const ADMIN_STORAGE_KEY = 'metis_admin_session_v1';

function getCharSubstitutions(str: string): string[] {
  let results = [''];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const next: string[] = [];
    for (const r of results) {
      if (char === 'I' || char === '1') {
        next.push(r + 'I');
        next.push(r + '1');
      } else if (char === 'O' || char === '0') {
        next.push(r + 'O');
        next.push(r + '0');
      } else {
        next.push(r + char);
      }
    }
    results = next;
  }
  return results;
}

export function normalizeCodeVariants(code: string): string[] {
  const clean = code.trim().toUpperCase();
  if (!clean) return [];
  const variants = new Set<string>();
  variants.add(clean);

  const parts = clean.split('-');
  const prefix = parts[0];
  const suffix = parts.slice(1).join('-');

  const subs = getCharSubstitutions(suffix || clean);
  for (const s of subs) {
    if (suffix) {
      variants.add(`${prefix}-${s}`);
      variants.add(`${prefix}${s}`);
    } else {
      variants.add(s);
    }
  }
  return Array.from(variants);
}

export async function getAllActiveTeams(eventId?: string): Promise<Team[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('teams')
        .select('*')
        .order('name', { ascending: true });

      if (eventId && isValidUuid(eventId)) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.filter((t) => t.status !== 'ELIMINATED') as Team[];
      }
    } catch (err) {
      console.error('Error loading active teams from Supabase:', err);
    }
  }

  const db = getMockDB();
  return db.teams.filter((t) => t.status !== 'ELIMINATED');
}

export async function getTeamMembersByCode(
  teamCode: string
): Promise<{ team: Team | null; members: TeamMember[] }> {
  const cleanCode = teamCode.trim().toUpperCase();
  if (!cleanCode) return { team: null, members: [] };

  const variants = normalizeCodeVariants(cleanCode);

  if (isSupabaseConfigured) {
    try {
      for (const v of variants) {
        const { data: teamData } = await supabase
          .from('teams')
          .select('*')
          .ilike('team_code', v)
          .maybeSingle();

        if (teamData) {
          const team = teamData as Team;
          const { data: members } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_id', team.id)
            .eq('is_active', true)
            .order('created_at', { ascending: true });

          return { team, members: (members as TeamMember[]) || [] };
        }
      }
    } catch (err) {
      console.error('Error fetching team members by code from Supabase:', err);
    }
  }

  // Fallback to local DB (exact & variant match)
  const db = getMockDB();
  let team: Team | null = null;
  for (const v of variants) {
    const found = db.teams.find((t) => t.team_code.trim().toUpperCase() === v);
    if (found) {
      team = found;
      break;
    }
  }

  if (team) {
    const members = db.teamMembers.filter((m) => m.team_id === team.id && m.is_active);
    return { team, members };
  }

  return { team: null, members: [] };
}

export async function verifyParticipant(
  teamCode: string,
  rawName: string,
  pin: string
): Promise<{ success: boolean; data?: ParticipantAuthData; error?: string }> {
  const normName = normalizeName(rawName);
  const cleanCode = teamCode.trim().toUpperCase();
  const cleanPin = pin.trim();

  if (!cleanCode) {
    return { success: false, error: 'Team code is required.' };
  }
  if (!cleanPin) {
    return { success: false, error: 'Team PIN is required.' };
  }
  if (!rawName.trim()) {
    return { success: false, error: 'Participant name is required.' };
  }

  const variants = normalizeCodeVariants(cleanCode);

  // 1. If Supabase is connected, query live database first
  if (isSupabaseConfigured) {
    try {
      // Fetch team by code (or common mistyped variant)
      let teamData: any = null;
      for (const v of variants) {
        const { data } = await supabase
          .from('teams')
          .select('*')
          .ilike('team_code', v)
          .maybeSingle();

        if (data) {
          teamData = data;
          break;
        }
      }

      if (teamData) {
        const team = teamData as Team;

        if (team.status === 'ELIMINATED') {
          return { success: false, error: 'This team has been eliminated from the competition.' };
        }

        if (team.status === 'DISABLED') {
          return { success: false, error: 'This team account is disabled.' };
        }

        // Strict PIN Verification: must match the team's pin_hash
        if (!team.pin_hash || team.pin_hash.trim() !== cleanPin) {
          return { success: false, error: 'Incorrect Team PIN. Please check your credentials.' };
        }

        // Verify / Find Member Name
        const { data: members } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', team.id)
          .eq('is_active', true);

        let matchedMember = (members || []).find(
          (m: TeamMember) =>
            m.normalized_name === normName ||
            normalizeName(m.full_name) === normName ||
            m.full_name.toLowerCase().trim() === rawName.toLowerCase().trim()
        );

        if (!matchedMember) {
          // Exactly one trader per team: If team already has a designated trader, new member is an Analyst (is_trader: false)
          const hasExistingTrader = (members || []).some((m: TeamMember) => m.is_trader);
          const shouldBeTrader = !hasExistingTrader;

          const { data: newMem } = await supabase
            .from('team_members')
            .insert({
              team_id: team.id,
              full_name: rawName.trim(),
              normalized_name: normName,
              is_trader: shouldBeTrader,
              is_active: true,
            })
            .select('*')
            .maybeSingle();
          matchedMember = newMem;
        }

        // Fetch Event
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
            is_trader: !(members || []).some((m: TeamMember) => m.is_trader),
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

  // 2. Local / Mock DB Verification (Exact & variant match)
  const db = getMockDB();
  let team: Team | null = null;
  for (const v of variants) {
    const found = db.teams.find((t) => t.team_code.trim().toUpperCase() === v);
    if (found) {
      team = found;
      break;
    }
  }

  // If team does NOT exist in the database, reject immediately!
  if (!team) {
    return {
      success: false,
      error: 'Invalid Team Code. No registered team found with this code. Please check with event administrators.',
    };
  }

  if (team.status === 'ELIMINATED') {
    return { success: false, error: 'This team has been eliminated from the competition.' };
  }

  if (team.status === 'DISABLED') {
    return { success: false, error: 'This team account is disabled.' };
  }

  // Strict PIN Verification: must match the team's pin_hash
  if (!team.pin_hash || team.pin_hash.trim() !== cleanPin) {
    return { success: false, error: 'Incorrect Team PIN. Please check your 4-digit PIN.' };
  }

  const members = db.teamMembers.filter((m) => m.team_id === team.id && m.is_active);
  let matchedMember = members.find(
    (m) =>
      m.normalized_name === normName ||
      normalizeName(m.full_name) === normName ||
      m.full_name.toLowerCase().trim() === rawName.toLowerCase().trim()
  );

  // If member name isn't registered in team roster, register under this verified team
  if (!matchedMember) {
    const hasExistingTrader = members.some((m) => m.is_trader);
    const newMember: TeamMember = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      team_id: team.id,
      full_name: rawName.trim(),
      normalized_name: normName,
      is_active: true,
      is_trader: !hasExistingTrader,
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

export async function transferTraderRole(
  teamId: string,
  targetMemberId: string,
  pin: string
): Promise<{ success: boolean; error?: string }> {
  const cleanPin = pin.trim();
  const db = getMockDB();
  const team = db.teams.find((t) => t.id === teamId);

  if (team && team.pin_hash && team.pin_hash.trim() !== cleanPin) {
    return { success: false, error: 'Incorrect Team PIN. Verification failed.' };
  }

  // Update local DB
  db.teamMembers.forEach((m) => {
    if (m.team_id === teamId) {
      m.is_trader = m.id === targetMemberId;
    }
  });
  saveMockDB(db);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('team_members').update({ is_trader: false }).eq('team_id', teamId);
      await supabase.from('team_members').update({ is_trader: true }).eq('id', targetMemberId);
    } catch (err) {
      console.error('Error transferring trader role on Supabase:', err);
    }
  }

  return { success: true };
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
          .maybeSingle();

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
