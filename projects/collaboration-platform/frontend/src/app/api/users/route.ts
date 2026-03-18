import { getSupabase, json, error, notFound } from '../_lib/supabase';
import { randomBytes, createHash } from 'crypto';

function generateAnonymousId(): string {
  const random = randomBytes(32).toString('hex');
  return createHash('sha256').update(random).digest('hex').substring(0, 16);
}

// GET /api/users - List users or get single user by id
export async function GET(request: Request) {
  const supabase = await getSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    // Get single user
    const { data, error: err } = await supabase
      .from('users')
      .select('id, anonymous_id, display_name, avatar_seed, trust_tier, credibility_score, created_at')
      .eq('id', id)
      .limit(1);
    
    if (err) {
      return error('Failed to fetch user: ' + err.message);
    }
    
    return json({ data });
  }
  
  // List all users
  const { data, error: err } = await supabase
    .from('users')
    .select('id, anonymous_id, display_name, avatar_seed, trust_tier, credibility_score, created_at')
    .order('credibility_score', { ascending: false })
    .limit(100);
  
  if (err) {
    return error('Failed to fetch users: ' + err.message);
  }
  
  return json({ data });
}

// POST /api/users - Create anonymous user
export async function POST(request: Request) {
  const supabase = await getSupabase();
  
  try {
    const body = await request.json();
    const { display_name } = body;
    
    const anonymous_id = generateAnonymousId();
    const avatar_seed = generateAnonymousId();
    
    const { data, error: err } = await supabase
      .from('users')
      .insert({
        anonymous_id,
        display_name: display_name || null,
        avatar_seed,
        trust_tier: 'newcomer',
        credibility_score: 0,
      })
      .select()
      .single();
    
    if (err) {
      return error('Failed to create user: ' + err.message);
    }
    
    return json({ data }, 201);
  } catch (e) {
    return error('Invalid request');
  }
}
