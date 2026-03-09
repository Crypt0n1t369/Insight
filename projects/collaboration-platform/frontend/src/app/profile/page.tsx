export default function ProfilePage() {
  // In a real implementation, this would get the user from a cookie/session
  // For now, show a placeholder
  
  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Your Profile</h1>
      
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            ?
          </div>
          <div>
            <h2 style={{ margin: 0 }}>Anonymous User</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Not signed in</p>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-value">-</div>
          <div className="stat-label">Credibility</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">-</div>
          <div className="stat-label">Trust Tier</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">-</div>
          <div className="stat-label">Contributions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">-</div>
          <div className="stat-label">Endorsements</div>
        </div>
      </div>
      
      <p style={{ marginTop: '2rem', textAlign: 'center' }}>
        <a href="/join" className="btn btn-primary">Sign In / Join</a>
      </p>
    </div>
  );
}
