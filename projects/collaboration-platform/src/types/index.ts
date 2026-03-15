// Credo Platform Types
// Version: 0.1.0 (MVP)

import { z } from 'zod';

// ============================================
// User Types
// ============================================

export const TrustTierSchema = z.enum(['newcomer', 'contributor', 'trusted', 'elder']);
export type TrustTier = z.infer<typeof TrustTierSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  anonymous_id: z.string(),
  display_name: z.string().nullable(),
  avatar_seed: z.string(),
  trust_tier: TrustTierSchema,
  credibility_score: z.number().int().min(0),
  wallet_address: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  display_name: z.string().max(50).optional(),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// ============================================
// Branch Types
// ============================================

export const BranchStatusSchema = z.enum(['active', 'archived', 'locked']);
export type BranchStatus = z.infer<typeof BranchStatusSchema>;

export const BranchSchema = z.object({
  id: z.string().uuid(),
  parent_id: z.string().uuid().nullable(),
  creator_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: BranchStatusSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Branch = z.infer<typeof BranchSchema>;

export const CreateBranchSchema = z.object({
  parent_id: z.string().uuid().optional(),
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
});
export type CreateBranchInput = z.infer<typeof CreateBranchSchema>;

// ============================================
// Contribution Types
// ============================================

export const ContributionTypeSchema = z.enum(['idea', 'comment', 'question', 'resource', 'synthesis']);
export type ContributionType = z.infer<typeof ContributionTypeSchema>;

export const ContributionSchema = z.object({
  id: z.string().uuid(),
  author_id: z.string().uuid(),
  branch_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable(),
  type: ContributionTypeSchema,
  content: z.string(),
  endorsements: z.number().int().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Contribution = z.infer<typeof ContributionSchema>;

export const CreateContributionSchema = z.object({
  branch_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
  type: ContributionTypeSchema,
  content: z.string().min(1).max(10000),
});
export type CreateContributionInput = z.infer<typeof CreateContributionSchema>;

// ============================================
// Proposal Types
// ============================================

export const ProposalTypeSchema = z.enum(['branch', 'membership', 'governance', 'resource']);
export type ProposalType = z.infer<typeof ProposalTypeSchema>;

export const ProposalStatusSchema = z.enum(['open', 'accepted', 'rejected', 'withdrawn']);
export type ProposalStatus = z.infer<typeof ProposalStatusSchema>;

export const ProposalSchema = z.object({
  id: z.string().uuid(),
  branch_id: z.string().uuid(),
  author_id: z.string().uuid(),
  type: ProposalTypeSchema,
  title: z.string(),
  content: z.string(),
  status: ProposalStatusSchema,
  votes_for: z.number().int().min(0),
  votes_against: z.number().int().min(0),
  created_at: z.string().datetime(),
  closed_at: z.string().datetime().nullable(),
});
export type Proposal = z.infer<typeof ProposalSchema>;

export const CreateProposalSchema = z.object({
  branch_id: z.string().uuid(),
  type: ProposalTypeSchema,
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(5000),
});
export type CreateProposalInput = z.infer<typeof CreateProposalSchema>;

// ============================================
// Vote Types
// ============================================

export const VoteSchema = z.object({
  id: z.string().uuid(),
  proposal_id: z.string().uuid(),
  voter_id: z.string().uuid(),
  support: z.boolean(),
  tokens: z.number().int().min(1),
  quadratic_weight: z.number().int().min(1),  // Quadratic voting weight (tokens^2)
  created_at: z.string().datetime(),
});
export type Vote = z.infer<typeof VoteSchema>;

export const CreateVoteSchema = z.object({
  proposal_id: z.string().uuid(),
  support: z.boolean(),
  tokens: z.number().int().min(1).max(10).default(1),
});
export type CreateVoteInput = z.infer<typeof CreateVoteSchema>;

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

// ============================================
// Moderation Types
// ============================================

export const ReportReasonSchema = z.enum(['spam', 'harassment', 'misinformation', 'violence', 'other']);
export type ReportReason = z.infer<typeof ReportReasonSchema>;

export const ReportStatusSchema = z.enum(['pending', 'reviewed', 'dismissed', 'actioned']);
export type ReportStatus = z.infer<typeof ReportStatusSchema>;

export const ReportSchema = z.object({
  id: z.string().uuid(),
  reporter_id: z.string().uuid(),
  content_type: z.enum(['contribution', 'proposal', 'branch']),
  content_id: z.string().uuid(),
  reason: ReportReasonSchema,
  evidence: z.string().nullable(),
  status: ReportStatusSchema,
  created_at: z.string().datetime(),
  resolved_at: z.string().datetime().nullable(),
});
export type Report = z.infer<typeof ReportSchema>;

export const CreateReportSchema = z.object({
  content_type: z.enum(['contribution', 'proposal', 'branch']),
  content_id: z.string().uuid(),
  reason: ReportReasonSchema,
  evidence: z.string().max(1000).optional(),
});
export type CreateReportInput = z.infer<typeof CreateReportSchema>;

export const WarningSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  report_id: z.string().uuid(),
  reason: z.string(),
  severity: z.enum(['minor', 'major', 'severe']),
  created_at: z.string().datetime(),
});
export type Warning = z.infer<typeof WarningSchema>;
