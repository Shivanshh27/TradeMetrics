WITH running AS (
  SELECT id AS trade_id, exit_time, pnl,
         SUM(pnl) OVER (PARTITION BY user_id ORDER BY exit_time) AS running_pnl
  FROM trades
  WHERE user_id = $1
),
peaks AS (
  SELECT *, MAX(running_pnl) OVER (ORDER BY exit_time) AS peak_pnl
  FROM running
)
SELECT *, peak_pnl - running_pnl AS drawdown
FROM peaks
ORDER BY exit_time;
