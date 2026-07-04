import { useState, useEffect } from 'react';
import EquityCurveChart from '../components/EquityCurveChart';
import DrawdownChart from '../components/DrawdownChart';
import StreakStats from '../components/StreakStats';
import StrategyBreakdown from '../components/StrategyBreakdown';
import api from '../api/client';

export default function Dashboard() {
  const userId = 1; // Default Shivansh user
  const [stats, setStats] = useState({
    totalPnl: 0,
    totalTrades: 0,
    winRate: 0,
    maxDrawdown: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/dashboard/${userId}/equity-curve`)
      .then(res => {
        const curve = res.data;
        if (curve.length > 0) {
          const totalPnl = parseFloat(curve[curve.length - 1].running_pnl);
          const totalTrades = curve.length;
          
          // Win rate computation
          const wins = curve.filter(trade => parseFloat(trade.pnl) > 0).length;
          const winRate = ((wins / totalTrades) * 100).toFixed(2);
          
          // Max drawdown computation
          const maxDrawdown = Math.max(...curve.map(trade => parseFloat(trade.drawdown || 0)));

          setStats({
            totalPnl,
            totalTrades,
            winRate,
            maxDrawdown
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userId]);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Real-time portfolio analytics powered by PostgreSQL engine.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading portfolio stats...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="kpi-container">
            <div className="kpi-card">
              <span className="kpi-title">Total Net P&L</span>
              <span className={`kpi-value ${stats.totalPnl >= 0 ? 'green' : 'red'}`}>
                {stats.totalPnl >= 0 ? '+' : ''}₹{stats.totalPnl.toFixed(2)}
              </span>
            </div>
            
            <div className="kpi-card">
              <span className="kpi-title">Total Trades Logged</span>
              <span className="kpi-value" style={{ color: 'var(--accent-blue)' }}>
                {stats.totalTrades}
              </span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Win Rate</span>
              <span className="kpi-value" style={{ color: 'var(--accent-purple)' }}>
                {stats.winRate}%
              </span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Max Drawdown</span>
              <span className="kpi-value red">
                -₹{stats.maxDrawdown.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
            <div className="glass-panel col-8">
              <h3 style={{ marginBottom: '16px' }} className="title-underline">Cumulative Equity Curve</h3>
              <EquityCurveChart userId={userId} />
            </div>

            <div className="glass-panel col-4">
              <h3 style={{ marginBottom: '16px' }} className="title-underline">Drawdown From Peak</h3>
              <DrawdownChart userId={userId} />
            </div>
          </div>

          {/* Table Breakdown Row */}
          <div className="dashboard-grid">
            <div className="glass-panel col-4">
              <h3 style={{ marginBottom: '16px' }} className="title-underline">Strategy Performance Rollup</h3>
              <StrategyBreakdown userId={userId} />
            </div>

            <div className="glass-panel col-8">
              <h3 style={{ marginBottom: '16px' }} className="title-underline">Consecutive Streaks Analysis</h3>
              <StreakStats userId={userId} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
