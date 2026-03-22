#!/usr/bin/env node

const { postResumeBrief } = require('../telegram_delivery.js');

function usage(){ console.log('Usage: node milestone_notify.js --milestone <name> --status <status> --summary <text> [--blockers <text>] [--next <text>] [--budget <text>]'); }

// Very lightweight argument parsing
const args = process.argv.slice(2);
const map = {};
for(let i=0;i<args.length;i+=2){
  const k = args[i].replace(/^-+/, '');
  const v = (args[i+1]||'').trim();
  map[k] = v;
}

const payload = {
  header: `Resuming: Phase 0 → Phase 1 MVP`,
  completed: map['milestone'] ? map['milestone'] : 'Phase 0 foundations',
  inProgress: map['status'] || 'In progress ongoing work',
  nextActions: [ map['next'] || 'Finalize Phase 1 MVP runbook; implement test harness; initialize Git branches' ],
  blockers: map['blockers'] || 'None',
  risk: map['risk'] || 'Low',
  budget: map['budget'] || 'Daily budget cap: $10; Opus-4.6 limited to elite tasks'
};

postResumeBrief(payload).catch(err=>{
  console.error('Failed to post resume brief', err);
  process.exit(1);
});
