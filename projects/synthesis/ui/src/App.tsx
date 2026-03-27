import { useState } from 'react';
import { ProtocolsPage } from './pages/ProtocolsPage';
import { SessionPage } from './pages/SessionPage';
import { KGQueryPage } from './pages/KGQueryPage';
import { StatsPage } from './pages/StatsPage';
import { HistoryPage } from './pages/HistoryPage';

type Tab = 'protocols' | 'session' | 'kg' | 'stats' | 'history';

const TABS: { id: Tab; label: string }[] = [
  { id: 'protocols', label: 'Protocols' },
  { id: 'session', label: 'Run Session' },
  { id: 'kg', label: 'KG' },
  { id: 'stats', label: 'Stats' },
  { id: 'history', label: 'History' },
];

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('protocols');

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid #1a1a1a',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          height: '56px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>☀️</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>Synthesis</span>
        </div>

        <nav style={{ display: 'flex', gap: '4px' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px',
                background: activeTab === tab.id ? '#1a1a1a' : 'transparent',
                color: activeTab === tab.id ? '#e0e0e0' : '#6b7280',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab.id ? 500 : 400,
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main>
        {activeTab === 'protocols' && <ProtocolsPage />}
        {activeTab === 'session' && <SessionPage />}
        {activeTab === 'kg' && <KGQueryPage />}
        {activeTab === 'stats' && <StatsPage />}
        {activeTab === 'history' && <HistoryPage />}
      </main>
    </div>
  );
}
