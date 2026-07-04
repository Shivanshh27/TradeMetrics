import { useEffect, useState } from 'react';
import api from '../api/client';

export default function StreakStats({ userId, refreshTrigger }) {
  const [streaks, setStreaks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/dashboard/${userId}/streaks`)
      .then(res => {
        setStreaks(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userId, refreshTrigger]);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading streak stats...</div>;
  }

  const winStreaks = streaks.filter(s => s.is_win === 1 || s.is_win === true || s.is_win === '1');
  const loseStreaks = streaks.filter(s => s.is_win === 0 || s.is_win === false || s.is_win === '0');

  const renderStreakTable = (title, list, isWin) => {
    return (
      <div style={{ flex: 1 }}>
        <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: isWin ? 'var(--accent-green)' : 'var(--accent-red)' 
          }}></span>
          {title}
        </h4>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Streak Length</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No records</td>
                </tr>
              ) : (
                list.map((streak, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600', color: isWin ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      {streak.streak_length} trades
                    </td>
                    <td>{new Date(streak.streak_start).toLocaleDateString()}</td>
                    <td>{new Date(streak.streak_end).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', width: '100%' }}>
      {renderStreakTable('Top Winning Streaks', winStreaks, true)}
      {renderStreakTable('Top Losing Streaks', loseStreaks, false)}
    </div>
  );
}
