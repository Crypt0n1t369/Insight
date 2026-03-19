/**
 * Setup Bug Reports Table in Supabase
 * Run: node scripts/setup-bug-reports.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://befpyjnxcaohdedvhpuu.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZnB5am54Y2FvaGRlZHZocHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg1ODYwNSwiZXhwIjoyMDg5NDM0NjA1fQ.eBTXK5fpMKkaMN3-0gU2fQokNMG1ZX2QMEh6KDHgSvQ';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function setup() {
  console.log('Setting up bug_reports table...\n');
  
  // First try to insert a dummy record - if table doesn't exist, we'll get an error
  // and can create it
  
  const testData = {
    category: 'bug',
    title: 'Test report - can be deleted',
    description: 'This is a test to check if table exists',
    severity: 'low',
    status: 'pending'
  };

  const { error: insertError } = await supabase
    .from('bug_reports')
    .insert(testData);

  if (insertError) {
    if (insertError.message.includes('relation "bug_reports" does not exist')) {
      console.log('Table does not exist. Trying alternative creation method...');
      
      // Use pg_catalog to create table
      const { error: rpcError } = await supabase.rpc('pg_catalog.exec', {
        query: "CREATE TABLE bug_reports (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), category VARCHAR(50) DEFAULT 'bug', title VARCHAR(255) NOT NULL, description TEXT NOT NULL, severity VARCHAR(20) DEFAULT 'medium', status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())"
      });
      
      if (rpcError) {
        console.log('RPC creation failed:', rpcError.message);
        console.log('\n⚠️  Please run the following SQL in Supabase SQL Editor:');
        console.log('='.repeat(50));
        console.log(`
-- Bug Reports Table
CREATE TABLE bug_reports (
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

-- RLS
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow inserts" ON bug_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow read" ON bug_reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update" ON bug_reports FOR UPDATE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_bug_status ON bug_reports(status);
CREATE INDEX idx_bug_created ON bug_reports(created_at DESC);
        `);
        console.log('='.repeat(50));
        return;
      }
    }
  } else {
    console.log('✓ Table exists, test insert worked');
    
    // Clean up test record
    await supabase.from('bug_reports').delete().eq('title', 'Test report - can be deleted');
    console.log('✓ Test record cleaned up');
  }

  console.log('\n✅ Bug reports table ready!');
}

setup().catch(err => {
  console.error('Setup error:', err.message);
  process.exit(1);
});
