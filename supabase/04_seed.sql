-- ====================================================================
-- METIS Seed Data for Demo & Development
-- ====================================================================

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
    -- PIN '4821' bcrypt hash or sha256
    v_pin_hash TEXT := '4821'; 
BEGIN
    -- 1. Create Default Event
    INSERT INTO events (name, description, round_name, status, starting_capital, qualification_count)
    VALUES (
        'METIS 2026', 
        'The Strategic Market Challenge — Live Virtual Stock Trading Arena', 
        'Round 2 — Virtual Market', 
        'ACTIVE', 
        100000000, -- ₹10 Cr
        5
    )
    RETURNING id INTO v_event_id;

    -- 2. Create Teams with ₹10 Cr virtual capital
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

    -- 3. Create Team Members
    -- Team Alpha
    INSERT INTO team_members (team_id, full_name, normalized_name, is_trader)
    VALUES 
        (v_team_alpha, 'Mohammed Maaz', 'mohammed maaz', true),
        (v_team_alpha, 'Rahul Kumar', 'rahul kumar', true),
        (v_team_alpha, 'Arjun Rao', 'arjun rao', true),
        (v_team_alpha, 'Zaid Ahmed', 'zaid ahmed', true);

    -- Team Bulls
    INSERT INTO team_members (team_id, full_name, normalized_name, is_trader)
    VALUES 
        (v_team_bulls, 'Rohan Sharma', 'rohan sharma', true),
        (v_team_bulls, 'Priya Patel', 'priya patel', true),
        (v_team_bulls, 'Vikram Singh', 'vikram singh', true),
        (v_team_bulls, 'Ananya Roy', 'ananya roy', true);

    -- Team Titans
    INSERT INTO team_members (team_id, full_name, normalized_name, is_trader)
    VALUES 
        (v_team_titans, 'Aditya Varma', 'aditya varma', true),
        (v_team_titans, 'Sneha Nair', 'sneha nair', true),
        (v_team_titans, 'Kabir Mehta', 'kabir mehta', true),
        (v_team_titans, 'Tanvi Joshi', 'tanvi joshi', true);

    -- Team Nova
    INSERT INTO team_members (team_id, full_name, normalized_name, is_trader)
    VALUES 
        (v_team_nova, 'Karan Malhotra', 'karan malhotra', true),
        (v_team_nova, 'Divya Iyer', 'divya iyer', true),
        (v_team_nova, 'Rishi Deshmukh', 'rishi deshmukh', true),
        (v_team_nova, 'Meera Sen', 'meera sen', true);

    -- Team Phoenix
    INSERT INTO team_members (team_id, full_name, normalized_name, is_trader)
    VALUES 
        (v_team_phoenix, 'Varun Chopra', 'varun chopra', true),
        (v_team_phoenix, 'Ishaan Gupta', 'ishaan gupta', true),
        (v_team_phoenix, 'Tara Sundaram', 'tara sundaram', true),
        (v_team_phoenix, 'Sameer Khan', 'sameer khan', true);

    -- 4. Create Stocks
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

    -- 5. Open Market Session
    INSERT INTO market_sessions (event_id, status, started_at, ends_at)
    VALUES (v_event_id, 'OPEN', NOW(), NOW() + INTERVAL '45 minutes');

    -- 6. Initial Market News
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

    -- 7. Audit Log for Setup
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
