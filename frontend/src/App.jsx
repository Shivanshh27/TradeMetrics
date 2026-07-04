import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TradeEntry from './pages/TradeEntry';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div>
      {/* Navigation Header */}
      <header className="navbar">
        <div className="nav-logo" onClick={() => setActiveTab('dashboard')}>
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ stroke: 'url(#logoGrad)' }}
          >
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>TradeMetrics</span>
        </div>

        <nav className="nav-links">
          <div 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Analytics Dashboard
          </div>
          <div 
            className={`nav-link ${activeTab === 'journal' ? 'active' : ''}`}
            onClick={() => setActiveTab('journal')}
          >
            Trade Journal
          </div>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-green)',
            boxShadow: '0 0 8px var(--accent-green)'
          }}></div>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Shivansh (Live)</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-container">
        {activeTab === 'dashboard' ? <Dashboard /> : <TradeEntry />}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: '80px',
        padding: '30px 40px',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '13px'
      }}>
        <p>TradeMetrics Engine — Advanced SQL Analytics Dashboard. No ORM, Raw Node-Postgres.</p>
      </footer>
    </div>
  );
}
