import db from './db.js';

async function main() {
  try {
    // Check if the 'records' table exists
    const res = await db.pool.query(`SELECT to_regclass('public.records') AS exists`);
    if (res.rows[0].exists) {
      console.log('Database already initialized. No action taken.');
      process.exit(0);
    }
    // If not, initialize schema
    const success = await db.initSchema();
    if (success) {
      console.log('Database initialized successfully.');
      process.exit(0);
    } else {
      console.error('Database initialization failed.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during database initialization:', err);
    process.exit(1);
  }
}

main();
