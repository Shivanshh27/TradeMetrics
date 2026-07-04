import { useState, useEffect } from 'react';
import api from '../api/client';

export default function TradeForm({ userId, onSaved }) {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const initialFormState = {
    strategyId: '',
    symbol: 'BANKNIFTY',
    side: 'LONG',
    qty: '',
    entryPrice: '',
    exitPrice: '',
    entryTime: '',
    exitTime: '',
    description: ''
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    api.get('/strategies/tree')
      .then(res => {
        setStrategies(res.data);
        if (res.data.length > 0) {
          setForm(prev => ({ ...prev, strategyId: res.data[0].id }));
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Basic validation
    if (!form.strategyId || !form.qty || !form.entryPrice || !form.exitPrice || !form.entryTime || !form.exitTime) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        userId,
        strategyId: parseInt(form.strategyId),
        symbol: form.symbol.toUpperCase().trim(),
        side: form.side,
        qty: parseInt(form.qty),
        entryPrice: parseFloat(form.entryPrice),
        exitPrice: parseFloat(form.exitPrice),
        entryTime: new Date(form.entryTime).toISOString(),
        exitTime: new Date(form.exitTime).toISOString(),
        description: form.description.trim()
      };

      await api.post('/trades', payload);
      setSuccess(true);
      setForm({
        ...initialFormState,
        strategyId: strategies.length > 0 ? strategies[0].id : ''
      });
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to log trade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h3 style={{ marginBottom: '16px' }} className="title-underline">Log New Trade</h3>
      
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: 'var(--accent-red-bg)', 
          border: '1px solid var(--accent-red-border)', 
          color: 'var(--accent-red)', 
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: 'var(--accent-green-bg)', 
          border: '1px solid var(--accent-green-border)', 
          color: 'var(--accent-green)', 
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Trade logged successfully! (P&L auto-calculated by DB trigger)
        </div>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="strategyId">Strategy</label>
          <select 
            id="strategyId"
            name="strategyId" 
            value={form.strategyId} 
            onChange={handleChange}
          >
            <option value="">Select strategy</option>
            {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="symbol">Symbol</label>
          <input 
            id="symbol"
            name="symbol" 
            value={form.symbol} 
            onChange={handleChange} 
            placeholder="e.g. NIFTY"
          />
        </div>

        <div className="form-group">
          <label htmlFor="side">Side</label>
          <select 
            id="side"
            name="side" 
            value={form.side} 
            onChange={handleChange}
          >
            <option value="LONG">LONG</option>
            <option value="SHORT">SHORT</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="qty">Quantity</label>
          <input 
            id="qty"
            name="qty" 
            type="number"
            value={form.qty} 
            onChange={handleChange} 
            placeholder="e.g. 50"
          />
        </div>

        <div className="form-group">
          <label htmlFor="entryPrice">Entry Price (₹)</label>
          <input 
            id="entryPrice"
            name="entryPrice" 
            type="number"
            step="0.01"
            value={form.entryPrice} 
            onChange={handleChange} 
            placeholder="e.g. 19500.50"
          />
        </div>

        <div className="form-group">
          <label htmlFor="exitPrice">Exit Price (₹)</label>
          <input 
            id="exitPrice"
            name="exitPrice" 
            type="number"
            step="0.01"
            value={form.exitPrice} 
            onChange={handleChange} 
            placeholder="e.g. 19620.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="entryTime">Entry Date & Time</label>
          <input 
            id="entryTime"
            name="entryTime" 
            type="datetime-local" 
            value={form.entryTime} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="exitTime">Exit Date & Time</label>
          <input 
            id="exitTime"
            name="exitTime" 
            type="datetime-local" 
            value={form.exitTime} 
            onChange={handleChange} 
          />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="description">Notes / Description</label>
          <textarea 
            id="description"
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            placeholder="Enter trade setup notes, mistakes, key learnings..."
            rows="2"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
        {loading ? 'Logging Trade...' : 'Log Trade'}
      </button>
    </form>
  );
}
