#!/usr/bin/env node
/**
 * Bug Report Processor
 * 
 * Usage: node scripts/bug-processor.js [command]
 * Commands:
 *   list        - List pending bug reports
 *   analyze <id> - Analyze a specific bug and propose fixes
 *   fix <id>    - Apply fix for a bug
 *   status      - Show status of all bugs
 */

const fs = require('fs');
const path = require('path');

const BUGS_FILE = path.join(__dirname, '../../projects/collaboration-platform/data/bug-reports.json');

function readReports() {
  try {
    if (!fs.existsSync(BUGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(BUGS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeReports(reports) {
  const dir = path.dirname(BUGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(BUGS_FILE, JSON.stringify(reports, null, 2));
}

const cmd = process.argv[2];

if (cmd === 'list') {
  const reports = readReports().filter(r => r.status === 'pending');
  if (reports.length === 0) {
    console.log('No pending bug reports.');
  } else {
    console.log('Pending Bug Reports:\n');
    reports.forEach(r => {
      console.log(`[${r.id}] ${r.title}`);
      console.log(`  Type: ${r.category} | Severity: ${r.severity}`);
      console.log(`  ${r.description.slice(0, 100)}...`);
      console.log('');
    });
  }
} else if (cmd === 'status') {
  const reports = readReports();
  const byStatus = {};
  reports.forEach(r => {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  });
  console.log('Bug Report Status:');
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
} else if (cmd === 'analyze') {
  const id = process.argv[3];
  const reports = readReports();
  const report = reports.find(r => r.id === id);
  if (!report) {
    console.log('Bug not found:', id);
    process.exit(1);
  }
  console.log(`Analyzing: ${report.title}`);
  console.log(`Description: ${report.description}`);
  console.log('\nThis would spawn a sub-agent to investigate and propose fixes.');
  console.log('Proposed fixes will be stored in the report for review.');
} else {
  console.log('Usage: node bug-processor.js <list|analyze|status>');
}
