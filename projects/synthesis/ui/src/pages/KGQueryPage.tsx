import { useState } from 'react';
import { queryKG, type KGQuery, type KGNode, type KGEdge } from '../api/client';

export function KGQueryPage() {
  const [query, setQuery] = useState<KGQuery>({ limit: 20 });
  const [result, setResult] = useState<{ nodes: KGNode[]; edges: KGEdge[]; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runQuery() {
    setLoading(true);
    setError(null);
    try {
      const res = await queryKG(query);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '16px' }}>Knowledge Graph</h2>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          value={query.type ?? ''}
          onChange={(e) => setQuery({ ...query, type: e.target.value || undefined })}
          placeholder="type (e.g. protocol, session)"
          style={{
            padding: '8px 12px',
            background: '#161616',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            color: '#e0e0e0',
            fontSize: '0.875rem',
            width: '200px',
          }}
        />
        <input
          value={query.tags?.join(', ') ?? ''}
          onChange={(e) =>
            setQuery({ ...query, tags: e.target.value ? e.target.value.split(',').map((t) => t.trim()) : undefined })
          }
          placeholder="tags (comma-separated)"
          style={{
            padding: '8px 12px',
            background: '#161616',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            color: '#e0e0e0',
            fontSize: '0.875rem',
            width: '220px',
          }}
        />
        <input
          type="number"
          value={query.limit ?? 20}
          onChange={(e) => setQuery({ ...query, limit: parseInt(e.target.value) || 20 })}
          placeholder="limit"
          style={{
            padding: '8px 12px',
            background: '#161616',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            color: '#e0e0e0',
            fontSize: '0.875rem',
            width: '80px',
          }}
        />
        <button
          onClick={runQuery}
          disabled={loading}
          style={{
            padding: '8px 20px',
            background: loading ? '#2a2a2a' : '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {loading ? 'Querying…' : 'Query KG'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#ef444420', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {result !== null && (
        <div>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '12px' }}>
            {result.total} node{result.total !== 1 ? 's' : ''} · {result.edges.length} edge{result.edges.length !== 1 ? 's' : ''}
          </p>

          {result.nodes.length === 0 && (
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No nodes found.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.nodes.map((node) => (
              <div
                key={node.id}
                style={{
                  background: '#161616',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  padding: '12px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      background: '#3b82f622',
                      color: '#3b82f6',
                      borderRadius: '4px',
                      padding: '1px 6px',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                    }}
                  >
                    {node.type}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{node.name}</span>
                </div>
                {node.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {node.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: '#2a2a2a',
                          color: '#9ca3af',
                          borderRadius: '4px',
                          padding: '1px 6px',
                          fontSize: '0.7rem',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
