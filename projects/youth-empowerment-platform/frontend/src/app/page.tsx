import Link from 'next/link';

async function getStats() {
  try {
    const res = await fetch('http://localhost:3000/api/stats', { 
      cache: 'no-store' 
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getBranches() {
  try {
    const res = await fetch('http://localhost:3000/api/branches', { 
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const statsData = await getStats();
  const branches = await getBranches();
  
  const stats = statsData?.data || { users: 0, branches: 0, contributions: 0 };

  return (
    <div className="container">
      <section className="hero" style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to Credo</h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Distributed collaboration with credibility-based reputation
        </p>
        <Link href="/join" className="btn btn-primary">
          Get Started
        </Link>
      </section>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-value">{stats.users}</div>
          <div className="stat-label">Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.branches}</div>
          <div className="stat-label">Branches</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.contributions}</div>
          <div className="stat-label">Contributions</div>
        </div>
      </section>

      <section className="branches">
        <h3 style={{ marginBottom: '1rem' }}>Explore Branches</h3>
        {branches.length > 0 ? (
          <div className="branch-list">
            {branches.map((branch: any) => (
              <div key={branch.id} className="card">
                <h4>{branch.title}</h4>
                <p>{branch.description || 'No description'}</p>
                <Link href={`/branches/${branch.id}`} style={{ color: 'var(--accent)' }}>
                  View Branch →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>No branches yet. Be the first to create one!</p>
            <Link href="/branches/new" className="btn btn-primary">
              Create First Branch
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
