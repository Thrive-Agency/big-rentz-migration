import db from './db.js';
import ScriptTimer from '../utils/ScriptTimer.js';
import ScriptHeader from '../utils/ScriptHeader.js';

async function main() {
  try {
    const timer = new ScriptTimer('Database Initialization', 'yellow');
    timer.start();
    const header = new ScriptHeader('Database Initialization Script', 'green');
    header.print(); 
    // Check if the 'records' table exists
    const res = await db.pool.query(`SELECT to_regclass('public.records') AS exists`);
    if (res.rows[0].exists) {
      console.log('Database already initialized. No action taken.');
      timer.end();
      process.exit(0);
    }
    // If not, initialize schema
    const success = await db.initSchema();
    if (success) {
      console.log('Database initialized successfully.');
      timer.end();
      process.exit(0);
    } else {
      console.error('Database initialization failed.');
      timer.end();
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during database initialization:', err);
    timer.end();
    process.exit(1);
  }
}

main();
