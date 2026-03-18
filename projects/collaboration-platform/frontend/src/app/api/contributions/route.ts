import { getSupabase, json, error } from '../_lib/supabase';

// GET /api/contributions?branch_id=xxx - List contributions for a branch
export async function GET(request: Request) {
  const supabase = await getSupabase();
  const { searchParams } = new URL(request.url);
  const branch_id = searchParams.get('branch_id');
  
  let query = supabase
    .from('contributions')
    .select(`
      *,
      author:users!contributions_author_id_fkey(id, display_name, avatar_seed, trust_tier)
    `)
    .order('created_at', { ascending: false });
  
  if (branch_id) {
    query = query.eq('branch_id', branch_id);
  }
  
  const { data, error: err } = await query.limit(100);
  
  if (err) {
    return error('Failed to fetch contributions: ' + err.message);
  }
  
  return json({ data });
}

// POST /api/contributions - Create contribution
export async function POST(request: Request) {
  const supabase = await getSupabase();
  
  try {
    const body = await request.json();
    const { branch_id, author_id, type, content, parent_id } = body;
    
    if (!branch_id || !author_id || !type || !content) {
      return error('Missing required fields');
    }
    
    const { data, error: err } = await supabase
      .from('contributions')
      .insert({
        branch_id,
        author_id,
        type,
        content,
        parent_id: parent_id || null,
        endorsement_count: 0,
        reply_count: 0,
        weight: 1,
        is_flagged: false,
      })
      .select()
      .single();
    
    if (err) {
      return error('Failed to create contribution: ' + err.message);
    }
    
    // Update branch stats
    await supabase.rpc('increment_branch_stats', { branch_id });
    
    return json({ data }, 201);
  } catch (e) {
    return error('Invalid request');
  }
}
