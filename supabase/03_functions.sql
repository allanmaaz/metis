-- ====================================================================
-- METIS Atomic Database Functions & RPCs
-- ====================================================================

-- 1. BUY STOCK (Atomic Transaction with Row Locking)
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
    -- 1. Validate inputs
    IF p_quantity <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Quantity must be greater than zero.');
    END IF;

    -- 2. Fetch and check Stock & Event
    SELECT event_id, symbol, current_price, is_active 
    INTO v_event_id, v_stock_symbol, v_stock_price, v_stock_active
    FROM stocks WHERE id = p_stock_id;

    IF NOT FOUND OR NOT v_stock_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'Stock is inactive or not found.');
    END IF;

    -- 3. Check Event Status
    SELECT status INTO v_event_status FROM events WHERE id = v_event_id;
    IF v_event_status != 'ACTIVE' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Event is not active.');
    END IF;

    -- 4. Check Market Status
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

    -- 5. Lock and Check Team Cash
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

    -- 6. Check Solvency
    v_total_cost := p_quantity * v_stock_price;
    IF v_team_cash < v_total_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient cash balance. Required: ₹' || v_total_cost || ', Available: ₹' || v_team_cash);
    END IF;

    -- 7. Deduct Cash
    UPDATE teams 
    SET cash_balance = cash_balance - v_total_cost, updated_at = NOW() 
    WHERE id = p_team_id;

    -- 8. Update Holdings (Upsert with Weighted Average Cost)
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

    -- 9. Record Trade
    INSERT INTO trades (event_id, team_id, team_member_id, stock_id, side, quantity, price, total_value)
    VALUES (v_event_id, p_team_id, p_member_id, p_stock_id, 'BUY', p_quantity, v_stock_price, v_total_cost)
    RETURNING id INTO v_trade_id;

    -- 10. Audit Log
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


-- 2. SELL STOCK (Atomic Transaction with Row Locking)
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
    -- 1. Validate inputs
    IF p_quantity <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Quantity must be greater than zero.');
    END IF;

    -- 2. Fetch and check Stock & Event
    SELECT event_id, symbol, current_price, is_active 
    INTO v_event_id, v_stock_symbol, v_stock_price, v_stock_active
    FROM stocks WHERE id = p_stock_id;

    IF NOT FOUND OR NOT v_stock_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'Stock is inactive or not found.');
    END IF;

    -- 3. Check Event Status
    SELECT status INTO v_event_status FROM events WHERE id = v_event_id;
    IF v_event_status != 'ACTIVE' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Event is not active.');
    END IF;

    -- 4. Check Market Status
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

    -- 5. Lock and Check Team Status
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

    -- 6. Lock and Check Holdings
    SELECT quantity, average_cost, realized_pnl 
    INTO v_existing_qty, v_existing_avg, v_existing_pnl
    FROM holdings
    WHERE team_id = p_team_id AND stock_id = p_stock_id
    FOR UPDATE;

    IF NOT FOUND OR v_existing_qty < p_quantity THEN
        RETURN jsonb_build_object('success', false, 'error', 'You do not own enough shares. Owned: ' || COALESCE(v_existing_qty, 0) || ', Requested: ' || p_quantity);
    END IF;

    -- 7. Calculate Proceeds and Realized Profit
    v_proceeds := p_quantity * v_stock_price;
    v_profit := (v_stock_price - v_existing_avg) * p_quantity;
    v_new_qty := v_existing_qty - p_quantity;

    -- 8. Update Holdings
    UPDATE holdings 
    SET quantity = v_new_qty, 
        realized_pnl = v_existing_pnl + v_profit,
        updated_at = NOW()
    WHERE team_id = p_team_id AND stock_id = p_stock_id;

    -- 9. Add Cash Proceeds
    UPDATE teams 
    SET cash_balance = cash_balance + v_proceeds, updated_at = NOW()
    WHERE id = p_team_id;

    -- 10. Record Trade
    INSERT INTO trades (event_id, team_id, team_member_id, stock_id, side, quantity, price, total_value)
    VALUES (v_event_id, p_team_id, p_member_id, p_stock_id, 'SELL', p_quantity, v_stock_price, v_proceeds)
    RETURNING id INTO v_trade_id;

    -- 11. Audit Log
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


-- 3. UPDATE STOCK PRICE (Admin operation with High/Low updates)
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

    -- Update High and Low automatically
    v_high := GREATEST(v_high, p_new_price);
    v_low := LEAST(v_low, p_new_price);

    UPDATE stocks
    SET current_price = p_new_price,
        high_price = v_high,
        low_price = v_low,
        updated_at = NOW()
    WHERE id = p_stock_id;

    -- Insert Price History
    INSERT INTO stock_price_history (stock_id, old_price, new_price, changed_by, reason)
    VALUES (p_stock_id, v_old_price, p_new_price, p_admin_id, p_reason);

    -- Insert Audit Log
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


-- 4. MARKET STATE CONTROL (Open, Pause, Close, Freeze, Resume)
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

    -- Store each team's starting wealth when opening a new market session
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

    -- Audit Log
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


-- 5. MANUAL CASH ADJUSTMENT
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


-- 6. ELIMINATE / DISABLE / RESTORE TEAM
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


-- 7. CALCULATE DYNAMIC LEADERBOARD
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
