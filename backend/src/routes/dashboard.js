const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const fs = require('fs');
const path = require('path');

const loadSQL = (name) => fs.readFileSync(path.join(__dirname, `../db/queries/${name}.sql`), 'utf8');

router.get('/:userId/equity-curve', async (req, res) => {
  try {
    const result = await pool.query(loadSQL('equityCurve'), [req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId/streaks', async (req, res) => {
  try {
    const result = await pool.query(loadSQL('streaks'), [req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId/strategy-rollup', async (req, res) => {
  try {
    const result = await pool.query(loadSQL('strategyRollup'), [req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId/win-rate/:strategyId', async (req, res) => {
  try {
    const result = await pool.query(loadSQL('winRate'), [req.params.userId, req.params.strategyId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
