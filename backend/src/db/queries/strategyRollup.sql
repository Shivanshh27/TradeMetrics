WITH RECURSIVE strategy_tree AS (
  SELECT id, name, parent_id, id AS root_id
  FROM strategies WHERE parent_id IS NULL
  UNION ALL
  SELECT s.id, s.name, s.parent_id, st.root_id
  FROM strategies s JOIN strategy_tree st ON s.parent_id = st.id
)
SELECT st.root_id, s.name AS top_level_strategy, SUM(t.pnl) AS total_pnl
FROM strategy_tree st
JOIN trades t ON t.strategy_id = st.id
JOIN strategies s ON s.id = st.root_id
WHERE t.user_id = $1
GROUP BY st.root_id, s.name;
