'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function ContributePage() {
  const router = useRouter();
  const params = useParams();
  const branchId = params.id as string;
  
  const [formData, setFormData] = useState({
    userId: '',
    type: 'idea',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/contributions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': formData.userId,
        },
        body: JSON.stringify({
          branch_id: branchId,
          type: formData.type,
          content: formData.content,
        }),
      });

      if (res.ok) {
        router.push(`/branches/${branchId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create contribution');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <Link 
        href={`/branches/${branchId}`} 
        style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'inline-block' }}
      >
        ← Back to Branch
      </Link>
      
      <h1 style={{ marginBottom: '1.5rem' }}>Add Contribution</h1>
      
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>
          Share your ideas, questions, resources, or comments with this branch.
        </p>
      </div>

      {error && (
        <div className="card" style={{ background: 'var(--error-bg)', color: 'var(--error)', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor="userId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Your User ID *
          </label>
          <input
            type="text"
            id="userId"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            required
            placeholder="Enter your user ID (from profile page)"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Get your ID from the <Link href="/profile" style={{ color: 'var(--accent)' }}>profile page</Link>
          </p>
        </div>
        
        <div>
          <label htmlFor="type" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Contribution Type *
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          >
            <option value="idea">💡 Idea</option>
            <option value="comment">💬 Comment</option>
            <option value="question">❓ Question</option>
            <option value="resource">📚 Resource</option>
            <option value="synthesis">🔗 Synthesis</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Your Contribution *
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows={8}
            placeholder="Share your thoughts..."
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', resize: 'vertical' }}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? 'Submitting...' : 'Submit Contribution'}
        </button>
      </form>
    </div>
  );
}
