// ====================================================================
// METIS TypeScript Type Definitions
// ====================================================================

export type EventStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED';
export type MarketStatus = 'OPEN' | 'PAUSED' | 'CLOSED' | 'FROZEN';
export type TeamStatus = 'ACTIVE' | 'DISABLED' | 'ELIMINATED';
export type TradeSide = 'BUY' | 'SELL';
export type UserRole = 'admin' | 'participant';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  name: string;
  description: string | null;
  round_name: string;
  status: EventStatus;
  starting_capital: number;
  qualification_count: number;
  is_leaderboard_visible?: boolean;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface Team {
  id: string;
  event_id: string;
  name: string;
  team_code: string;
  pin_hash: string;
  cash_balance: number;
  starting_wealth: number;
  status: TeamStatus;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  full_name: string;
  normalized_name: string;
  is_active: boolean;
  is_trader: boolean;
  created_at: string;
}

export interface ParticipantSession {
  id: string;
  event_id: string;
  team_id: string;
  team_member_id: string;
  session_token_hash: string;
  created_at: string;
  expires_at: string;
  last_seen_at: string;
  revoked_at: string | null;
}

export interface ParticipantAuthData {
  team: Team;
  member: TeamMember;
  sessionToken: string;
  event: Event;
}

export interface Stock {
  id: string;
  event_id: string;
  symbol: string;
  company_name: string;
  sector: string;
  starting_price: number;
  current_price: number;
  opening_price: number;
  high_price: number;
  low_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockPriceHistory {
  id: string;
  stock_id: string;
  old_price: number;
  new_price: number;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

export interface Holding {
  id: string;
  team_id: string;
  stock_id: string;
  quantity: number;
  average_cost: number;
  realized_pnl: number;
  updated_at: string;
  // Joined fields
  stock?: Stock;
}

export interface Trade {
  id: string;
  event_id: string;
  team_id: string;
  team_member_id: string | null;
  stock_id: string;
  side: TradeSide;
  quantity: number;
  price: number;
  total_value: number;
  created_at: string;
  // Joined fields
  stock?: Stock;
  team?: Team;
  team_member?: TeamMember;
}

export interface MarketSession {
  id: string;
  event_id: string;
  status: MarketStatus;
  started_at: string;
  ends_at: string | null;
  started_by: string | null;
  ended_by: string | null;
  created_at: string;
}

export interface NewsItem {
  id: string;
  event_id: string;
  headline: string;
  body: string;
  sector: string | null;
  published_by: string | null;
  published_at: string;
  is_published: boolean;
}

export interface CashAdjustment {
  id: string;
  event_id: string;
  team_id: string;
  admin_id: string | null;
  amount: number;
  previous_balance: number;
  new_balance: number;
  reason: string;
  created_at: string;
  team?: Team;
}

export interface Elimination {
  id: string;
  event_id: string;
  team_id: string;
  admin_id: string | null;
  reason: string | null;
  created_at: string;
  team?: Team;
}

export interface AuditLog {
  id: string;
  event_id: string;
  actor_type: 'ADMIN' | 'PARTICIPANT' | 'SYSTEM';
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface LeaderboardEntry {
  team_id: string;
  team_name: string;
  team_status: TeamStatus;
  cash_balance: number;
  portfolio_value: number;
  total_wealth: number;
  starting_wealth: number;
  today_pnl: number;
  today_pnl_pct: number;
  rank: number;
}

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  realized_pnl: number;
  total_pnl: number;
  total_wealth: number;
  cash_balance: number;
  today_pnl: number;
  today_pnl_pct: number;
}
