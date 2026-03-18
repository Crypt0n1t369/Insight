import { getSupabase, json, error } from '../_lib/supabase';

// GET /api/branches - List branches
export async function GET() {
  const supabase = await getSupabase();
  
  const { data, error: err } = await supabase
    .from('branches')
    .select(`
      *,
      creator:users!branches_creator_id_fkey(id, display_name, avatar_seed, trust_tier)
    `)
    .order('last_activity_at', { ascending: false })
    .limit(50);
  
  if (err) {
    return error('Failed to fetch branches: ' + err.message);
  }
  
  return json({ data });
}

// POST /api/branches - Create branch
export async function POST(request: Request) {
  const supabase = await getSupabase();
  
  try {
    const body = await request.json();
    const { title, description, creator_id } = body;
    
    if (!title || title.length < 3) {
      return error('Title must be at least 3 characters');
    }
    
    if (!creator_id) {
      return error('Creator ID required');
    }
    
    const { data, error: err } = await supabase
      .from('branches')
      .insert({
        title,
        description: description || null,
        creator_id,
        status: 'active',
        contribution_count: 0,
        contributor_count: 0,
      })
      .select()
      .single();
    
    if (err) {
      return error('Failed to create branch: ' + err.message);
    }
    
    return json({ data }, 201);
  } catch (e) {
    return error('Invalid request');
  }
}
