-- ====================================================================
-- METIS: Purge All Teams, Members, Holdings, and Trades from Database
-- ====================================================================

-- Run this query in Supabase SQL Editor to wipe the team roster clean
TRUNCATE TABLE trades CASCADE;
TRUNCATE TABLE holdings CASCADE;
TRUNCATE TABLE team_members CASCADE;
TRUNCATE TABLE teams CASCADE;

-- If TRUNCATE is restricted by permissions, delete records directly:
DELETE FROM trades;
DELETE FROM holdings;
DELETE FROM team_members;
DELETE FROM teams;
