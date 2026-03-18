import { getSupabase, json, error } from '../../../_lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await getSupabase();
  
  try {
    const body = await request.json();
    const { voter_id, support, tokens } = body;
    
    if (voter_id === undefined || support === undefined) {
      return error('Missing required fields');
    }
    
    // Insert vote
    const { data: vote, error: voteErr } = await supabase
      .from('votes')
      .upsert({
        proposal_id: id,
        voter_id,
        support,
        tokens: tokens || 1,
      }, { onConflict: 'proposal_id,voter_id' })
      .select()
      .single();
    
    if (voteErr) {
      return error('Failed to record vote: ' + voteErr.message);
    }
    
    // Update proposal vote counts
    const { data: proposal } = await supabase
      .from('proposals')
      .select('votes_for, votes_against')
      .eq('id', id)
      .single();
    
    if (proposal) {
      const update = support 
        ? { votes_for: proposal.votes_for + (tokens || 1) }
        : { votes_against: proposal.votes_against + (tokens || 1) };
      
      await supabase
        .from('proposals')
        .update(update)
        .eq('id', id);
    }
    
    return json({ data: vote });
  } catch (e) {
    return error('Invalid request');
  }
}
