import { useEffect, useState } from 'react';
import { getProtocols, type ProtocolListResponse } from '../api/client';

const PROTOCOL_DESCRIPTIONS: Record<string, { name: string; description: string }> = {
  woop: {
    name: 'WOOP',
    description: 'Mental Contrasting — Wish × Outcome × Obstacle × Plan',
  },
  ifs: {
    name: 'IFS',
    description: 'Internal Family Systems — parts work and self-leadership',
  },
  nsdr: {
    name: 'NSDR',
    description: 'Non-Sleep Deep Rest — yoga-nidra inspired restoration',
  },
  breathwork: {
    name: 'Breathwork',
    description: 'Conscious Connected Breathing — emotional release and expansion',
  },
  se: {
    name: 'Somatic Experiencing',
    description: 'Body-based trauma resolution through tracked sensation',
  },
  act: {
    name: 'ACT',
    description: 'Acceptance & Commitment Therapy — defusion, expansion, committed action',
  },
  nvc: {
    name: 'NVC',
    description: 'Nonviolent Communication — needs-based connection and expression',
  },
  general: {
    name: 'General',
    description: 'General synthesis and integration — open-ended session',
  },
};

const PROTOCOL_COLORS: Record<string, string> = {
  woop: '#f59e0b',
  ifs: '#8b5cf6',
  nsdr: '#3b82f6',
  breathwork: '#10b981',
  se: '#ef4444',
  act: '#f97316',
  nvc: '#06b6d4',
  general: '#6b7280',
};

export function ProtocolsPage() {
  const [data, setData] = useState<ProtocolListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProtocols()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading protocols…</div>;
  if (error) return <div className="p-4 error">Error: {error}</div>;
  if (!data) return null;

  const totalSessions = Object.values(data.usageCounts).reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>
        Protocols
      </h2>
      <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
        {data.protocols.length} protocols · {totalSessions} total sessions run
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.protocols.map((id) => {
          const info = PROTOCOL_DESCRIPTIONS[id] ?? { name: id, description: '' };
          const color = PROTOCOL_COLORS[id] ?? '#6b7280';
          const count = data.usageCounts[id] ?? 0;

          return (
            <div
              key={id}
              style={{
                background: '#161616',
                border: `1px solid #2a2a2a`,
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '48px',
                  borderRadius: '4px',
                  background: color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>{info.name}</span>
                  <span
                    style={{
                      background: '#2a2a2a',
                      color: '#9ca3af',
                      borderRadius: '99px',
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {count} session{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '4px' }}>
                  {info.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
