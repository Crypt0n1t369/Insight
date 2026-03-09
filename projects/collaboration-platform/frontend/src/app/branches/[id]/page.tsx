import Link from 'next/link';

async function getBranch(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/branches/${id}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

async function getBranchContributions(branchId: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/branches/${branchId}/contributions`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function getBranchTree(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/branches/${id}/tree`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export default async function BranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const branch = await getBranch(id);
  const contributions = await getBranchContributions(id);
  const tree = await getBranchTree(id);
  
  if (!branch) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <h1>Branch not found</h1>
        <Link href="/branches" className="btn">← Back to Branches</Link>
      </div>
    );
  }
  
  return (
    <div className="container" style={{ padding: '2rem' }}>
      <Link href="/branches" style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Branches
      </Link>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h1>{branch.title}</h1>
        <p>{branch.description}</p>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Status: {branch.status} | Created: {new Date(branch.created_at).toLocaleDateString()}
        </div>
      </div>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Branch Tree</h2>
        {tree ? (
          <div className="card">
            <pre style={{ overflow: 'auto', fontSize: '0.875rem' }}>
              {JSON.stringify(tree, null, 2)}
            </pre>
          </div>
        ) : (
          <p>No child branches</p>
        )}
      </section>
      
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Contributions</h2>
          <Link href={`/branches/${id}/contribute`} className="btn btn-primary">
            Add Contribution
          </Link>
        </div>
        
        {contributions.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {contributions.map((contribution: any) => (
              <div key={contribution.id} className="card">
                <h3>{contribution.title}</h3>
                <p>{contribution.content}</p>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Type: {contribution.type} | Endorsements: {contribution.endorsements || 0}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No contributions yet. Be the first to add one!</p>
        )}
      </section>
    </div>
  );
}
