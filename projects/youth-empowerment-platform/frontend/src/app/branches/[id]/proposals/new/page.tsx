'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

async function getBranch(id: string): Promise<{ id: string; title: string } | null> {
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

export default function NewProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [branch, setBranch] = useState<{ id: string; title: string } | null>(null);
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [proposalType, setProposalType] = useState<'governance' | 'branch' | 'membership' | 'resource'>('governance');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params;
      const branchData = await getBranch(id);
      setBranch(branchData);
      
      const savedUserId = localStorage.getItem('credo_user_id');
      if (savedUserId) {
        setUserId(savedUserId);
      }
      setLoading(false);
    };
    loadData();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError('Please create an identity first');
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { id: branchId } = await params;
      const res = await fetch('http://localhost:3000/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          branch_id: branchId,
          type: proposalType,
          title: title.trim(),
          content: content.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/branches/${branchId}/proposals`);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to create proposal');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <h1>Branch not found</h1>
        <Link href="/branches" className="btn">← Back to Branches</Link>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <Link href={`/branches/${branch.id}/proposals`} style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'inline-block' }}>
          ← Back to Proposals
        </Link>
        
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Identity Required</h2>
          <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>
            You need to create an identity before creating proposals.
          </p>
          <Link href="/profile" className="btn btn-primary">
            Create Identity
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <Link href={`/branches/${branch.id}/proposals`} style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Proposals
      </Link>
      
      <h1 style={{ marginBottom: '2rem' }}>New Proposal</h1>
      <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        Branch: <strong>{branch.title}</strong>
      </p>

      {error && (
        <div style={{ 
          background: 'var(--error)', 
          color: 'white', 
          padding: '0.75rem 1rem', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A clear, concise title for your proposal"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              background: 'var(--background)',
              color: 'var(--text)'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="type" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Type
          </label>
          <select
            id="type"
            value={proposalType}
            onChange={(e) => setProposalType(e.target.value as any)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              background: 'var(--background)',
              color: 'var(--text)'
            }}
          >
            <option value="governance">Governance - Decision making & rules</option>
            <option value="branch">Branch - New sub-branch creation</option>
            <option value="membership">Membership - Add/remove members</option>
            <option value="resource">Resource - Budget & resource allocation</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your proposal in detail. What problem does it solve? What is the proposed solution?"
            rows={6}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              background: 'var(--background)',
              color: 'var(--text)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Link 
            href={`/branches/${branch.id}/proposals`} 
            className="btn"
            style={{ background: 'var(--bg-secondary)' }}
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Proposal'}
          </button>
        </div>
      </form>

      <div className="card" style={{ marginTop: '2rem', background: 'var(--bg-secondary)' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>💡 Tips for Good Proposals</h3>
        <ul style={{ marginLeft: '1.5rem', color: 'var(--text-muted)' }}>
          <li>Be specific about what you're proposing</li>
          <li>Explain the problem your proposal addresses</li>
          <li>Consider potential objections and address them</li>
          <li>Keep it focused - one proposal per issue</li>
        </ul>
      </div>
    </div>
  );
}
