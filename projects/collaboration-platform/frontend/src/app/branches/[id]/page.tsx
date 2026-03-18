'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Branch {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface Contribution {
  id: string;
  title: string;
  content: string;
  type: string;
  endorsements: number;
  user_id: string;
}

interface BranchTree {
  id: string;
  title: string;
  children?: BranchTree[];
}

async function getBranch(id: string): Promise<Branch | null> {
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

async function getBranchContributions(branchId: string): Promise<Contribution[]> {
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

async function getBranchTree(id: string): Promise<BranchTree | null> {
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

function TreeView({ tree, level = 0 }: { tree: BranchTree; level?: number }) {
  return (
    <div style={{ marginLeft: level * 20 }}>
      <div style={{ 
        padding: '0.5rem', 
        margin: '0.25rem 0',
        background: level === 0 ? 'var(--accent)' : 'var(--bg-secondary)',
        color: level === 0 ? 'white' : 'inherit',
        borderRadius: '4px',
        display: 'inline-block'
      }}>
        📂 {tree.title}
      </div>
      {tree.children && tree.children.length > 0 && (
        <div>
          {tree.children.map(child => (
            <TreeView key={child.id} tree={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContributionCard({ contribution, userId, onEndorse }: { 
  contribution: Contribution; 
  userId: string;
  onEndorse: (id: string) => void;
}) {
  const [endorsing, setEndorsing] = useState(false);
  
  const typeEmoji: Record<string, string> = {
    idea: '💡',
    comment: '💬',
    question: '❓',
    resource: '📚',
    synthesis: '🔗'
  };

  const handleEndorse = async () => {
    if (!userId || endorsing) return;
    setEndorsing(true);
    await onEndorse(contribution.id);
    setEndorsing(false);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3>{typeEmoji[contribution.type] || '📝'} {contribution.title}</h3>
        <span style={{ 
          background: 'var(--bg-secondary)', 
          padding: '0.25rem 0.5rem', 
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          {contribution.type}
        </span>
      </div>
      <p>{contribution.content}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {contribution.user_id && (
            <span>User: <code>{contribution.user_id.slice(0, 8)}...</code></span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>👍 {contribution.endorsements || 0}</span>
          {userId && (
            <button 
              onClick={handleEndorse}
              disabled={endorsing}
              className="btn"
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
            >
              {endorsing ? '...' : 'Endorse'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BranchPage({ params }: { params: Promise<{ id: string }> }) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [tree, setTree] = useState<BranchTree | null>(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params;
      const [branchData, contribData, treeData] = await Promise.all([
        getBranch(id),
        getBranchContributions(id),
        getBranchTree(id)
      ]);
      setBranch(branchData);
      setContributions(contribData);
      setTree(treeData);
      
      // Load saved user ID
      const savedUserId = localStorage.getItem('credo_user_id');
      if (savedUserId) setUserId(savedUserId);
      
      setLoading(false);
    };
    loadData();
  }, [params]);

  const handleEndorse = async (contributionId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/contributions/${contributionId}/endorse`, {
        method: 'POST',
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        // Update local state
        setContributions(prev => prev.map(c => 
          c.id === contributionId 
            ? { ...c, endorsements: (c.endorsements || 0) + 1 }
            : c
        ));
      }
    } catch (err) {
      console.error('Failed to endorse:', err);
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

      {/* User ID Input for Endorsements */}
      {!userId && (
        <div className="card" style={{ marginBottom: '2rem', background: 'var(--bg-secondary)' }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            💡 <Link href="/profile" style={{ color: 'var(--accent)' }}>Create an identity</Link> to endorse contributions
          </p>
        </div>
      )}
      
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Branch Tree</h2>
        {tree ? (
          <TreeView tree={tree} />
        ) : (
          <p>No child branches</p>
        )}
      </section>
      
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Contributions</h2>
          <Link href={`/branches/${branch.id}/contribute`} className="btn btn-primary">
            Add Contribution
          </Link>
        </div>
        
        {contributions.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {contributions.map((contribution) => (
              <ContributionCard 
                key={contribution.id} 
                contribution={contribution} 
                userId={userId}
                onEndorse={handleEndorse}
              />
            ))}
          </div>
        ) : (
          <p>No contributions yet. Be the first to add one!</p>
        )}
      </section>

      {/* Proposals Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Proposals</h2>
          <Link href={`/branches/${branch.id}/proposals`} className="btn">
            View Proposals →
          </Link>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          Proposals allow branch members to vote on important decisions.
        </p>
      </section>
    </div>
  );
}
