const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL not set in .env');
    process.exit(1);
  }

  // Parse connection string to connect to default 'postgres' database first to create 'trademetrics'
  // e.g. postgresql://user:pass@host:5432/database
  const matches = connectionString.match(/^(postgresql:\/\/.*?\/)([^?]+)(.*)$/);
  if (!matches) {
    console.error('Error: Invalid DATABASE_URL format');
    process.exit(1);
  }

  const baseUrl = matches[1];
  const targetDbName = matches[2];
  const params = matches[3] || '';

  console.log(`Connecting to default 'postgres' database to check/create '${targetDbName}'...`);
  const adminClient = new Client({ connectionString: `${baseUrl}postgres${params}` });
  
  try {
    await adminClient.connect();
    
    // Check if target database exists
    const checkDbResult = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1", 
      [targetDbName]
    );

    if (checkDbResult.rows.length === 0) {
      console.log(`Database '${targetDbName}' does not exist. Creating...`);
      // CREATE DATABASE cannot be run inside a transaction block or with parameterized values in some cases, run directly
      await adminClient.query(`CREATE DATABASE ${targetDbName};`);
      console.log(`Database '${targetDbName}' created successfully.`);
    } else {
      console.log(`Database '${targetDbName}' already exists.`);
    }
  } catch (err) {
    console.error('Error during database creation phase:', err.message);
    console.log('Please make sure PostgreSQL is running and your connection details in backend/.env are correct.');
    await adminClient.end();
    process.exit(1);
  } finally {
    await adminClient.end();
  }

  console.log(`Connecting to '${targetDbName}' to initialize schema and seed data...`);
  const targetClient = new Client({ connectionString });
  
  try {
    await targetClient.connect();

    // Read schema.sql
    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    console.log('Executing schema.sql...');
    await targetClient.query(schemaSql);
    console.log('Schema initialized successfully.');

    // Read seed-strategies.sql
    console.log('Reading seed-strategies.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed-strategies.sql'), 'utf8');
    
    console.log('Executing seed-strategies.sql...');
    await targetClient.query(seedSql);
    console.log('Seed data initialized successfully.');

  } catch (err) {
    console.error('Error during database initialization phase:', err);
    process.exit(1);
  } finally {
    await targetClient.end();
  }

  console.log('Database setup completed successfully!');
}

run();
