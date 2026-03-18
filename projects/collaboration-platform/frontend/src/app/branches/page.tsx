import Link from 'next/link';

async function getBranches() {
  try {
    const res = await fetch('/api/branches', { 
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function BranchesPage() {
  const branches = await getBranches();
  
  return (
    <div className="container" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Branches</h1>
        <Link href="/branches/new" className="btn btn-primary">
          Create Branch
        </Link>
      </div>
      
      {branches.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {branches.map((branch: any) => (
            <Link 
              key={branch.id} 
              href={`/branches/${branch.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ cursor: 'pointer' }}>
                <h3>{branch.title || 'Untitled Branch'}</h3>
                <p>{branch.description || 'No description'}</p>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Status: {branch.status}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No branches yet. Be the first to create one!</p>
      )}
    </div>
  );
}
