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

const STORAGE_KEY = 'metis_mock_database_v2';

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
  teams: [
    {
      id: 't1111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      name: 'Alpha',
      team_code: 'ALPHA-7K29',
      pin_hash: '4821',
      cash_balance: 42000000, // ₹4.20 Cr
      starting_wealth: 100000000,
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 't2222222-2222-2222-2222-222222222222',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      name: 'Bulls',
      team_code: 'BULLS-9X12',
      pin_hash: '4821',
      cash_balance: 92400000, // ₹9.24 Cr
      starting_wealth: 100000000,
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 't3333333-3333-3333-3333-333333333333',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      name: 'Titans',
      team_code: 'TITAN-4M88',
      pin_hash: '4821',
      cash_balance: 89100000,
      starting_wealth: 100000000,
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 't4444444-4444-4444-4444-444444444444',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      name: 'Phoenix',
      team_code: 'PHX-8V71',
      pin_hash: '4821',
      cash_balance: 78800000,
      starting_wealth: 100000000,
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 't5555555-5555-5555-5555-555555555555',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      name: 'Nova',
      team_code: 'NOVA-3B45',
      pin_hash: '4821',
      cash_balance: 64400000,
      starting_wealth: 100000000,
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  teamMembers: [
    {
      id: 'm1111111-1111-1111-1111-111111111111',
      team_id: 't1111111-1111-1111-1111-111111111111',
      full_name: 'Mohammed Maaz',
      normalized_name: 'mohammed maaz',
      is_active: true,
      is_trader: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'm1111111-1111-1111-1111-111111111112',
      team_id: 't1111111-1111-1111-1111-111111111111',
      full_name: 'Rahul Kumar',
      normalized_name: 'rahul kumar',
      is_active: true,
      is_trader: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'm1111111-1111-1111-1111-111111111113',
      team_id: 't1111111-1111-1111-1111-111111111111',
      full_name: 'Arjun Rao',
      normalized_name: 'arjun rao',
      is_active: true,
      is_trader: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'm1111111-1111-1111-1111-111111111114',
      team_id: 't1111111-1111-1111-1111-111111111111',
      full_name: 'Zaid Ahmed',
      normalized_name: 'zaid ahmed',
      is_active: true,
      is_trader: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'm2222222-2222-2222-2222-222222222221',
      team_id: 't2222222-2222-2222-2222-222222222222',
      full_name: 'Rohan Sharma',
      normalized_name: 'rohan sharma',
      is_active: true,
      is_trader: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'm3333333-3333-3333-3333-333333333331',
      team_id: 't3333333-3333-3333-3333-333333333333',
      full_name: 'Aditya Varma',
      normalized_name: 'aditya varma',
      is_active: true,
      is_trader: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'm4444444-4444-4444-4444-444444444441',
      team_id: 't4444444-4444-4444-4444-444444444444',
      full_name: 'Varun Chopra',
      normalized_name: 'varun chopra',
      is_active: true,
      is_trader: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'm5555555-5555-5555-5555-555555555551',
      team_id: 't5555555-5555-5555-5555-555555555555',
      full_name: 'Karan Malhotra',
      normalized_name: 'karan malhotra',
      is_active: true,
      is_trader: true,
      created_at: new Date().toISOString(),
    }
  ],
  stocks: [
    {
      id: 's1111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'NOVA',
      company_name: 'Nova Electric Mobility Ltd',
      sector: 'EV & Auto',
      starting_price: 120,
      current_price: 145.20,
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
      current_price: 92.35,
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
      symbol: 'GREENX',
      company_name: 'GreenX Clean Energy Corp',
      sector: 'Renewable Energy',
      starting_price: 170,
      current_price: 184.60,
      opening_price: 170,
      high_price: 192,
      low_price: 168,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 's4444444-4444-4444-4444-444444444444',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      symbol: 'MEDIX',
      company_name: 'Medix Global Healthcare',
      sector: 'Pharma & Biotech',
      starting_price: 210,
      current_price: 235.80,
      opening_price: 210,
      high_price: 240,
      low_price: 208,
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
      current_price: 298.10,
      opening_price: 310,
      high_price: 315,
      low_price: 292,
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
      started_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 45 * 60000).toISOString(),
      started_by: null,
      ended_by: null,
      created_at: new Date().toISOString(),
    }
  ],
  news: [
    {
      id: 'n1111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      headline: 'EV Sector Sees Major Growth',
      body: 'Government announces major incentives for electric vehicle manufacturers.',
      sector: 'EV & Auto',
      published_by: null,
      published_at: new Date(Date.now() - 8 * 60000).toISOString(),
      is_published: true,
    },
    {
      id: 'n2222222-2222-2222-2222-222222222222',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      headline: 'Central Bank Hints at Possible Rate Adjustments',
      body: 'Surging quarterly inflation data signals liquidity adjustments across leading lenders.',
      sector: 'Banking & Finance',
      published_by: null,
      published_at: new Date(Date.now() - 15 * 60000).toISOString(),
      is_published: true,
    }
  ],
  holdings: [
    {
      id: 'h1111111-1111-1111-1111-111111111111',
      team_id: 't1111111-1111-1111-1111-111111111111', // Alpha
      stock_id: 's1111111-1111-1111-1111-111111111111', // NOVA
      quantity: 50000,
      average_cost: 110,
      realized_pnl: 4400000,
      updated_at: new Date().toISOString(),
    },
    {
      id: 'h1111111-1111-1111-1111-111111111112',
      team_id: 't1111111-1111-1111-1111-111111111111', // Alpha
      stock_id: 's3333333-3333-3333-3333-333333333333', // GREENX
      quantity: 38000,
      average_cost: 172,
      realized_pnl: 0,
      updated_at: new Date().toISOString(),
    }
  ],
  trades: [
    {
      id: 'tr111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      team_id: 't1111111-1111-1111-1111-111111111111',
      team_member_id: 'm1111111-1111-1111-1111-111111111111',
      stock_id: 's1111111-1111-1111-1111-111111111111',
      side: 'BUY',
      quantity: 50000,
      price: 110,
      total_value: 5500000,
      created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    }
  ],
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
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as MockDatabase;
      // Ensure seed teams exist
      const existingCodes = new Set(parsed.teams.map((t) => t.team_code));
      let updated = false;
      INITIAL_MOCK_DATA.teams.forEach((t) => {
        if (!existingCodes.has(t.team_code)) {
          parsed.teams.push(t);
          updated = true;
        }
      });
      if (updated) {
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

export function saveMockDB(db: MockDatabase): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent('metis_db_update'));
}
