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

  const [activeTradeForNotes, setActiveTradeForNotes] = useState(null);
  const [editedNotesText, setEditedNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const openNotesModal = (trade) => {
    setActiveTradeForNotes(trade);
    setEditedNotesText(trade.description || '');
  };

  const handleSaveNotes = async () => {
    if (!activeTradeForNotes) return;
    setSavingNotes(true);
    try {
      await api.put(`/trades/${activeTradeForNotes.id}/description`, {
        description: editedNotesText.trim()
      });
      // Update local state instantly
      setTrades(prev => prev.map(t => {
        if (t.id === activeTradeForNotes.id) {
          return { ...t, description: editedNotesText.trim() };
        }
        return t;
      }));
      setActiveTradeForNotes(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

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
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
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
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => openNotesModal(trade)}
                          className={`note-icon-btn ${trade.description ? 'has-notes' : ''}`}
                          title={trade.description ? 'View/Edit Notes' : 'Add Notes'}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        </button>
                      </td>
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

      {/* Edit Notes Modal */}
      {activeTradeForNotes && (
        <div className="modal-overlay" onClick={() => setActiveTradeForNotes(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Notes — {activeTradeForNotes.symbol} ({activeTradeForNotes.side})</h3>
              <button className="modal-close-btn" onClick={() => setActiveTradeForNotes(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="modalNotes">Write trade notes / learnings:</label>
              <textarea
                id="modalNotes"
                value={editedNotesText}
                onChange={(e) => setEditedNotesText(e.target.value)}
                placeholder="Mistakes, observations, strategy alignment, key learnings..."
                rows="6"
                style={{ marginTop: '8px' }}
              />
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setActiveTradeForNotes(null)}
                style={{ padding: '10px 18px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveNotes} 
                disabled={savingNotes}
                style={{ padding: '10px 18px' }}
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
