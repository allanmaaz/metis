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

const STORAGE_KEY = 'metis_mock_database_v10';

export function getMockDB(): MockDatabase {
  // Clean up legacy keys if present
  try {
    for (let i = 1; i <= 9; i++) {
      localStorage.removeItem(`metis_mock_database_v${i}`);
    }
  } catch {}

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as MockDatabase;
      // Auto-heal: If legacy mock stocks like CYBER or FINTECH are in storage, reset stocks to canonical list
      const hasLegacyStocks = parsed.stocks?.some((s) => s.symbol === 'CYBER' || s.symbol === 'FINTECH' || s.symbol === 'AERO');
      if (hasLegacyStocks || !parsed.stocks || parsed.stocks.length === 0) {
        parsed.stocks = INITIAL_MOCK_DATA.stocks;
        saveMockDB(parsed);
      }
      return parsed;
    } catch {
      // ignore
    }
  }
  saveMockDB(INITIAL_MOCK_DATA);
  return INITIAL_MOCK_DATA;
}

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
      id: 's_tcs',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'TCS',
      company_name: 'Tata Consultancy Services',
      sector: 'IT & Tech',
      starting_price: 3850,
      current_price: 3850,
      opening_price: 3850,
      high_price: 3850,
      low_price: 3850,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 's1111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'NOVA',
      company_name: 'Nova Electric Mobility Ltd',
      sector: 'EV & Auto',
      starting_price: 120,
      current_price: 145,
      opening_price: 120,
      high_price: 150,
      low_price: 118,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 's2222222-2222-2222-2222-222222222222',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'FINEDGE',
      company_name: 'FinEdge Capital & Banking',
      sector: 'Banking & Finance',
      starting_price: 95,
      current_price: 92,
      opening_price: 95,
      high_price: 98,
      low_price: 89,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 's3333333-3333-3333-3333-333333333333',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'MEDIX',
      company_name: 'Medix Global Healthcare',
      sector: 'Pharma & Biotech',
      starting_price: 210,
      current_price: 235,
      opening_price: 210,
      high_price: 240,
      low_price: 208,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 's4444444-4444-4444-4444-444444444444',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'GREENX',
      company_name: 'GreenX Clean Energy Corp',
      sector: 'Renewable Energy',
      starting_price: 170,
      current_price: 184,
      opening_price: 170,
      high_price: 192,
      low_price: 168,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 's5555555-5555-5555-5555-555555555555',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'FOODCO',
      company_name: 'FoodCo Consumer Essentials',
      sector: 'FMCG & Retail',
      starting_price: 310,
      current_price: 298,
      opening_price: 310,
      high_price: 315,
      low_price: 292,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  marketSessions: [
    {
      id: 'ms111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      status: 'CLOSED',
      started_at: new Date().toISOString(),
      ends_at: null,
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



export function saveMockDB(db: MockDatabase): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent('metis_db_update'));
}
