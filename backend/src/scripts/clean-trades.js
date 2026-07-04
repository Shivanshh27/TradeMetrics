const pool = require('../db/pool');

async function clean() {
  try {
    console.log('Clearing all trades from database...');
    await pool.query('TRUNCATE TABLE trades RESTART IDENTITY CASCADE;');
    console.log('Successfully deleted all trades and reset ID counters.');
  } catch (err) {
    console.error('Error clearing trades:', err);
  } finally {
    await pool.end();
  }
}

clean();
