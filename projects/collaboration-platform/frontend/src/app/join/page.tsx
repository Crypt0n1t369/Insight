import { redirect } from 'next/navigation';

async function createUser(formData: FormData) {
  'use server';
  
  const username = formData.get('username') as string;
  const displayName = formData.get('displayName') as string;
  
  try {
    const res = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        display_name: displayName,
        anonymous: true
      }),
    });
    
    if (res.ok) {
      const data = await res.json();
      // Store user ID in cookie/redirect
      redirect('/profile');
    }
  } catch (error) {
    console.error('Failed to create user:', error);
  }
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
