import { getSupabase, json, error } from '../_lib/supabase';

// GET /api/proposals?branch_id=xxx - List proposals
export async function GET(request: Request) {
  const supabase = await getSupabase();
  const { searchParams } = new URL(request.url);
  const branch_id = searchParams.get('branch_id');
  
  let query = supabase
    .from('proposals')
    .select(`
      *,
      author:users!proposals_author_id_fkey(id, display_name, avatar_seed, trust_tier)
    `)
    .order('created_at', { ascending: false });
  
  if (branch_id) {
    query = query.eq('branch_id', branch_id);
  }
  
  const { data, error: err } = await query.limit(50);
  
  if (err) {
    return error('Failed to fetch proposals: ' + err.message);
  }
  
  return json({ data });
}

// POST /api/proposals - Create proposal
export async function POST(request: Request) {
  const supabase = await getSupabase();
  
  try {
    const body = await request.json();
    const { branch_id, author_id, type, title, content } = body;
    
    if (!branch_id || !author_id || !type || !title || !content) {
      return error('Missing required fields');
    }
    
    const { data, error: err } = await supabase
      .from('proposals')
      .insert({
        branch_id,
        author_id,
        type,
        title,
        content,
        status: 'open',
        votes_for: 0,
        votes_against: 0,
        tokens_staked: 0,
      })
      .select()
      .single();
    
    if (err) {
      return error('Failed to create proposal: ' + err.message);
    }
    
    return json({ data }, 201);
  } catch (e) {
    return error('Invalid request');
  }
}
