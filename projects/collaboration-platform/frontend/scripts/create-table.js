/**
 * Direct table creation via Supabase REST API
 */

const fetch = require('node-fetch');

const SUPABASE_URL = 'https://befpyjnxcaohdedvhpuu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZnB5am54Y2FvaGRlZHZocHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg1ODYwNSwiZXhwIjoyMDg5NDM0NjA1fQ.eBTXK5fpMKkaMN3-0gU2fQokNMG1ZX2QMEh6KDHgSvQ';

async function createTable() {
  console.log('Creating bug_reports table...\n');
  
  // Try using pg_catalog to create table via postgrest
  // This requires the exec_sql function to exist, which it doesn't by default
  
  // Alternative: Use REST API to execute SQL via RPC
  // First check if we can create via anon key (won't work for DDL)
  
  // Let's try listing tables to see what exists
  const tablesRes = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SERVICE_KEY}`, {
    headers: { 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  
  console.log('Checking schema...');
  
  // The issue is we can't execute DDL via the REST API
  // We need to either:
  // 1. Use psql with the connection string
  // 2. Use Supabase CLI
  // 3. Ask user to run SQL in dashboard
  
  console.log('⚠️  Cannot create table via API - Supabase REST API does not support DDL');
  console.log('\nPlease run this SQL in your Supabase SQL Editor:\n');
  
  console.log(`
-- Create bug_reports table
CREATE TABLE public.bug_reports (
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
  fix_commit VARCHAR(255)
);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Bug reports inserts" ON public.bug_reports
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Bug reports select" ON public.bug_reports
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Bug reports update" ON public.bug_reports
  FOR UPDATE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX idx_bug_reports_created ON public.bug_reports(created_at DESC);
  `.trim());
  
  console.log('\n');
}

createTable();
