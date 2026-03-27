import { useState, useRef, useEffect } from 'react';
import { startSession, streamSession, type SessionEvent, type SessionStartInput } from '../api/client';

type Mode = 'idle' | 'blocking' | 'streaming';

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

const EVENT_COLORS: Record<string, string> = {
  router: '#f59e0b',
  protocol_selected: '#8b5cf6',
  step: '#3b82f6',
  insight: '#10b981',
  complete: '#22c55e',
  error: '#ef4444',
  default: '#6b7280',
};

function EventItem({ event }: { event: SessionEvent }) {
  const color = EVENT_COLORS[event.type] ?? EVENT_COLORS.default;
  const time = new Date(event.timestamp).toLocaleTimeString();

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        padding: '8px 0',
        borderBottom: '1px solid #1a1a1a',
        fontSize: '0.875rem',
      }}
    >
      <span style={{ color: '#4b5563', flexShrink: 0 }}>{time}</span>
      <span
        style={{
          background: color + '22',
          color,
          borderRadius: '4px',
          padding: '1px 6px',
          fontSize: '0.75rem',
          fontWeight: 500,
          flexShrink: 0,
          minWidth: '90px',
          textAlign: 'center',
        }}
      >
        {event.type}
      </span>
      <span style={{ color: '#d1d5db' }}>{event.message ?? JSON.stringify(event.data ?? {})}</span>
    </div>
  );
}

export function SessionPage() {
  const [mode, setMode] = useState<Mode>('idle');
  const [rawInput, setRawInput] = useState('');
  const [userId] = useState('demo-user');
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [result, setResult] = useState<{ protocol: string; eventCount: number; sessionId: string; kgSessionNodeId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const streamRef = useRef<{ cancel: () => void } | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  function reset() {
    setMode('idle');
    setEvents([]);
    setResult(null);
    setError(null);
    setLoading(false);
    streamRef.current?.cancel();
    streamRef.current = null;
  }

  async function runBlocking() {
    if (!rawInput.trim()) return;
    setLoading(true);
    setError(null);
    setMode('blocking');
    setEvents([]);
    try {
      const res = await startSession({ rawInput, userId });
      setResult({ protocol: res.protocol, eventCount: res.eventCount, sessionId: res.sessionId });
      setEvents(res.events);
      setMode('idle');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setMode('idle');
    } finally {
      setLoading(false);
    }
  }

  function runStreaming() {
    if (!rawInput.trim()) return;
    setLoading(true);
    setError(null);
    setMode('streaming');
    setEvents([]);
    setResult(null);

    streamRef.current = streamSession(
      { rawInput, userId },
      (event) => setEvents((prev) => [...prev, event]),
      (complete) => {
        setResult({
          protocol: complete.protocol ?? 'general',
          eventCount: complete.eventCount,
          sessionId: complete.sessionId,
          kgSessionNodeId: complete.kgSessionNodeId,
        });
        setMode('idle');
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setMode('idle');
        setLoading(false);
      },
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '16px' }}>Run Session</h2>

      <textarea
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder="Describe what you're working on, feeling, or wanting to explore…"
        rows={4}
        style={{
          width: '100%',
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderRadius: '8px',
          padding: '12px',
          color: '#e0e0e0',
          fontSize: '0.9rem',
          resize: 'vertical',
          outline: 'none',
        }}
      />

      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
        <button
          onClick={runBlocking}
          disabled={loading || !rawInput.trim()}
          style={{
            padding: '8px 20px',
            background: loading ? '#2a2a2a' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading && mode === 'blocking' ? 'Running…' : 'Run (Blocking)'}
        </button>
        <button
          onClick={runStreaming}
          disabled={loading || !rawInput.trim()}
          style={{
            padding: '8px 20px',
            background: loading ? '#2a2a2a' : '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading && mode === 'streaming' ? 'Streaming…' : 'Run (Streaming)'}
        </button>
        {(mode !== 'idle' || events.length > 0) && (
          <button
            onClick={reset}
            style={{
              padding: '8px 20px',
              background: '#2a2a2a',
              color: '#9ca3af',
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              fontSize: '0.875rem',
            }}
          >
            Reset
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: '#ef444420',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {events.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#9ca3af' }}>
              Events ({events.length})
            </h3>
            {mode === 'streaming' && (
              <span style={{ color: '#8b5cf6', fontSize: '0.8rem' }}>● Streaming…</span>
            )}
          </div>
          <div
            style={{
              background: '#111',
              border: '1px solid #1a1a1a',
              borderRadius: '8px',
              padding: '12px',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {events.map((ev, i) => (
              <EventItem key={i} event={ev} />
            ))}
            <div ref={eventsEndRef} />
          </div>
        </div>
      )}

      {result && events.length === 0 && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            background: '#161616',
            border: '1px solid #22c55e44',
            borderRadius: '8px',
          }}
        >
          <p style={{ color: '#22c55e', fontWeight: 500 }}>
            Session complete — {result.eventCount} events
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '4px' }}>
            Protocol: {PROTOCOL_LABELS[result.protocol] ?? result.protocol} · Session:{' '}
            {result.sessionId.slice(0, 8)}…
          </p>
        </div>
      )}
    </div>
  );
}
