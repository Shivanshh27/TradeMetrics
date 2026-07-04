import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import api from '../api/client';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const drawdown = parseFloat(data.drawdown).toFixed(2);
    const dateStr = new Date(data.exit_time).toLocaleString();

    return (
      <div className="custom-tooltip">
        <div className="tooltip-title">{dateStr}</div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Drawdown: </span>
          <span className="tooltip-value red">
            -₹{drawdown}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DrawdownChart({ userId }) {
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
    return <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading Drawdowns...</div>;
  }

  if (data.length === 0) {
    return <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>No drawdown data.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent-red)" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
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
          tickFormatter={(val) => `-₹${val}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="drawdown" 
          stroke="var(--accent-red)" 
          strokeWidth={1.5}
          fillOpacity={1}
          fill="url(#drawdownGrad)" 
          name="Drawdown" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
