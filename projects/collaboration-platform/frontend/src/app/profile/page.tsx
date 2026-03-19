'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  display_name: string;
  credibility: number;
  trust_tier: string;
  contributions_count: number;
  endorsements_received: number;
}

interface Contribution {
  id: string;
  branch_id: string;
  type: 'idea' | 'comment' | 'question' | 'resource' | 'synthesis';
  content: string;
  endorsements: number;
  created_at: string;
}

export default function ProfilePage() {
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [creating, setCreating] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loadingContribs, setLoadingContribs] = useState(false);

  // Load saved user ID from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('credo_user_id');
    if (savedUserId) {
      setUserId(savedUserId);
      fetchUser(savedUserId);
    }
  }, []);

  const fetchUser = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        // Map API fields to frontend interface
        const u = data.data;
        setUser({
          ...u,
          username: u.username || u.anonymous_id?.slice(0, 8) || 'anonymous',
          display_name: u.display_name || 'Anonymous',
          credibility: u.credibility_score || u.credibility || 0,
          trust_tier: u.trust_tier || 'newcomer',
          contributions_count: u.contributions_count || 0,
          endorsements_received: u.endorsements_received || 0
        });
        // Fetch user's contributions
        fetchContributions(id);
      } else {
        setError('User not found');
        setUser(null);
      }
    } catch (err) {
      setError('Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  const fetchContributions = async (userId: string) => {
    setLoadingContribs(true);
    try {
      const res = await fetch(`/api/users/${userId}/contributions`);
      if (res.ok) {
        const data = await res.json();
        setContributions(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch contributions');
    } finally {
      setLoadingContribs(false);
    }
  };

  const handleLoadUser = () => {
    if (userId.trim()) {
      localStorage.setItem('credo_user_id', userId);
      fetchUser(userId);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          display_name: newDisplayName,
          anonymous: true
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const createdUser = data.data;
        setUser(createdUser);
        setUserId(createdUser.id);
        localStorage.setItem('credo_user_id', createdUser.id);
        setNewUsername('');
        setNewDisplayName('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('credo_user_id');
    setUserId('');
    setUser(null);
  };

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Your Profile</h1>
      
      {!user ? (
        <>
          {/* Login Section */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Load Existing User</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your User ID"
                style={{ flex: 1, padding: '0.75rem', fontSize: '1rem' }}
              />
              <button 
                onClick={handleLoadUser}
                disabled={loading || !userId.trim()}
                className="btn btn-primary"
              >
                {loading ? 'Loading...' : 'Load'}
              </button>
            </div>
            {error && <p style={{ color: 'var(--error)', marginTop: '0.5rem' }}>{error}</p>}
          </div>
          
          {/* Create User Section */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Create New Identity</h3>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
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
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  required
                  placeholder="How should we call you?"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                />
              </div>
              <button type="submit" disabled={creating} className="btn btn-primary">
                {creating ? 'Creating...' : 'Create Identity'}
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          {/* User Profile */}
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
                fontWeight: 'bold',
                color: 'white'
              }}>
                {user.display_name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{user.display_name}</h2>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>@{user.username}</p>
              </div>
            </div>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px' }}>
              <code style={{ fontSize: '0.875rem', wordBreak: 'break-all' }}>
                User ID: {user.id}
              </code>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                Save this ID to access your profile from another device
              </p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="stat-card">
              <div className="stat-value">{user.credibility?.toFixed(1) || '0.0'}</div>
              <div className="stat-label">Credibility</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">Tier {user.trust_tier || 1}</div>
              <div className="stat-label">Trust Tier</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.contributions_count || 0}</div>
              <div className="stat-label">Contributions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.endorsements_received || 0}</div>
              <div className="stat-label">Endorsements</div>
            </div>
          </div>
          
          {/* User's Contributions */}
          <div style={{ marginTop: '1.5rem' }}>
            <h3>Your Contributions</h3>
            {loadingContribs ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
            ) : contributions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No contributions yet. Browse branches to add your first idea!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {contributions.map((contrib) => (
                  <div key={contrib.id} className="card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        background: 'var(--accent)', 
                        color: 'white', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        textTransform: 'capitalize'
                      }}>
                        {contrib.type}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {contrib.endorsements} endorsements
                      </span>
                    </div>
                    <p style={{ margin: 0 }}>{contrib.content}</p>
                    <Link 
                      href={`/branches/${contrib.branch_id}`}
                      style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.5rem', display: 'inline-block' }}
                    >
                      View in branch →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <Link href="/branches" className="btn" style={{ flex: 1, textAlign: 'center' }}>
              Browse Branches
            </Link>
            <button onClick={handleLogout} className="btn" style={{ background: 'var(--error)' }}>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
