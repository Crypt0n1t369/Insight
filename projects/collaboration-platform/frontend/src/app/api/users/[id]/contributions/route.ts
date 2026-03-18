import { getSupabase, json, error } from '../../../_lib/supabase';

// GET /api/users/[id]/contributions - Get user's contributions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await getSupabase();
  const { id } = await params;
  
  const result = await supabase
    .from('contributions')
    .select('id, branch_id, type, content, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (result.error) {
    return error('Failed to fetch contributions: ' + result.error.message);
  }
  
  // Get endorsement counts for each contribution
  const { data: endorsements } = await supabase
    .from('endorsements')
    .select('contribution_id, value');
  
  const contribWithEndorsements = (result.data || []).map(contrib => {
    const contribEndorsements = endorsements?.filter(e => e.contribution_id === contrib.id) || [];
    const total = contribEndorsements.reduce((sum, e) => sum + (e.value || 1), 0);
    return {
      ...contrib,
      endorsements: total,
    };
  });
  
  return json({ data: contribWithEndorsements });
}
