import { useEffect, useState } from 'react';
import api from '../api/client';

export default function TradeLog({ userId, refreshTrigger }) {
  const [trades, setTrades] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [strategyId, setStrategyId] = useState('');
  const [symbol, setSymbol] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Fetch strategies tree for filter dropdown
  useEffect(() => {
    api.get('/strategies/tree')
      .then(res => setStrategies(res.data))
      .catch(console.error);
  }, []);

  const fetchTrades = () => {
    setLoading(true);
    const params = {};
    if (strategyId) params.strategyId = strategyId;
    if (symbol) params.symbol = symbol;
    if (from) params.from = new Date(from).toISOString();
    if (to) params.to = new Date(to).toISOString();

    api.get(`/trades/${userId}`, { params })
      .then(res => {
        setTrades(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrades();
  }, [userId, refreshTrigger]);

  const handleReset = () => {
    setStrategyId('');
    setSymbol('');
    setFrom('');
    setTo('');
    // Wait for state updates to complete or directly pass empty values to fetchTrades
    setLoading(true);
    api.get(`/trades/${userId}`)
      .then(res => {
        setTrades(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      try {
        await api.delete(`/trades/${id}`);
        fetchTrades();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || 'Failed to delete trade.');
      }
    }
  };

  return (
    <div>
      <div className="filter-bar">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Strategy</label>
          <select value={strategyId} onChange={e => setStrategyId(e.target.value)}>
            <option value="">All Strategies</option>
            {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Symbol</label>
          <input 
            type="text" 
            placeholder="e.g. NIFTY, BANKNIFTY" 
            value={symbol} 
            onChange={e => setSymbol(e.target.value)} 
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>From Date</label>
          <input 
            type="date" 
            value={from} 
            onChange={e => setFrom(e.target.value)} 
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>To Date</label>
          <input 
            type="date" 
            value={to} 
            onChange={e => setTo(e.target.value)} 
          />
        </div>

        <div className="flex-gap-8" style={{ marginTop: 'auto' }}>
          <button onClick={fetchTrades} style={{ padding: '12px 20px', height: '45px' }}>Apply</button>
          <button onClick={handleReset} className="btn-secondary" style={{ padding: '12px 20px', height: '45px' }}>Reset</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading trade logs...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Qty</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>P&L (₹)</th>
                <th>Strategy</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                    No trades match the filters.
                  </td>
                </tr>
              ) : (
                trades.map(trade => {
                  const pnl = parseFloat(trade.pnl);
                  const isProfit = pnl >= 0;
                  return (
                    <tr key={trade.id}>
                      <td style={{ fontWeight: '600' }}>{trade.symbol}</td>
                      <td>
                        <span className={`pill ${trade.side === 'LONG' ? 'green' : 'red'}`} style={{ fontSize: '10px' }}>
                          {trade.side}
                        </span>
                      </td>
                      <td>{trade.qty}</td>
                      <td>₹{parseFloat(trade.entry_price).toFixed(2)}</td>
                      <td>₹{parseFloat(trade.exit_price).toFixed(2)}</td>
                      <td style={{ fontWeight: '700', color: isProfit ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {isProfit ? '+' : ''}₹{pnl.toFixed(2)}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {trade.strategy_name || `ID: ${trade.strategy_id}`}
                      </td>
                      <td>{new Date(trade.entry_time).toLocaleString()}</td>
                      <td>{new Date(trade.exit_time).toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(trade.id)}
                          style={{
                            padding: '6px 10px',
                            fontSize: '11px',
                            backgroundColor: 'var(--accent-red-bg)',
                            color: 'var(--accent-red)',
                            border: '1px solid var(--accent-red-border)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            width: 'auto',
                            boxShadow: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'var(--accent-red)';
                            e.target.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'var(--accent-red-bg)';
                            e.target.style.color = 'var(--accent-red)';
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
