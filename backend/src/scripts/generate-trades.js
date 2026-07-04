const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const STRATEGY_IDS = [1, 2, 3, 4];
const SYMBOLS = ['BANKNIFTY', 'NIFTY'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seed(count = 3000) {
  const client = await pool.connect();
  const start = new Date('2025-06-01');
  const end = new Date('2026-07-01');

  console.log(`Starting mock trade generation...`);

  // Clear existing trades first to prevent stacking on re-runs
  await client.query('TRUNCATE TABLE trades RESTART IDENTITY CASCADE;');

  // Let's generate trades in a transaction block to make it run extremely fast
  await client.query('BEGIN;');
  try {
    for (let i = 0; i < count; i++) {
      const entryTime = randomDate(start, end);
      const exitTime = new Date(entryTime.getTime() + Math.random() * 3 * 60 * 60 * 1000); // 0 to 3 hours duration
      const basePrice = 48000 + Math.random() * 4000;
      const move = (Math.random() - 0.47) * 300; // slightly positive drift
      const side = Math.random() > 0.5 ? 'LONG' : 'SHORT';
      const qty = [15, 25, 30, 50][Math.floor(Math.random() * 4)];
      const strategyId = STRATEGY_IDS[Math.floor(Math.random() * STRATEGY_IDS.length)];
      const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

      const description = `Auto-generated test trade for strategy ID ${strategyId}. Setup looks clean.`;

      await client.query(
        `INSERT INTO trades (user_id, strategy_id, symbol, side, qty, entry_price, exit_price, entry_time, exit_time, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [1, strategyId, symbol, side, qty, basePrice.toFixed(2), (basePrice + move).toFixed(2), entryTime, exitTime, description]
      );
    }
    await client.query('COMMIT;');
    console.log(`Successfully generated and inserted ${count} trades.`);
  } catch (e) {
    await client.query('ROLLBACK;');
    console.error('Failed to generate mock trades:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

seed(10);
