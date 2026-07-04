import { useState } from 'react';
import TradeForm from '../components/TradeForm';
import TradeLog from '../components/TradeLog';

export default function TradeEntry() {
  const userId = 1; // Default user Shivansh
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>Trade Operations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Log new executions and inspect historical logs with sub-second SQL queries.
        </p>
      </div>

      <div>
        {/* Top Side: Trade Entry Form */}
        <div className="glass-panel" style={{ height: 'fit-content', marginBottom: '24px' }}>
          <TradeForm userId={userId} onSaved={handleSaved} />
        </div>

        {/* Bottom Side: Trade Log and Filters */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '16px' }} className="title-underline">Execution Log</h3>
          <TradeLog userId={userId} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}
