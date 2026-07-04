const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// POST /trades - log a new trade (pnl computed by DB trigger)
router.post('/', async (req, res) => {
  const { userId, strategyId, symbol, side, qty, entryPrice, exitPrice, entryTime, exitTime, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO trades (user_id, strategy_id, symbol, side, qty, entry_price, exit_price, entry_time, exit_time, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [userId, strategyId, symbol, side, qty, entryPrice, exitPrice, entryTime, exitTime, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /trades/:userId - trade log with optional filters
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { strategyId, symbol, from, to } = req.query;
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (strategyId) { params.push(strategyId); conditions.push(`strategy_id = $${params.length}`); }
  if (symbol) { params.push(symbol); conditions.push(`symbol = $${params.length}`); }
  if (from) { params.push(from); conditions.push(`exit_time >= $${params.length}`); }
  if (to) { params.push(to); conditions.push(`exit_time <= $${params.length}`); }

  try {
    const result = await pool.query(
      `SELECT t.*, s.name AS strategy_name 
       FROM trades t 
       LEFT JOIN strategies s ON t.strategy_id = s.id
       WHERE ${conditions.join(' AND ')} 
       ORDER BY exit_time DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /trades/:id - Delete a specific trade
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM trades WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    res.json({ message: 'Trade deleted successfully', trade: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /trades/:id/description - Update a specific trade's description notes
router.put('/:id/description', async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE trades SET description = $1 WHERE id = $2 RETURNING *',
      [description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    res.json({ message: 'Trade notes updated successfully', trade: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
