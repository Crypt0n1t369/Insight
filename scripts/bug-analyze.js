#!/usr/bin/env node
/**
 * Bug Analysis Agent
 * 
 * This script is used by sub-agents to analyze bug reports
 * and propose multiple fix approaches.
 * 
 * Usage: node scripts/bug-analyze.js <bug-id>
 */

const fs = require('fs');
const path = require('path');

const BUGS_FILE = path.join(__dirname, '../projects/collaboration-platform/data/bug-reports.json');

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

const bugId = process.argv[2];

if (!bugId) {
  console.log('Usage: node bug-analyze.js <bug-id>');
  process.exit(1);
}

const reports = readReports();
const report = reports.find(r => r.id === bugId);

if (!report) {
  console.log('Bug not found:', bugId);
  process.exit(1);
}

console.log('═'.repeat(60));
console.log(`BUG ANALYSIS: ${report.id}`);
console.log('═'.repeat(60));
console.log(`Title: ${report.title}`);
console.log(`Category: ${report.category}`);
console.log(`Severity: ${report.severity}`);
console.log(`Description: ${report.description}`);
console.log('');

// This would be the prompt for a sub-agent
const analysisPrompt = `
You need to analyze this bug report and propose 3 possible fix approaches.

## Bug Report
- Title: ${report.title}
- Category: ${report.category}
- Severity: ${report.severity}
- Description: ${report.description}

## Your Task
1. Investigate the codebase to understand the issue
2. Propose 3 different approaches to fix this:
   - Approach A (Minimal): Quick fix, may have tech debt
   - Approach B (Balanced): Proper fix, reasonable effort
   - Approach C (Ideal): Best practice, may take longer
3. For each approach, estimate:
   - Complexity (1-5)
   - Risk level (low/medium/high)
   - Reversibility (easy/medium/hard)

Output your analysis in this format:
---
ANALYSIS:
[Your investigation findings]

PROPOSED FIXES:
1. [Approach A] - Complexity: X, Risk: Y, Reversibility: Z
   - Description: ...
   
2. [Approach B] - Complexity: X, Risk: Y, Reversibility: Z
   - Description: ...

3. [Approach C] - Complexity: X, Risk: Y, Reversibility: Z
   - Description: ...

RECOMMENDATION:
[Which approach you'd recommend and why]
---
`;

console.log('Sub-agent prompt generated. Run with subagent to execute.');
console.log('');
console.log(analysisPrompt);
