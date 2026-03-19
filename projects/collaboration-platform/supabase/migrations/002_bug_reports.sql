-- Bug Reports Table for Credo Platform
-- Run this in Supabase SQL Editor

-- Create bug_reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL DEFAULT 'bug',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ,
  fixed_at TIMESTAMPTZ,
  analysis JSONB,
  proposed_fixes JSONB,
  selected_fix JSONB,
  fix_commit VARCHAR(255),
  reporter_ip VARCHAR(45),
  reporter_user_agent TEXT
);

-- Enable RLS
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for MVP - users can report bugs)
CREATE POLICY "Allow anonymous inserts on bug_reports" ON bug_reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow public read (to see status)
CREATE POLICY "Allow public read on bug_reports" ON bug_reports
  FOR SELECT TO anon, authenticated
  USING (true);

-- Allow authenticated updates (for agent processing)
CREATE POLICY "Allow authenticated updates on bug_reports" ON bug_reports
  FOR UPDATE TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);

SELECT 'bug_reports table created successfully' as result;
