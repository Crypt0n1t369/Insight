#!/usr/bin/env node
/**
 * Bug Report Processor - Supabase Edition
 * 
 * Usage: node scripts/bug-processor.js [command]
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://befpyjnxcaohdedvhpuu.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZnB5am54Y2FvaGRlZHZocHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg1ODYwNSwiZXhwIjoyMDg5NDM0NjA1fQ.eBTXK5fpMKkaMN3-0gU2fQokNMG1ZX2QMEh6KDHgSvQ';

const supabase = createClient(supabaseUrl, serviceKey);

async function listPending() {
  const { data, error } = await supabase
    .from('bug_reports')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('✅ No pending bug reports.');
    return;
  }

  console.log(`📋 Found ${data.length} pending bug report(s):\n`);
  data.forEach(r => {
    console.log(`[${r.id.slice(0,8)}] ${r.title}`);
    console.log(`  Type: ${r.category} | Severity: ${r.severity}`);
    console.log(`  ${r.description.slice(0, 80)}...`);
    console.log('');
  });
}

async function showStatus() {
  const { data, error } = await supabase
    .from('bug_reports')
    .select('status');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  const counts = {};
  data.forEach(r => {
    counts[r.status] = (counts[r.status] || 0) + 1;
  });

  console.log('Bug Report Status:');
  Object.entries(counts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
}

async function analyze(id) {
  const { data: report, error } = await supabase
    .from('bug_reports')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !report) {
    console.log('Bug not found:', id);
    return;
  }

  console.log('═'.repeat(50));
  console.log(`BUG ANALYSIS: ${report.title}`);
  console.log('═'.repeat(50));
  console.log(`ID: ${report.id}`);
  console.log(`Category: ${report.category} | Severity: ${report.severity}`);
  console.log(`Description: ${report.description}`);
  console.log('\nTo analyze this bug, I will:');
  console.log('1. Investigate the codebase');
  console.log('2. Propose 3 fix approaches');
  console.log('3. Select the best one based on complexity/risk');
  console.log('4. Either fix it (if simple) or ask for confirmation (if complex)');
}

const cmd = process.argv[2];

if (cmd === 'list') {
  listPending();
} else if (cmd === 'status') {
  showStatus();
} else if (cmd === 'analyze') {
  analyze(process.argv[3]);
} else {
  console.log('Usage: node bug-processor.js <list|status|analyze>');
  console.log('\nCommands:');
  console.log('  list      - List pending bug reports');
  console.log('  status    - Show count by status');
  console.log('  analyze   - Analyze a specific bug');
}
