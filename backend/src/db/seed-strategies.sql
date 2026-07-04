INSERT INTO users (id, name, email, capital) VALUES
  (1, 'Shivansh', 'shivansh@example.com', 100000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO strategies (id, name, parent_id) VALUES
  (1, 'Intraday Options', NULL),
  (2, 'ORB', 1),
  (3, 'VWAP Reversion', 1),
  (4, '5min ORB Breakout', 2)
ON CONFLICT (id) DO NOTHING;
