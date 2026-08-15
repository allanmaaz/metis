-- ====================================================================
-- METIS Virtual Stock Market Platform - Full Database Schema
-- Run this in Supabase SQL Editor to set up the complete database
-- ====================================================================

-- 1. Enable pgcrypto for UUIDs and hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean up if needed (for fresh setup)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS eliminations CASCADE;
DROP TABLE IF EXISTS cash_adjustments CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS market_sessions CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS holdings CASCADE;
DROP TABLE IF EXISTS stock_price_history CASCADE;
DROP TABLE IF EXISTS stocks CASCADE;
DROP TABLE IF EXISTS participant_sessions CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS event_admins CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Create Tables

-- PROFILES (Admin users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'participant', -- 'admin' | 'participant'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EVENTS
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    round_name TEXT DEFAULT 'Round 2 — Virtual Market',
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'UPCOMING' | 'ACTIVE' | 'ENDED'
    starting_capital NUMERIC NOT NULL DEFAULT 100000000, -- ₹10 Cr default (in Rupees)
    qualification_count INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ
);

-- EVENT ADMINS
CREATE TABLE event_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(event_id, admin_id)
);

-- TEAMS
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    team_code TEXT UNIQUE NOT NULL,
    pin_hash TEXT NOT NULL,
    cash_balance NUMERIC NOT NULL DEFAULT 100000000,
    starting_wealth NUMERIC NOT NULL DEFAULT 100000000,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'DISABLED' | 'ELIMINATED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TEAM MEMBERS
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_trader BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PARTICIPANT SESSIONS
CREATE TABLE participant_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ
);

-- STOCKS
CREATE TABLE stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    company_name TEXT NOT NULL,
    sector TEXT NOT NULL,
    starting_price NUMERIC NOT NULL,
    current_price NUMERIC NOT NULL,
    opening_price NUMERIC NOT NULL,
    high_price NUMERIC NOT NULL,
    low_price NUMERIC NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(event_id, symbol)
);

-- STOCK PRICE HISTORY
CREATE TABLE stock_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    old_price NUMERIC NOT NULL,
    new_price NUMERIC NOT NULL,
    changed_by UUID,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HOLDINGS
CREATE TABLE holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    quantity BIGINT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    average_cost NUMERIC NOT NULL DEFAULT 0,
    realized_pnl NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(team_id, stock_id)
);

-- TRADES
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity BIGINT NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL CHECK (price > 0),
    total_value NUMERIC NOT NULL CHECK (total_value > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MARKET SESSIONS
CREATE TABLE market_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PAUSED', 'CLOSED', 'FROZEN')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ,
    started_by UUID,
    ended_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NEWS
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    body TEXT NOT NULL,
    sector TEXT,
    published_by UUID,
    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_published BOOLEAN NOT NULL DEFAULT true
);

-- CASH ADJUSTMENTS
CREATE TABLE cash_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    admin_id UUID,
    amount NUMERIC NOT NULL,
    previous_balance NUMERIC NOT NULL,
    new_balance NUMERIC NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ELIMINATIONS
CREATE TABLE eliminations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    admin_id UUID,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AUDIT LOGS (Append-Only)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('ADMIN', 'PARTICIPANT', 'SYSTEM')),
    actor_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Indexes for Performance
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_teams_event ON teams(event_id);
CREATE INDEX idx_teams_code ON teams(team_code);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_normalized_name ON team_members(normalized_name);
CREATE INDEX idx_participant_sessions_token ON participant_sessions(session_token_hash);
CREATE INDEX idx_stocks_event ON stocks(event_id);
CREATE INDEX idx_holdings_team ON holdings(team_id);
CREATE INDEX idx_holdings_stock ON holdings(stock_id);
CREATE INDEX idx_trades_team ON trades(team_id);
CREATE INDEX idx_trades_event_created ON trades(event_id, created_at DESC);
CREATE INDEX idx_stock_history_stock ON stock_price_history(stock_id);
CREATE INDEX idx_news_event_pub ON news(event_id, published_at DESC);
CREATE INDEX idx_audit_logs_event ON audit_logs(event_id, created_at DESC);

-- 5. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_teams
BEFORE UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_stocks
BEFORE UPDATE ON stocks
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_holdings
BEFORE UPDATE ON holdings
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- 6. Prevent updates or deletes on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- 7. Enable Realtime Replication for core tables
ALTER PUBLICATION supabase_realtime ADD TABLE stocks;
ALTER PUBLICATION supabase_realtime ADD TABLE market_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE news;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE holdings;
ALTER PUBLICATION supabase_realtime ADD TABLE trades;
