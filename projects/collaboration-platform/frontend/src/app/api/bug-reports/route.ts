import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BUGS_FILE = path.join(process.cwd(), 'data', 'bug-reports.json');

interface BugReport {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: string;
  status: 'pending' | 'analyzing' | 'planned' | 'fixed' | 'rejected';
  createdAt: string;
  analysis?: string;
  proposedFixes?: string[];
  selectedFix?: string;
  fixCommit?: string;
}

function readReports(): BugReport[] {
  try {
    if (!fs.existsSync(BUGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(BUGS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeReports(reports: BugReport[]) {
  const dir = path.dirname(BUGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(BUGS_FILE, JSON.stringify(reports, null, 2));
}

export async function GET() {
  const reports = readReports();
  return NextResponse.json(reports);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const reports = readReports();
  
  const newReport: BugReport = {
    ...body,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  reports.push(newReport);
  writeReports(reports);
  
  return NextResponse.json({ success: true, id: newReport.id });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const reports = readReports();
  
  const index = reports.findIndex((r: BugReport) => r.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  reports[index] = { ...reports[index], ...body };
  writeReports(reports);
  
  return NextResponse.json(reports[index]);
}
