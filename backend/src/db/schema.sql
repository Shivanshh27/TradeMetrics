CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  capital NUMERIC DEFAULT 0
);

CREATE TABLE strategies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INT REFERENCES strategies(id)
);

CREATE TABLE trades (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  strategy_id INT REFERENCES strategies(id),
  symbol TEXT NOT NULL,
  side TEXT CHECK (side IN ('LONG','SHORT')),
  qty INT NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC NOT NULL,
  entry_time TIMESTAMP NOT NULL,
  exit_time TIMESTAMP NOT NULL,
  pnl NUMERIC
);

-- Trigger: auto-compute P&L on insert
CREATE OR REPLACE FUNCTION calc_pnl() RETURNS TRIGGER AS $$
BEGIN
  NEW.pnl := (NEW.exit_price - NEW.entry_price) * NEW.qty *
             CASE WHEN NEW.side = 'LONG' THEN 1 ELSE -1 END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_calc_pnl
BEFORE INSERT ON trades
FOR EACH ROW EXECUTE FUNCTION calc_pnl();

-- Stored procedure/function: win rate
CREATE OR REPLACE FUNCTION get_win_rate(p_user_id INT, p_strategy_id INT)
RETURNS NUMERIC AS $$
  SELECT ROUND(
    100.0 * COUNT(*) FILTER (WHERE pnl > 0) / NULLIF(COUNT(*), 0), 2
  )
  FROM trades
  WHERE user_id = p_user_id AND strategy_id = p_strategy_id;
$$ LANGUAGE sql;

-- Materialized view: daily P&L summary
CREATE MATERIALIZED VIEW daily_pnl_summary AS
SELECT user_id, DATE(exit_time) AS trade_date,
       SUM(pnl) AS day_pnl, COUNT(*) AS trades_count
FROM trades
GROUP BY user_id, DATE(exit_time);

CREATE UNIQUE INDEX ON daily_pnl_summary (user_id, trade_date); -- required for CONCURRENTLY refresh

-- Indexes
CREATE INDEX idx_trades_user_exit ON trades(user_id, exit_time);
CREATE INDEX idx_open_positions ON trades(user_id) WHERE exit_time IS NULL;
