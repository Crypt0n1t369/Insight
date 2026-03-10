'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Branch {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export default function NewBranchPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load saved user ID
    const savedUserId = localStorage.getItem('credo_user_id');
    if (savedUserId) {
      setUserId(savedUserId);
      fetchUser(savedUserId);
    }
    
    // Load existing branches for parent selection
    fetchBranches();
  }, []);

  const fetchUser = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch user');
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/branches');
      if (res.ok) {
        const data = await res.json();
        setBranches(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch branches');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError('Please log in first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          title,
          description,
          parent_id: parentId || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/branches/${data.data.id}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create branch');
      }
    } catch (err) {
      setError('Failed to create branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <Link href="/branches" style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Branches
      </Link>
      
      <h1>Create New Branch</h1>
      
      {!userId ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Sign In Required</h3>
          <p>You need to be signed in to create a branch.</p>
          <Link href="/profile" className="btn btn-primary">
            Go to Profile
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Creating as: <strong>{user?.display_name || userId}</strong>
            </p>
          </div>
          
          {error && (
            <div style={{ 
              background: 'var(--error)', 
              color: 'white', 
              padding: '0.75rem', 
              borderRadius: '8px',
              marginBottom: '1rem' 
            }}>
              {error}
            </div>
          )}
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Branch Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="What is this branch about?"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the purpose of this branch..."
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', resize: 'vertical' }}
            />
          </div>
          
          {branches.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="parent" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Parent Branch (Optional)
              </label>
              <select
                id="parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
              >
                <option value="">None (root branch)</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.title}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Select a parent if this branch should be a sub-branch
              </p>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading || !title.trim()}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Creating...' : 'Create Branch'}
          </button>
        </form>
      )}
    </div>
  );
}
