-- ====================================================================
-- METIS Row Level Security (RLS) Policies
-- ====================================================================

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE eliminations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin in profiles
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. PROFILES POLICIES
CREATE POLICY "Public profiles read" ON profiles
FOR SELECT USING (true);

CREATE POLICY "Admin can modify profiles" ON profiles
FOR ALL USING (is_admin());

CREATE POLICY "User can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. EVENTS POLICIES
CREATE POLICY "Anyone can view active and upcoming events" ON events
FOR SELECT USING (true);

CREATE POLICY "Admins can manage events" ON events
FOR ALL USING (is_admin());

-- 4. STOCKS POLICIES
CREATE POLICY "Anyone can view stocks" ON stocks
FOR SELECT USING (true);

CREATE POLICY "Admins can manage stocks" ON stocks
FOR ALL USING (is_admin());

-- 5. STOCK PRICE HISTORY POLICIES
CREATE POLICY "Anyone can view stock price history" ON stock_price_history
FOR SELECT USING (true);

CREATE POLICY "Admins can manage price history" ON stock_price_history
FOR ALL USING (is_admin());

-- 6. MARKET SESSIONS POLICIES
CREATE POLICY "Anyone can view market sessions" ON market_sessions
FOR SELECT USING (true);

CREATE POLICY "Admins can manage market sessions" ON market_sessions
FOR ALL USING (is_admin());

-- 7. NEWS POLICIES
CREATE POLICY "Anyone can view published news" ON news
FOR SELECT USING (is_published = true OR is_admin());

CREATE POLICY "Admins can manage news" ON news
FOR ALL USING (is_admin());

-- 8. TEAMS POLICIES
-- Anyone can view team basic public info (names/status) for leaderboard
CREATE POLICY "Public can view teams overview" ON teams
FOR SELECT USING (true);

CREATE POLICY "Admins can manage teams" ON teams
FOR ALL USING (is_admin());

-- 9. TEAM MEMBERS POLICIES
CREATE POLICY "Public can read team members for verification" ON team_members
FOR SELECT USING (true);

CREATE POLICY "Admins can manage team members" ON team_members
FOR ALL USING (is_admin());

-- 10. PARTICIPANT SESSIONS POLICIES
CREATE POLICY "Anyone can insert session on verify" ON participant_sessions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can select active session" ON participant_sessions
FOR SELECT USING (true);

CREATE POLICY "Admins can manage sessions" ON participant_sessions
FOR ALL USING (is_admin());

-- 11. HOLDINGS POLICIES
CREATE POLICY "Anyone can read holdings for calculation" ON holdings
FOR SELECT USING (true);

CREATE POLICY "Admins can manage holdings" ON holdings
FOR ALL USING (is_admin());

-- 12. TRADES POLICIES
CREATE POLICY "Anyone can read trades" ON trades
FOR SELECT USING (true);

CREATE POLICY "Admins can manage trades" ON trades
FOR ALL USING (is_admin());

-- 13. CASH ADJUSTMENTS POLICIES
CREATE POLICY "Admins can manage cash adjustments" ON cash_adjustments
FOR ALL USING (is_admin());

-- 14. ELIMINATIONS POLICIES
CREATE POLICY "Admins can manage eliminations" ON eliminations
FOR ALL USING (is_admin());

-- 15. AUDIT LOGS POLICIES
CREATE POLICY "Admins can view audit logs" ON audit_logs
FOR SELECT USING (is_admin());

CREATE POLICY "System can insert audit logs" ON audit_logs
FOR INSERT WITH CHECK (true);

-- 16. NEWS POLICIES
CREATE POLICY "Public can view published news" ON news
FOR SELECT USING (true);

CREATE POLICY "Anyone can insert published news" ON news
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update news" ON news
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete news" ON news
FOR DELETE USING (true);

