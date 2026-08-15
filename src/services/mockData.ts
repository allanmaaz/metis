import { Event, Team, TeamMember, Stock, MarketSession, NewsItem, Holding, Trade, AuditLog } from '../types';

export interface MockDatabase {
  events: Event[];
  teams: Team[];
  teamMembers: TeamMember[];
  stocks: Stock[];
  marketSessions: MarketSession[];
  news: NewsItem[];
  holdings: Holding[];
  trades: Trade[];
  auditLogs: AuditLog[];
}

const STORAGE_KEY = 'metis_mock_database_v7';

export const INITIAL_MOCK_DATA: MockDatabase = {
  events: [
    {
      id: 'e1111111-1111-1111-1111-111111111111',
      name: 'METIS 2026',
      description: 'The Strategic Market Challenge — Live Virtual Stock Trading Arena',
      round_name: 'Round 2 — Virtual Market',
      status: 'ACTIVE',
      starting_capital: 100000000,
      qualification_count: 5,
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      ended_at: null,
    }
  ],
  teams: [],
  teamMembers: [],
  stocks: [
    {
      id: 's1111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'NOVA',
      company_name: 'Nova BioTech Corp',
      sector: 'Pharmaceuticals',
      starting_price: 180,
      current_price: 198,
      opening_price: 180,
      high_price: 204,
      low_price: 175,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 's2222222-2222-2222-2222-222222222222',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'AERO',
      company_name: 'AeroDynamics Global',
      sector: 'Aerospace & Defense',
      starting_price: 350,
      current_price: 345,
      opening_price: 350,
      high_price: 358,
      low_price: 338,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 's3333333-3333-3333-3333-333333333333',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'GREENX',
      company_name: 'GreenX Renewables Ltd',
      sector: 'Clean Energy',
      starting_price: 165,
      current_price: 172,
      opening_price: 165,
      high_price: 178,
      low_price: 162,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 's4444444-4444-4444-4444-444444444444',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'FINEX',
      company_name: 'FinEx Core Banking',
      sector: 'Banking & Finance',
      starting_price: 535,
      current_price: 520,
      opening_price: 535,
      high_price: 540,
      low_price: 512,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 's5555555-5555-5555-5555-555555555555',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'KINETIC',
      company_name: 'Kinetic EV Mobility',
      sector: 'Automotive & Tech',
      starting_price: 275,
      current_price: 280,
      opening_price: 275,
      high_price: 292,
      low_price: 270,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  marketSessions: [
    {
      id: 'ms111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      status: 'OPEN',
      started_at: new Date(Date.now() - 600000).toISOString(),
      ends_at: new Date(Date.now() + 1200000).toISOString(),
      started_by: null,
      ended_by: null,
      created_at: new Date().toISOString(),
    }
  ],
  news: [],
  holdings: [],
  trades: [],
  auditLogs: [
    {
      id: 'al111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      actor_type: 'SYSTEM',
      actor_id: null,
      action: 'EVENT_INIT',
      entity_type: 'EVENT',
      entity_id: 'e1111111-1111-1111-1111-111111111111',
      old_value: null,
      new_value: { name: 'METIS 2026' },
      reason: 'Event initialized',
      metadata: null,
      created_at: new Date().toISOString(),
    }
  ]
};

export function getMockDB(): MockDatabase {
  // Clean up legacy keys if present
  try {
    localStorage.removeItem('metis_mock_database_v1');
    localStorage.removeItem('metis_mock_database_v2');
    localStorage.removeItem('metis_mock_database_v3');
    localStorage.removeItem('metis_mock_database_v4');
    localStorage.removeItem('metis_mock_database_v5');
    localStorage.removeItem('metis_mock_database_v6');
  } catch {}

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as MockDatabase;
      return parsed;
    } catch {
      // ignore
    }
  }
  saveMockDB(INITIAL_MOCK_DATA);
  return INITIAL_MOCK_DATA;
}

export function saveMockDB(db: MockDatabase): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent('metis_db_update'));
}
