import { useEffect, useState } from 'react';
import api from '../api/client';

export default function StrategyBreakdown({ userId, refreshTrigger }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/dashboard/${userId}/strategy-rollup`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userId, refreshTrigger]);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading strategy rollup...</div>;
  }

  if (data.length === 0) {
    return <div style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>No strategies data found. Log some trades first.</div>;
  }

  return (
    <div className="strategy-breakdown-list">
      {data.map((item) => {
        const pnlVal = parseFloat(item.total_pnl);
        const isProfit = pnlVal >= 0;

        return (
          <div className="strategy-breakdown-item" key={item.root_id}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)' }}>
                {item.top_level_strategy}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                ID: {item.root_id}
              </div>
            </div>
            <div className="pill" style={{
              backgroundColor: isProfit ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
              border: `1px solid ${isProfit ? 'var(--accent-green-border)' : 'var(--accent-red-border)'}`,
              color: isProfit ? 'var(--accent-green)' : 'var(--accent-red)',
              fontWeight: '700',
              padding: '6px 12px'
            }}>
              {isProfit ? '+' : ''}₹{pnlVal.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
