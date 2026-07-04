const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.get('/tree', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, parent_id FROM strategies ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
