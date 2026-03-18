-- Enable RLS policies for public access (MVP mode)
-- Run this in Supabase SQL Editor

-- Users table
DROP POLICY IF EXISTS "Allow anonymous inserts on users" ON users;
CREATE POLICY "Allow anonymous inserts on users" ON users
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on users" ON users;
CREATE POLICY "Allow public read on users" ON users
  FOR SELECT TO anon, authenticated
  USING (true);

-- Branches table
DROP POLICY IF EXISTS "Allow anonymous inserts on branches" ON branches;
CREATE POLICY "Allow anonymous inserts on branches" ON branches
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on branches" ON branches;
CREATE POLICY "Allow public read on branches" ON branches
  FOR SELECT TO anon, authenticated
  USING (true);

-- Contributions table
DROP POLICY IF EXISTS "Allow anonymous inserts on contributions" ON contributions;
CREATE POLICY "Allow anonymous inserts on contributions" ON contributions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on contributions" ON contributions;
CREATE POLICY "Allow public read on contributions" ON contributions
  FOR SELECT TO anon, authenticated
  USING (true);

-- Proposals table
DROP POLICY IF EXISTS "Allow anonymous inserts on proposals" ON proposals;
CREATE POLICY "Allow anonymous inserts on proposals" ON proposals
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on proposals" ON proposals;
CREATE POLICY "Allow public read on proposals" ON proposals
  FOR SELECT TO anon, authenticated
  USING (true);

-- Endorsements table
DROP POLICY IF EXISTS "Allow anonymous inserts on endorsements" ON endorsements;
CREATE POLICY "Allow anonymous inserts on endorsements" ON endorsements
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on endorsements" ON endorsements;
CREATE POLICY "Allow public read on endorsements" ON endorsements
  FOR SELECT TO anon, authenticated
  USING (true);

-- Votes table
DROP POLICY IF EXISTS "Allow anonymous inserts on votes" ON votes;
CREATE POLICY "Allow anonymous inserts on votes" ON votes
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on votes" ON votes;
CREATE POLICY "Allow public read on votes" ON votes
  FOR SELECT TO anon, authenticated
  USING (true);

SELECT 'RLS policies created successfully' as result;
