import { getSupabase, json, error } from '../../_lib/supabase';

// GET /api/users/leaderboard - Get top users by credibility
export async function GET() {
  const supabase = await getSupabase();
  
  // Get users with their contribution counts
  const usersResult = await supabase
    .from('users')
    .select('id, anonymous_id, display_name, avatar_seed, trust_tier, credibility_score');
  
  if (usersResult.error) {
    return error('Failed to fetch users: ' + usersResult.error.message);
  }
  
  // Get all contributions with their endorsement counts
  const contribsResult = await supabase
    .from('contributions')
    .select('id, author_id');
  
  if (contribsResult.error) {
    return error('Failed to fetch contributions: ' + contribsResult.error.message);
  }
  
  // Get all endorsements
  const endorsementsResult = await supabase
    .from('endorsements')
    .select('contribution_id');
  
  if (endorsementsResult.error) {
    return error('Failed to fetch endorsements: ' + endorsementsResult.error.message);
  }
  
  // Build endorsement count per contribution
  const endorsementCounts: Record<string, number> = {};
  for (const e of (endorsementsResult.data || [])) {
    endorsementCounts[e.contribution_id] = (endorsementCounts[e.contribution_id] || 0) + 1;
  }
  
  // Calculate total endorsements per user (sum of endorsements on their contributions)
  const userEndorsements: Record<string, number> = {};
  for (const c of (contribsResult.data || [])) {
    if (c.author_id && endorsementCounts[c.id]) {
      userEndorsements[c.author_id] = (userEndorsements[c.author_id] || 0) + endorsementCounts[c.id];
    }
  }
  
  // Map to expected format for frontend
  const leaderboard = (usersResult.data || []).map((user, index) => ({
    id: user.id,
    username: user.display_name || user.anonymous_id?.substring(0, 8) || `User ${index + 1}`,
    credibility: user.credibility_score || 0,
    trustTier: user.trust_tier || 'newcomer',
    totalEndorsements: userEndorsements[user.id] || 0,
  }));
  
  // Sort by credibility score
  leaderboard.sort((a, b) => b.credibility - a.credibility);
  
  return json({ success: true, data: leaderboard.slice(0, 50) });
}
