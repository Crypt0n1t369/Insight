// Moderation Service - Reports and Warnings
// Version: 0.1.0 (MVP)

import { v4 as uuidv4 } from 'uuid';
import { 
  Report, 
  CreateReportInput, 
  ReportSchema,
  Warning,
  ReportReason,
  ReportStatus
} from '../types/index.js';
import { identityService } from './identity.js';

// In-memory storage for MVP
const reports = new Map<string, Report>();
const warnings = new Map<string, Warning>();

/**
 * Moderation Service - handles content reports and user warnings
 */
export class ModerationService {
  
  /**
   * Create a report
   */
  async createReport(reporterId: string, input: CreateReportInput): Promise<Report> {
    const now = new Date().toISOString();
    
    const report: Report = {
      id: uuidv4(),
      reporter_id: reporterId,
      content_type: input.content_type,
      content_id: input.content_id,
      reason: input.reason,
      evidence: input.evidence ?? null,
      status: 'pending',
      created_at: now,
      resolved_at: null,
    };
    
    const validated = ReportSchema.parse(report);
    reports.set(validated.id, validated);
    
    return validated;
  }
  
  /**
   * Get report by ID
   */
  async getReportById(id: string): Promise<Report | null> {
    return reports.get(id) ?? null;
  }
  
  /**
   * Get pending reports (for moderators)
   */
  async getPendingReports(limit = 20, offset = 0): Promise<{ reports: Report[]; total: number }> {
    const result = Array.from(reports.values())
      .filter(r => r.status === 'pending')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    const total = result.length;
    return {
      reports: result.slice(offset, offset + limit),
      total,
    };
  }
  
  /**
   * Review a report (moderator action)
   */
  async reviewReport(reportId: string, decision: 'dismissed' | 'actioned'): Promise<Report | null> {
    const report = reports.get(reportId);
    if (!report) return null;
    
    const updated: Report = {
      ...report,
      status: decision === 'actioned' ? 'actioned' : 'dismissed',
      resolved_at: new Date().toISOString(),
    };
    
    reports.set(reportId, updated);
    
    // If actioned, apply credibility penalty to content author
    if (decision === 'actioned') {
      // Would need to fetch content author - simplified for MVP
      // await identityService.applySlash(contentAuthorId, report.reason, 10);
    }
    
    return updated;
  }
  
  /**
   * Get reports for a specific content
   */
  async getContentReports(contentId: string): Promise<Report[]> {
    return Array.from(reports.values())
      .filter(r => r.content_id === contentId);
  }
  
  /**
   * Create a warning for a user
   */
  async createWarning(userId: string, reportId: string, reason: string, severity: 'minor' | 'major' | 'severe'): Promise<Warning> {
    const warning: Warning = {
      id: uuidv4(),
      user_id: userId,
      report_id: reportId,
      reason,
      severity,
      created_at: new Date().toISOString(),
    };
    
    warnings.set(warning.id, warning);
    
    // Apply credibility penalty based on severity
    const penaltyMap = { minor: 5, major: 15, severe: 50 };
    await identityService.updateCredibility(userId, -penaltyMap[severity], `Warning: ${reason}`);
    
    return warning;
  }
  
  /**
   * Get warnings for a user
   */
  async getUserWarnings(userId: string): Promise<Warning[]> {
    return Array.from(warnings.values())
      .filter(w => w.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  /**
   * Check if user has too many warnings (auto-suspension threshold)
   */
  async checkUserStatus(userId: string): Promise<{ warnings: number; status: string }> {
    const userWarnings = await this.getUserWarnings(userId);
    const severeCount = userWarnings.filter(w => w.severity === 'severe').length;
    
    let status = 'active';
    if (severeCount >= 3) status = 'suspended';
    else if (userWarnings.length >= 5) status = 'flagged';
    
    return { warnings: userWarnings.length, status };
  }
}

// Reset function for testing
export function resetModerationService() {
  reports.clear();
  warnings.clear();
}

// Export singleton instance
export const moderationService = new ModerationService();
