import { useState, useMemo } from 'react';
import { queryKG, getSession, type KGNode } from '../api/client';

interface SessionSummary {
  id: string;
  name: string;
  protocol: string;
  eventCount: number;
  createdAt: string;
  duration?: number;
}

const ALL_PROTOCOL = '__all__';

const PROTOCOL_LABELS: Record<string, string> = {
  woop: 'WOOP',
  ifs: 'IFS',
  nsdr: 'NSDR',
  breathwork: 'Breathwork',
  se: 'Somatic Experiencing',
  act: 'ACT',
  nvc: 'NVC',
  general: 'General',
};

const PROTOCOL_OPTIONS = [
  { value: ALL_PROTOCOL, label: 'All Protocols' },
  { value: 'woop', label: 'WOOP' },
  { value: 'ifs', label: 'IFS' },
  { value: 'nsdr', label: 'NSDR' },
  { value: 'breathwork', label: 'Breathwork' },
  { value: 'se', label: 'Somatic Experiencing' },
  { value: 'act', label: 'ACT' },
  { value: 'nvc', label: 'NVC' },
  { value: 'general', label: 'General' },
];

export function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<KGNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [protocolFilter, setProtocolFilter] = useState(ALL_PROTOCOL);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const res = await queryKG({ type: 'session', limit: 50 });
      const summaries: SessionSummary[] = res.nodes
        .map((node) => {
          const m = (node as { metadata?: Record<string, unknown> }).metadata ?? {};
          const protocol = (m['protocol'] as string) ?? 'general';
          const eventCount = (m['eventCount'] as number) ?? 0;
          const completedAt = (m['completedAt'] as string) ?? (node as { createdAt?: string }).createdAt ?? '';
          const startedAt = (m['startedAt'] as string) ?? '';
          const duration =
            startedAt && completedAt
              ? new Date(completedAt).getTime() - new Date(startedAt).getTime()
              : undefined;
          return {
            id: node.id,
            name: node.name,
            protocol,
            eventCount,
            createdAt: completedAt,
            duration,
          };
        })
        .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return isNaN(dateB) ? 0 : dateB - dateA;
        });
      setSessions(summaries);
      setHasLoaded(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadSessionDetail(sessionId: string) {
    setLoadingDetail(true);
    try {
      const res = await getSession(sessionId);
      setSelectedSession(res.node);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingDetail(false);
    }
  }

  // Filter sessions by search text + protocol
  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return sessions.filter((s) => {
      const matchText =
        !q || s.name.toLowerCase().includes(q) || s.protocol.toLowerCase().includes(q);
      const matchProtocol = protocolFilter === ALL_PROTOCOL || s.protocol === protocolFilter;
      return matchText && matchProtocol;
    });
  }, [sessions, searchText, protocolFilter]);

  // Clear selection if currently selected session is no longer in filtered list
  const selectedId = selectedSession?.id;
  const isSelectedStillVisible = filtered.some((s) => s.id === selectedId);
  const effectiveSelected = !isSelectedStillVisible ? null : selectedSession;

  function formatDate(iso: string): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  function clearFilters() {
    setSearchText('');
    setProtocolFilter(ALL_PROTOCOL);
  }

  const hasActiveFilters = searchText.trim() !== '' || protocolFilter !== ALL_PROTOCOL;

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Session History</h2>
        <button
          onClick={loadHistory}
          disabled={loading}
          style={{
            padding: '8px 20px',
            background: loading ? '#2a2a2a' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#ef444420', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {!hasLoaded && !loading && (
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          Click "Refresh" to load session history from the knowledge graph.
        </p>
      )}

      {/* Search + Filter bar */}
      {hasLoaded && sessions.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search sessions…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              flex: '1 1 200px',
              padding: '8px 12px',
              background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              color: '#e5e7eb',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              color: '#e5e7eb',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {PROTOCOL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#6b7280',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
          <span style={{ color: '#6b7280', fontSize: '0.8rem', marginLeft: '4px' }}>
            {filtered.length} of {sessions.length}
          </span>
        </div>
      )}

      {hasLoaded && sessions.length === 0 && (
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No sessions found in the knowledge graph.</p>
      )}

      {hasLoaded && sessions.length > 0 && filtered.length === 0 && (
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '12px' }}>
          No sessions match your search. Try a different name or protocol.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: hasLoaded && effectiveSelected ? '1fr 1fr' : '1fr', gap: '16px' }}>
        {/* Session list */}
        {filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSessionDetail(s.id)}
                disabled={loadingDetail}
                style={{
                  background: effectiveSelected?.id === s.id ? '#1a1a2a' : '#161616',
                  border: `1px solid ${effectiveSelected?.id === s.id ? '#3b82f6' : '#2a2a2a'}`,
                  borderRadius: '8px',
                  padding: '12px 16px',
                  textAlign: 'left',
                  cursor: loadingDetail ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  opacity: loadingDetail ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    {PROTOCOL_LABELS[s.protocol] ?? s.protocol}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    {s.eventCount} event{s.eventCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 500 }}>
                  {s.name || '(unnamed session)'}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  {formatDate(s.createdAt)}
                </div>
                {s.duration != null && s.duration > 0 && (
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    ~{Math.round(s.duration / 1000 / 60)}min
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Session detail panel */}
        {effectiveSelected && (
          <div
            style={{
              background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Session Detail</h3>
              <button
                onClick={() => setSelectedSession(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(() => {
                const m = (effectiveSelected as { metadata?: Record<string, unknown> }).metadata ?? {};
                return (
                  <>
                    <DetailRow label="Name" value={effectiveSelected.name || '(unnamed)'} />
                    <DetailRow label="ID" value={effectiveSelected.id.slice(0, 16) + '…'} />
                    <DetailRow
                      label="Protocol"
                      value={PROTOCOL_LABELS[m['protocol'] as string] ?? (m['protocol'] as string) ?? '—'}
                    />
                    <DetailRow label="Events" value={String(m['eventCount'] ?? 0)} />
                    <DetailRow
                      label="Confidence"
                      value={typeof m['confidence'] === 'number' ? `${Math.round((m['confidence'] as number) * 100)}%` : '—'}
                    />
                    <DetailRow label="Started" value={formatDate(m['startedAt'] as string ?? '')} />
                    <DetailRow label="Completed" value={formatDate(m['completedAt'] as string ?? '')} />
                  </>
                );
              })()}
              {effectiveSelected.description && (
                <div>
                  <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Description</span>
                  <p style={{ color: '#d1d5db', fontSize: '0.875rem', marginTop: '2px' }}>
                    {effectiveSelected.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <span style={{ color: '#6b7280', fontSize: '0.8rem', minWidth: '80px' }}>{label}</span>
      <span style={{ color: '#d1d5db', fontSize: '0.8rem', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}
