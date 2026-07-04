WITH flagged AS (
  SELECT *,
         CASE WHEN pnl > 0 THEN 1 ELSE 0 END AS is_win,
         ROW_NUMBER() OVER (ORDER BY exit_time) AS rn
  FROM trades WHERE user_id = $1
),
grouped AS (
  SELECT *, rn - ROW_NUMBER() OVER (PARTITION BY is_win ORDER BY exit_time) AS grp
  FROM flagged
)
SELECT is_win, COUNT(*) AS streak_length,
       MIN(exit_time) AS streak_start, MAX(exit_time) AS streak_end
FROM grouped
GROUP BY is_win, grp
ORDER BY streak_length DESC
LIMIT 10;
