-- ======================================================================================
-- METIS — THE STRATEGIC MARKET CHALLENGE
-- Complete Database Setup Script for Supabase SQL Editor
-- (Copy and Paste this entire script into your Supabase SQL Editor and click RUN)
-- ======================================================================================

-- 1. Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean up old tables if re-running
DROP TRIGGER IF EXISTS audit_log_immutable ON audit_logs CASCADE;
DROP TRIGGER IF EXISTS set_timestamp_holdings ON holdings CASCADE;
DROP TRIGGER IF EXISTS set_timestamp_stocks ON stocks CASCADE;
DROP TRIGGER IF EXISTS set_timestamp_teams ON teams CASCADE;

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

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'participant',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    round_name TEXT DEFAULT 'Round 2 — Virtual Market',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    starting_capital NUMERIC NOT NULL DEFAULT 100000000,
    qualification_count INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE event_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(event_id, admin_id)
);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    team_code TEXT UNIQUE NOT NULL,
    pin_hash TEXT NOT NULL,
    cash_balance NUMERIC NOT NULL DEFAULT 100000000,
    starting_wealth NUMERIC NOT NULL DEFAULT 100000000,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_trader BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE stock_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    old_price NUMERIC NOT NULL,
    new_price NUMERIC NOT NULL,
    changed_by UUID,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE eliminations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    admin_id UUID,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- 4. Indexes
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

-- 5. Triggers
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_teams BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_stocks BEFORE UPDATE ON stocks FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_holdings BEFORE UPDATE ON holdings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_immutable BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- 6. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE stocks;
ALTER PUBLICATION supabase_realtime ADD TABLE market_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE news;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE holdings;
ALTER PUBLICATION supabase_realtime ADD TABLE trades;

-- 7. Functions and RPCs

