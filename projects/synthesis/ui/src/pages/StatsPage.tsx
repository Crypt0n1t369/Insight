import { useEffect, useState } from 'react';
import { getStats } from '../api/client';

export function StatsPage() {
  const [stats, setStats] = useState<{
    totalSessions: number;
    totalEvents: number;
    sessionsByProtocol: Record<string, number>;
    platformUptime: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading stats…</div>;
  if (error) return <div className="p-4 error">Error: {error}</div>;
  if (!stats) return null;

  const protocolEntries = Object.entries(stats.sessionsByProtocol).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px' }}>Platform Stats</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Sessions', value: stats.totalSessions },
          { label: 'Total Events', value: stats.totalEvents },
          { label: 'Uptime', value: stats.platformUptime },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: '#161616',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{value}</div>
            <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#9ca3af', marginBottom: '12px' }}>
        Sessions by Protocol
      </h3>
      {protocolEntries.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No sessions yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {protocolEntries.map(([protocol, count]) => {
            const maxCount = protocolEntries[0]?.[1] ?? 1;
            const pct = (count / maxCount) * 100;
            return (
              <div key={protocol}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 500 }}>{protocol}</span>
                  <span style={{ color: '#9ca3af' }}>{count}</span>
                </div>
                <div style={{ background: '#1a1a1a', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: '#3b82f6',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
