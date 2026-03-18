import { getSupabase, json, error } from '../../_lib/supabase';

// GET /api/users/leaderboard - Get top users by credibility
export async function GET() {
  const supabase = await getSupabase();
  
  const result = await supabase
    .from('users')
    .select('id, anonymous_id, display_name, avatar_seed, trust_tier, credibility_score')
    .order('credibility_score', { ascending: false })
    .limit(50);
  
  if (result.error) {
    return error('Failed to fetch leaderboard: ' + result.error.message);
  }
  
  // Map to expected format for frontend
  const leaderboard = (result.data || []).map((user, index) => ({
    id: user.id,
    username: user.display_name || user.anonymous_id?.substring(0, 8) || `User ${index + 1}`,
    credibility: user.credibility_score || 0,
    trustTier: user.trust_tier || 'newcomer',
    totalEndorsements: 0, // TODO: count from endorsements table
  }));
  
  return json({ success: true, data: leaderboard });
}
