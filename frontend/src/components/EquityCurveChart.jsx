import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import api from '../api/client';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const running = parseFloat(data.running_pnl).toFixed(2);
    const peak = parseFloat(data.peak_pnl).toFixed(2);
    const dateStr = new Date(data.exit_time).toLocaleString();

    return (
      <div className="custom-tooltip">
        <div className="tooltip-title">{dateStr}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Equity: </span>
            <span className={`tooltip-value ${parseFloat(running) >= 0 ? 'green' : 'red'}`}>
              ₹{running}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Peak Equity: </span>
            <span className="tooltip-value" style={{ color: 'var(--accent-blue)' }}>
              ₹{peak}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function EquityCurveChart({ userId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/dashboard/${userId}/equity-curve`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading Equity Curve...</div>;
  }

  if (data.length === 0) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>No trades recorded yet.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis 
          dataKey="exit_time" 
          tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} 
          stroke="var(--text-muted)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="var(--text-muted)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => `₹${val}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="running_pnl" 
          stroke="var(--accent-green)" 
          strokeWidth={2}
          dot={false} 
          name="Equity" 
          activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--accent-green)' }}
        />
        <Line 
          type="monotone" 
          dataKey="peak_pnl" 
          stroke="var(--accent-blue)" 
          strokeWidth={1.5}
          dot={false} 
          strokeDasharray="4 4" 
          name="Peak" 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
