import { getSupabase, json, error, notFound } from '../../_lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await getSupabase();
  
  const { data, error: err } = await supabase
    .from('branches')
    .select(`
      *,
      creator:users!branches_creator_id_fkey(id, display_name, avatar_seed, trust_tier)
    `)
    .eq('id', id)
    .single();
  
  if (err || !data) {
    return notFound('Branch not found');
  }
  
  return json({ data });
}
