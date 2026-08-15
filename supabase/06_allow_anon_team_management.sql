-- ====================================================================
-- METIS: Allow Team Management via Anon / Frontend Client (RLS Fix)
-- ====================================================================

-- Run this in Supabase SQL Editor to allow team registration & management:

DROP POLICY IF EXISTS "Admins can manage teams" ON teams;
DROP POLICY IF EXISTS "Allow public/anon to manage teams" ON teams;
CREATE POLICY "Allow public/anon to manage teams" ON teams
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Allow public/anon to manage team members" ON team_members;
CREATE POLICY "Allow public/anon to manage team members" ON team_members
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage holdings" ON holdings;
DROP POLICY IF EXISTS "Allow public/anon to manage holdings" ON holdings;
CREATE POLICY "Allow public/anon to manage holdings" ON holdings
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage trades" ON trades;
DROP POLICY IF EXISTS "Allow public/anon to manage trades" ON trades;
CREATE POLICY "Allow public/anon to manage trades" ON trades
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage news" ON news;
DROP POLICY IF EXISTS "Allow public/anon to manage news" ON news;
CREATE POLICY "Allow public/anon to manage news" ON news
FOR ALL USING (true) WITH CHECK (true);
