import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

async function createUser(formData: FormData) {
  'use server';
  
  const username = formData.get('username') as string;
  const displayName = formData.get('displayName') as string;
  
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        username,
        display_name: displayName,
        anonymous_id: Math.random().toString(36).substring(2),
        avatar_seed: Math.random().toString(36).substring(2),
        trust_tier: 'newcomer',
        credibility_score: 0
      }),
    });
    
    if (res.ok) {
      const data = await res.json();
      const userId = data[0]?.id;
      
      if (userId) {
        // Set cookie with user ID
        (await cookies()).set('credo_user_id', userId, { 
          httpOnly: false, 
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        });
        redirect('/profile?new=true');
      }
    }
  } catch (error) {
    console.error('Failed to create user:', error);
  }
  redirect('/join?error=1');
}

export default function JoinPage() {
  return (
    <div className="container" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Join Credo</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        Create an anonymous identity to start collaborating with credibility.
      </p>
      
      <form action={createUser} method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            placeholder="Choose a username"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
        </div>
        
        <div>
          <label htmlFor="displayName" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            required
            placeholder="How should we call you?"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Create Identity
        </button>
      </form>
      
      <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        🔒 Your identity is anonymous. No email required.
      </p>
    </div>
  );
}