-- BUY FUNCTION
CREATE OR REPLACE FUNCTION execute_buy(
    p_team_id UUID,
    p_stock_id UUID,
    p_quantity BIGINT,
    p_member_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_event_id UUID;
    v_event_status TEXT;
    v_market_status TEXT;
    v_market_ends_at TIMESTAMPTZ;
    v_team_status TEXT;
    v_stock_symbol TEXT;
    v_stock_price NUMERIC;
    v_stock_active BOOLEAN;
    v_team_cash NUMERIC;
    v_total_cost NUMERIC;
    v_existing_qty BIGINT := 0;
    v_existing_avg NUMERIC := 0;
    v_new_qty BIGINT;
    v_new_avg NUMERIC;
    v_trade_id UUID;
BEGIN
    IF p_quantity <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Quantity must be greater than zero.');
    END IF;

    SELECT event_id, symbol, current_price, is_active 
    INTO v_event_id, v_stock_symbol, v_stock_price, v_stock_active
    FROM stocks WHERE id = p_stock_id;

    IF NOT FOUND OR NOT v_stock_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'Stock is inactive or not found.');
    END IF;

    SELECT status INTO v_event_status FROM events WHERE id = v_event_id;
    IF v_event_status != 'ACTIVE' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Event is not active.');
    END IF;

    SELECT status, ends_at INTO v_market_status, v_market_ends_at
    FROM market_sessions 
    WHERE event_id = v_event_id 
    ORDER BY created_at DESC LIMIT 1;

    IF v_market_status IS NULL OR v_market_status != 'OPEN' THEN
        RETURN jsonb_build_object('success', false, 'error', 'The market is currently ' || COALESCE(v_market_status, 'CLOSED') || '. Trading is unavailable.');
    END IF;

    IF v_market_ends_at IS NOT NULL AND NOW() > v_market_ends_at THEN
        RETURN jsonb_build_object('success', false, 'error', 'Market session has expired.');
    END IF;

    SELECT status, cash_balance INTO v_team_status, v_team_cash
    FROM teams 
    WHERE id = p_team_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Team not found.');
    END IF;

    IF v_team_status = 'ELIMINATED' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This team has been eliminated from the competition.');
    ELSIF v_team_status != 'ACTIVE' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Team trading is currently disabled.');
    END IF;

    v_total_cost := p_quantity * v_stock_price;
    IF v_team_cash < v_total_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient cash balance. Required: ₹' || v_total_cost || ', Available: ₹' || v_team_cash);
    END IF;

    UPDATE teams 
    SET cash_balance = cash_balance - v_total_cost, updated_at = NOW() 
    WHERE id = p_team_id;

    SELECT quantity, average_cost INTO v_existing_qty, v_existing_avg
    FROM holdings
    WHERE team_id = p_team_id AND stock_id = p_stock_id
    FOR UPDATE;

    IF FOUND THEN
        v_new_qty := v_existing_qty + p_quantity;
        v_new_avg := ((v_existing_qty * v_existing_avg) + (p_quantity * v_stock_price)) / v_new_qty;
        
        UPDATE holdings 
        SET quantity = v_new_qty, average_cost = v_new_avg, updated_at = NOW()
        WHERE team_id = p_team_id AND stock_id = p_stock_id;
    ELSE
        v_new_qty := p_quantity;
        v_new_avg := v_stock_price;
        
        INSERT INTO holdings (team_id, stock_id, quantity, average_cost, realized_pnl)
        VALUES (p_team_id, p_stock_id, v_new_qty, v_new_avg, 0);
    END IF;

    INSERT INTO trades (event_id, team_id, team_member_id, stock_id, side, quantity, price, total_value)
    VALUES (v_event_id, p_team_id, p_member_id, p_stock_id, 'BUY', p_quantity, v_stock_price, v_total_cost)
    RETURNING id INTO v_trade_id;

    INSERT INTO audit_logs (event_id, actor_type, actor_id, action, entity_type, entity_id, old_value, new_value, reason)
    VALUES (
        v_event_id, 
        'PARTICIPANT', 
        p_team_id, 
        'BUY', 
        'HOLDING', 
        p_stock_id,
        jsonb_build_object('quantity', v_existing_qty, 'cash_balance', v_team_cash),
        jsonb_build_object('quantity', v_new_qty, 'cash_balance', v_team_cash - v_total_cost, 'stock', v_stock_symbol, 'price', v_stock_price),
        'Executed BUY trade ' || p_quantity || ' of ' || v_stock_symbol || ' @ ₹' || v_stock_price
    );

    RETURN jsonb_build_object(
        'success', true,
        'trade_id', v_trade_id,
        'stock', v_stock_symbol,
        'quantity', p_quantity,
        'price', v_stock_price,
        'total_cost', v_total_cost,
        'remaining_cash', v_team_cash - v_total_cost,
        'new_holdings_quantity', v_new_qty,
        'new_average_cost', v_new_avg
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- SELL FUNCTION
CREATE OR REPLACE FUNCTION execute_sell(
    p_team_id UUID,
    p_stock_id UUID,
    p_quantity BIGINT,
    p_member_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_event_id UUID;
    v_event_status TEXT;
    v_market_status TEXT;
    v_market_ends_at TIMESTAMPTZ;
    v_team_status TEXT;
    v_stock_symbol TEXT;
    v_stock_price NUMERIC;
    v_stock_active BOOLEAN;
    v_existing_qty BIGINT;
    v_existing_avg NUMERIC;
    v_existing_pnl NUMERIC;
    v_proceeds NUMERIC;
    v_profit NUMERIC;
    v_new_qty BIGINT;
    v_team_cash NUMERIC;
    v_trade_id UUID;
BEGIN
    IF p_quantity <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Quantity must be greater than zero.');
    END IF;

    SELECT event_id, symbol, current_price, is_active 
    INTO v_event_id, v_stock_symbol, v_stock_price, v_stock_active
    FROM stocks WHERE id = p_stock_id;

    IF NOT FOUND OR NOT v_stock_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'Stock is inactive or not found.');
    END IF;

    SELECT status INTO v_event_status FROM events WHERE id = v_event_id;
    IF v_event_status != 'ACTIVE' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Event is not active.');
    END IF;

    SELECT status, ends_at INTO v_market_status, v_market_ends_at
    FROM market_sessions 
    WHERE event_id = v_event_id 
    ORDER BY created_at DESC LIMIT 1;

    IF v_market_status IS NULL OR v_market_status != 'OPEN' THEN
        RETURN jsonb_build_object('success', false, 'error', 'The market is currently ' || COALESCE(v_market_status, 'CLOSED') || '. Trading is unavailable.');
    END IF;

    IF v_market_ends_at IS NOT NULL AND NOW() > v_market_ends_at THEN
        RETURN jsonb_build_object('success', false, 'error', 'Market session has expired.');
    END IF;

    SELECT status, cash_balance INTO v_team_status, v_team_cash
    FROM teams 
    WHERE id = p_team_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Team not found.');
    END IF;

    IF v_team_status = 'ELIMINATED' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This team has been eliminated from the competition.');
    ELSIF v_team_status != 'ACTIVE' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Team trading is currently disabled.');
    END IF;

    SELECT quantity, average_cost, realized_pnl 
    INTO v_existing_qty, v_existing_avg, v_existing_pnl
    FROM holdings
    WHERE team_id = p_team_id AND stock_id = p_stock_id
    FOR UPDATE;

    IF NOT FOUND OR v_existing_qty < p_quantity THEN
        RETURN jsonb_build_object('success', false, 'error', 'You do not own enough shares. Owned: ' || COALESCE(v_existing_qty, 0) || ', Requested: ' || p_quantity);
    END IF;

    v_proceeds := p_quantity * v_stock_price;
    v_profit := (v_stock_price - v_existing_avg) * p_quantity;
    v_new_qty := v_existing_qty - p_quantity;

    UPDATE holdings 
    SET quantity = v_new_qty, 
        realized_pnl = v_existing_pnl + v_profit,
        updated_at = NOW()
    WHERE team_id = p_team_id AND stock_id = p_stock_id;

    UPDATE teams 
    SET cash_balance = cash_balance + v_proceeds, updated_at = NOW()
    WHERE id = p_team_id;

    INSERT INTO trades (event_id, team_id, team_member_id, stock_id, side, quantity, price, total_value)
    VALUES (v_event_id, p_team_id, p_member_id, p_stock_id, 'SELL', p_quantity, v_stock_price, v_proceeds)
    RETURNING id INTO v_trade_id;

    INSERT INTO audit_logs (event_id, actor_type, actor_id, action, entity_type, entity_id, old_value, new_value, reason)
    VALUES (
        v_event_id, 
        'PARTICIPANT', 
        p_team_id, 
        'SELL', 
        'HOLDING', 
        p_stock_id,
        jsonb_build_object('quantity', v_existing_qty, 'cash_balance', v_team_cash),
        jsonb_build_object('quantity', v_new_qty, 'cash_balance', v_team_cash + v_proceeds, 'stock', v_stock_symbol, 'price', v_stock_price, 'profit', v_profit),
        'Executed SELL trade ' || p_quantity || ' of ' || v_stock_symbol || ' @ ₹' || v_stock_price
    );

    RETURN jsonb_build_object(
        'success', true,
        'trade_id', v_trade_id,
        'stock', v_stock_symbol,
        'quantity', p_quantity,
        'price', v_stock_price,
        'proceeds', v_proceeds,
        'realized_profit', v_profit,
        'remaining_cash', v_team_cash + v_proceeds,
        'remaining_quantity', v_new_qty
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- UPDATE STOCK PRICE FUNCTION
CREATE OR REPLACE FUNCTION update_stock_price(
    p_stock_id UUID,
    p_new_price NUMERIC,
    p_reason TEXT DEFAULT 'Market movement',
    p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_event_id UUID;
    v_symbol TEXT;
    v_old_price NUMERIC;
    v_high NUMERIC;
    v_low NUMERIC;
BEGIN
    IF p_new_price <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Stock price must be greater than 0');
    END IF;

    SELECT event_id, symbol, current_price, high_price, low_price
    INTO v_event_id, v_symbol, v_old_price, v_high, v_low
    FROM stocks
    WHERE id = p_stock_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Stock not found');
    END IF;

    v_high := GREATEST(v_high, p_new_price);
    v_low := LEAST(v_low, p_new_price);

    UPDATE stocks
    SET current_price = p_new_price,
        high_price = v_high,
        low_price = v_low,
        updated_at = NOW()
    WHERE id = p_stock_id;

    INSERT INTO stock_price_history (stock_id, old_price, new_price, changed_by, reason)
    VALUES (p_stock_id, v_old_price, p_new_price, p_admin_id, p_reason);

    INSERT INTO audit_logs (event_id, actor_type, actor_id, action, entity_type, entity_id, old_value, new_value, reason)
    VALUES (
        v_event_id,
        'ADMIN',
        p_admin_id,
        'PRICE_CHANGE',
        'STOCK',
        p_stock_id,
        jsonb_build_object('price', v_old_price, 'symbol', v_symbol),
        jsonb_build_object('price', p_new_price, 'symbol', v_symbol, 'high', v_high, 'low', v_low),
        p_reason
    );

    RETURN jsonb_build_object(
        'success', true,
        'symbol', v_symbol,
        'old_price', v_old_price,
        'new_price', p_new_price,
        'high_price', v_high,
        'low_price', v_low
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- SET MARKET STATUS FUNCTION
CREATE OR REPLACE FUNCTION set_market_status(
    p_event_id UUID,
    p_status TEXT,
    p_duration_minutes INTEGER DEFAULT NULL,
    p_admin_id UUID DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_ends_at TIMESTAMPTZ := NULL;
    v_session_id UUID;
BEGIN
    IF p_status NOT IN ('OPEN', 'PAUSED', 'CLOSED', 'FROZEN') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid market status');
    END IF;

    IF p_status = 'OPEN' AND p_duration_minutes IS NOT NULL AND p_duration_minutes > 0 THEN
        v_ends_at := NOW() + (p_duration_minutes || ' minutes')::INTERVAL;
    END IF;

    IF p_status = 'OPEN' THEN
        UPDATE teams t
        SET starting_wealth = t.cash_balance + COALESCE((
            SELECT SUM(h.quantity * s.current_price)
            FROM holdings h
            JOIN stocks s ON h.stock_id = s.id
            WHERE h.team_id = t.id
        ), 0)
        WHERE t.event_id = p_event_id;
    END IF;

    INSERT INTO market_sessions (event_id, status, started_at, ends_at, started_by)
    VALUES (p_event_id, p_status, NOW(), v_ends_at, p_admin_id)
    RETURNING id INTO v_session_id;

    INSERT INTO audit_logs (event_id, actor_type, actor_id, action, entity_type, entity_id, new_value, reason)
    VALUES (
        p_event_id,
        'ADMIN',
        p_admin_id,
        'MARKET_STATUS_' || p_status,
        'MARKET',
        v_session_id,
        jsonb_build_object('status', p_status, 'ends_at', v_ends_at, 'duration_minutes', p_duration_minutes),
        COALESCE(p_reason, 'Admin changed market state to ' || p_status)
    );

    RETURN jsonb_build_object(
        'success', true,
        'session_id', v_session_id,
        'status', p_status,
        'ends_at', v_ends_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ADJUST CASH FUNCTION
CREATE OR REPLACE FUNCTION adjust_team_cash(
    p_team_id UUID,
    p_amount NUMERIC,
    p_reason TEXT,
    p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_event_id UUID;
    v_team_name TEXT;
    v_prev_cash NUMERIC;
    v_new_cash NUMERIC;
BEGIN
    SELECT event_id, name, cash_balance 
    INTO v_event_id, v_team_name, v_prev_cash
    FROM teams 
    WHERE id = p_team_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Team not found');
    END IF;

    v_new_cash := v_prev_cash + p_amount;
    IF v_new_cash < 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Adjustment would result in negative cash balance');
    END IF;

    UPDATE teams 
    SET cash_balance = v_new_cash, updated_at = NOW()
    WHERE id = p_team_id;

    INSERT INTO cash_adjustments (event_id, team_id, admin_id, amount, previous_balance, new_balance, reason)
    VALUES (v_event_id, p_team_id, p_admin_id, p_amount, v_prev_cash, v_new_cash, p_reason);

    INSERT INTO audit_logs (event_id, actor_type, actor_id, action, entity_type, entity_id, old_value, new_value, reason)
    VALUES (
        v_event_id,
        'ADMIN',
        p_admin_id,
        'CASH_ADJUSTMENT',
        'TEAM',
        p_team_id,
        jsonb_build_object('cash', v_prev_cash, 'team', v_team_name),
        jsonb_build_object('cash', v_new_cash, 'adjustment', p_amount, 'team', v_team_name),
        p_reason
    );

    RETURN jsonb_build_object(
        'success', true,
        'team_name', v_team_name,
        'previous_balance', v_prev_cash,
        'adjustment', p_amount,
        'new_balance', v_new_cash
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- SET TEAM STATUS FUNCTION
CREATE OR REPLACE FUNCTION set_team_status(
    p_team_id UUID,
    p_status TEXT,
    p_reason TEXT,
    p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_event_id UUID;
    v_team_name TEXT;
    v_old_status TEXT;
BEGIN
    IF p_status NOT IN ('ACTIVE', 'DISABLED', 'ELIMINATED') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid team status');
    END IF;

    SELECT event_id, name, status 
    INTO v_event_id, v_team_name, v_old_status
    FROM teams 
    WHERE id = p_team_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Team not found');
    END IF;

    UPDATE teams SET status = p_status, updated_at = NOW() WHERE id = p_team_id;

    IF p_status = 'ELIMINATED' THEN
        INSERT INTO eliminations (event_id, team_id, admin_id, reason)
        VALUES (v_event_id, p_team_id, p_admin_id, p_reason);
    END IF;

    INSERT INTO audit_logs (event_id, actor_type, actor_id, action, entity_type, entity_id, old_value, new_value, reason)
    VALUES (
        v_event_id,
        'ADMIN',
        p_admin_id,
        'TEAM_STATUS_' || p_status,
        'TEAM',
        p_team_id,
        jsonb_build_object('status', v_old_status, 'team', v_team_name),
        jsonb_build_object('status', p_status, 'team', v_team_name),
        p_reason
    );

    RETURN jsonb_build_object(
        'success', true,
        'team_name', v_team_name,
        'old_status', v_old_status,
        'new_status', p_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- GET LEADERBOARD FUNCTION
CREATE OR REPLACE FUNCTION get_leaderboard(p_event_id UUID)
RETURNS TABLE (
    team_id UUID,
    team_name TEXT,
    team_status TEXT,
    cash_balance NUMERIC,
    portfolio_value NUMERIC,
    total_wealth NUMERIC,
    starting_wealth NUMERIC,
    today_pnl NUMERIC,
    today_pnl_pct NUMERIC,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH team_holdings AS (
        SELECT 
            t.id AS t_id,
            t.name AS t_name,
            t.status AS t_status,
            t.cash_balance AS t_cash,
            t.starting_wealth AS t_start_wealth,
            COALESCE(SUM(h.quantity * s.current_price), 0) AS t_portfolio
        FROM teams t
        LEFT JOIN holdings h ON t.id = h.team_id
        LEFT JOIN stocks s ON h.stock_id = s.id AND s.is_active = true
        WHERE t.event_id = p_event_id
        GROUP BY t.id, t.name, t.status, t.cash_balance, t.starting_wealth
    ),
    calculated_wealth AS (
        SELECT 
            th.t_id,
            th.t_name,
            th.t_status,
            th.t_cash,
            th.t_portfolio,
            (th.t_cash + th.t_portfolio) AS t_total,
            th.t_start_wealth,
            ((th.t_cash + th.t_portfolio) - th.t_start_wealth) AS t_pnl,
            CASE 
                WHEN th.t_start_wealth > 0 THEN (((th.t_cash + th.t_portfolio) - th.t_start_wealth) / th.t_start_wealth) * 100 
                ELSE 0 
            END AS t_pnl_pct
        FROM team_holdings th
    )
    SELECT 
        cw.t_id AS team_id,
        cw.t_name AS team_name,
        cw.t_status AS team_status,
        cw.t_cash AS cash_balance,
        cw.t_portfolio AS portfolio_value,
        cw.t_total AS total_wealth,
        cw.t_start_wealth AS starting_wealth,
        cw.t_pnl AS today_pnl,
        cw.t_pnl_pct AS today_pnl_pct,
        DENSE_RANK() OVER (ORDER BY cw.t_total DESC) AS rank
    FROM calculated_wealth cw
    ORDER BY total_wealth DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 8. Seed Demo Event and Initial Data
DO $$
DECLARE
    v_event_id UUID;
    v_team_alpha UUID;
    v_team_bulls UUID;
    v_team_titans UUID;
    v_team_nova UUID;
    v_team_phoenix UUID;
    v_stock_nova UUID;
    v_stock_finedge UUID;
    v_stock_medix UUID;
    v_stock_greenx UUID;
    v_stock_foodco UUID;
    v_pin_hash TEXT := '4821'; 
BEGIN
    INSERT INTO events (name, description, round_name, status, starting_capital, qualification_count)
    VALUES (
        'METIS 2026', 
        'The Strategic Market Challenge — Live Virtual Stock Trading Arena', 
        'Round 2 — Virtual Market', 
        'ACTIVE', 
        100000000,
        5
    )
    RETURNING id INTO v_event_id;

    INSERT INTO teams (event_id, name, team_code, pin_hash, cash_balance, starting_wealth, status)
    VALUES (v_event_id, 'Alpha', 'ALPHA-7K29', v_pin_hash, 100000000, 100000000, 'ACTIVE')
    RETURNING id INTO v_team_alpha;

    INSERT INTO teams (event_id, name, team_code, pin_hash, cash_balance, starting_wealth, status)
    VALUES (v_event_id, 'Bulls', 'BULLS-9X12', v_pin_hash, 100000000, 100000000, 'ACTIVE')
    RETURNING id INTO v_team_bulls;

    INSERT INTO teams (event_id, name, team_code, pin_hash, cash_balance, starting_wealth, status)
    VALUES (v_event_id, 'Titans', 'TITAN-4M88', v_pin_hash, 100000000, 100000000, 'ACTIVE')
    RETURNING id INTO v_team_titans;

    INSERT INTO teams (event_id, name, team_code, pin_hash, cash_balance, starting_wealth, status)
    VALUES (v_event_id, 'Nova', 'NOVA-3B45', v_pin_hash, 100000000, 100000000, 'ACTIVE')
    RETURNING id INTO v_team_nova;

    INSERT INTO teams (event_id, name, team_code, pin_hash, cash_balance, starting_wealth, status)
    VALUES (v_event_id, 'Phoenix', 'PHX-8V71', v_pin_hash, 100000000, 100000000, 'ACTIVE')
    RETURNING id INTO v_team_phoenix;

    INSERT INTO team_members (team_id, full_name, normalized_name, is_trader)
    VALUES 
        (v_team_alpha, 'Mohammed Maaz', 'mohammed maaz', true),
        (v_team_alpha, 'Rahul Kumar', 'rahul kumar', true),
        (v_team_alpha, 'Arjun Rao', 'arjun rao', true),
        (v_team_alpha, 'Zaid Ahmed', 'zaid ahmed', true),
        (v_team_bulls, 'Rohan Sharma', 'rohan sharma', true),
        (v_team_bulls, 'Priya Patel', 'priya patel', true),
        (v_team_bulls, 'Vikram Singh', 'vikram singh', true),
        (v_team_bulls, 'Ananya Roy', 'ananya roy', true),
        (v_team_titans, 'Aditya Varma', 'aditya varma', true),
        (v_team_titans, 'Sneha Nair', 'sneha nair', true),
        (v_team_titans, 'Kabir Mehta', 'kabir mehta', true),
        (v_team_titans, 'Tanvi Joshi', 'tanvi joshi', true),
        (v_team_nova, 'Karan Malhotra', 'karan malhotra', true),
        (v_team_nova, 'Divya Iyer', 'divya iyer', true),
        (v_team_nova, 'Rishi Deshmukh', 'rishi deshmukh', true),
        (v_team_nova, 'Meera Sen', 'meera sen', true),
        (v_team_phoenix, 'Varun Chopra', 'varun chopra', true),
        (v_team_phoenix, 'Ishaan Gupta', 'ishaan gupta', true),
        (v_team_phoenix, 'Tara Sundaram', 'tara sundaram', true),
        (v_team_phoenix, 'Sameer Khan', 'sameer khan', true);

    INSERT INTO stocks (event_id, symbol, company_name, sector, starting_price, current_price, opening_price, high_price, low_price, is_active)
    VALUES (v_event_id, 'NOVA', 'Nova Electric Mobility Ltd', 'EV & Auto', 120, 145, 120, 150, 118, true)
    RETURNING id INTO v_stock_nova;

    INSERT INTO stocks (event_id, symbol, company_name, sector, starting_price, current_price, opening_price, high_price, low_price, is_active)
    VALUES (v_event_id, 'FINEDGE', 'FinEdge Capital & Banking', 'Banking & Finance', 95, 92, 95, 98, 89, true)
    RETURNING id INTO v_stock_finedge;

    INSERT INTO stocks (event_id, symbol, company_name, sector, starting_price, current_price, opening_price, high_price, low_price, is_active)
    VALUES (v_event_id, 'MEDIX', 'Medix Global Healthcare', 'Pharma & Biotech', 210, 235, 210, 240, 208, true)
    RETURNING id INTO v_stock_medix;

    INSERT INTO stocks (event_id, symbol, company_name, sector, starting_price, current_price, opening_price, high_price, low_price, is_active)
    VALUES (v_event_id, 'GREENX', 'GreenX Clean Energy Corp', 'Renewable Energy', 170, 184, 170, 192, 168, true)
    RETURNING id INTO v_stock_greenx;

    INSERT INTO stocks (event_id, symbol, company_name, sector, starting_price, current_price, opening_price, high_price, low_price, is_active)
    VALUES (v_event_id, 'FOODCO', 'FoodCo Consumer Essentials', 'FMCG & Retail', 310, 298, 310, 315, 292, true)
    RETURNING id INTO v_stock_foodco;

    INSERT INTO market_sessions (event_id, status, started_at, ends_at)
    VALUES (v_event_id, 'OPEN', NOW(), NOW() + INTERVAL '45 minutes');

    INSERT INTO news (event_id, headline, body, sector, published_at, is_published)
    VALUES 
        (
            v_event_id, 
            'Government Announces ₹25,000 Cr Subsidy Scheme for Commercial EVs',
            'The Ministry of Heavy Industries has unveiled a flagship incentive package providing heavy production subsidies to domestic electric battery and vehicle manufacturers.',
            'EV & Auto',
            NOW() - INTERVAL '12 minutes',
            true
        ),
        (
            v_event_id,
            'Central Bank Hints at Possible Repo Rate Hike in Upcoming Monetary Policy',
            'Surging inflation figures have prompted the reserve bank to signal stricter liquidity controls, creating cautious sentiment across major banking and credit lenders.',
            'Banking & Finance',
            NOW() - INTERVAL '8 minutes',
            true
        ),
        (
            v_event_id,
            'Medix Healthcare Secures Global Patent for Next-Gen Oncology Drug',
            'Clinical trials across phase 3 have concluded successfully with over 88% efficacy, paving the way for multi-continent commercial rollout.',
            'Pharma & Biotech',
            NOW() - INTERVAL '3 minutes',
            true
        );

    INSERT INTO audit_logs (event_id, actor_type, action, entity_type, entity_id, new_value, reason)
    VALUES (
        v_event_id,
        'SYSTEM',
        'EVENT_INIT',
        'EVENT',
        v_event_id,
        jsonb_build_object('name', 'METIS 2026', 'teams', 5, 'stocks', 5),
        'Seeded initial demo event, teams, stocks and news'
    );
END $$;
