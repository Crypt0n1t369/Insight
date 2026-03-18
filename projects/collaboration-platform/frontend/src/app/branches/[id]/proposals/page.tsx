'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Proposal {
  id: string;
  title: string;
  content: string;
  type: 'branch' | 'membership' | 'governance' | 'resource';
  status: 'open' | 'accepted' | 'rejected' | 'withdrawn';
  author_id: string;
  votes_for: number;
  votes_against: number;
  created_at: string;
  closed_at: string | null;
}

async function getProposals(branchId: string): Promise<Proposal[]> {
  try {
    const res = await fetch(`/api/branches/${branchId}/proposals`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function getBranch(id: string): Promise<{ id: string; title: string } | null> {
  try {
    const res = await fetch(`/api/branches/${id}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    open: { bg: '#c6f6d5', text: '#22543d' },
    accepted: { bg: '#bee3f8', text: '#2a4365' },
    rejected: { bg: '#fed7d7', text: '#742a2a' },
    withdrawn: { bg: '#e2e8f0', text: '#4a5568' }
  };
  const { bg, text } = colors[status] || colors.open;
  
  return (
    <span style={{ 
      background: bg, 
      color: text, 
      padding: '0.25rem 0.5rem', 
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      textTransform: 'uppercase'
    }}>
      {status}
    </span>
  );
}

function ProposalCard({ proposal, userId, onVote }: { 
  proposal: Proposal; 
  userId: string;
  onVote: (id: string, support: boolean) => void;
}) {
  const [voting, setVoting] = useState(false);
  
  const handleVote = async (support: boolean) => {
    if (!userId || voting) return;
    setVoting(true);
    await onVote(proposal.id, support);
    setVoting(false);
  };

  const typeLabels: Record<string, string> = {
    branch: 'Branch',
    membership: 'Membership',
    governance: 'Governance',
    resource: 'Resource'
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div>
          <h3>{proposal.title}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {typeLabels[proposal.type] || proposal.type}
          </span>
        </div>
        <StatusBadge status={proposal.status} />
      </div>
      <p style={{ marginBottom: '1rem' }}>{proposal.content}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <span>by {proposal.author_id.slice(0, 8)}...</span>
          <span style={{ margin: '0 0.5rem' }}>•</span>
          <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ {proposal.votes_for}</span>
            <span style={{ margin: '0 0.5rem' }}>|</span>
            <span style={{ color: 'var(--error)', fontWeight: 'bold' }}>✗ {proposal.votes_against}</span>
          </div>
          
          {userId && proposal.status === 'open' && (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button 
                onClick={() => handleVote(true)}
                disabled={voting}
                className="btn"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--success)', color: 'white' }}
              >
                ✓ For
              </button>
              <button 
                onClick={() => handleVote(false)}
                disabled={voting}
                className="btn"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--error)', color: 'white' }}
              >
                ✗ Against
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProposalsPage({ params }: { params: Promise<{ id: string }> }) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [branch, setBranch] = useState<{ id: string; title: string } | null>(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params;
      const [proposalsData, branchData] = await Promise.all([
        getProposals(id),
        getBranch(id)
      ]);
      setProposals(proposalsData);
      setBranch(branchData);
      
      const savedUserId = localStorage.getItem('credo_user_id');
      if (savedUserId) setUserId(savedUserId);
      
      setLoading(false);
    };
    loadData();
  }, [params]);

  const handleVote = async (proposalId: string, support: boolean) => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId 
        },
        body: JSON.stringify({ support, tokens: 1 })
      });
      if (res.ok) {
        // Reload proposals to get updated vote counts
        const { id } = await params;
        const updated = await getProposals(id);
        setProposals(updated);
      }
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="container" style={{ padding: '2rem' }}>
      <Link href={`/branches/${branch?.id}`} style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to {branch?.title || 'Branch'}
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Proposals</h1>
        <Link href={`/branches/${branch?.id}/proposals/new`} className="btn btn-primary">
          + New Proposal
        </Link>
      </div>

      {/* User ID Input for Voting */}
      {!userId && (
        <div className="card" style={{ marginBottom: '2rem', background: 'var(--bg-secondary)' }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            💡 <Link href="/profile" style={{ color: 'var(--accent)' }}>Create an identity</Link> to vote on proposals
          </p>
        </div>
      )}
      
      {proposals.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {proposals.map((proposal) => (
            <ProposalCard 
              key={proposal.id} 
              proposal={proposal} 
              userId={userId}
              onVote={handleVote}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>No proposals yet.</p>
          {userId && (
            <Link href={`/branches/${branch?.id}/proposals/new`} className="btn btn-primary">
              Create First Proposal
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
