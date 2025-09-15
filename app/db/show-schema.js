import db from './db.js';
import ScriptHeader from '../utils/ScriptHeader.js';
import ScriptTimer from '../utils/ScriptTimer.js';

async function showSchema() {

  const timer = new ScriptTimer('Show Schema', 'yellow');
  timer.start();
  try {

    const header = new ScriptHeader('Database Schema Overview', 'green');
    header.print();

    const res = await db.pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    if (res.rows.length === 0) {
      console.log('\nNo tables found in the database.\n');
      console.log('To initialize the database schema, run:');
      console.log('  npm run init-db\n');
      console.log(' \n');
      timer.end();
      process.exit(0);
    }
    for (const row of res.rows) {
      console.log('----------------------------------------');
      console.log(`Table: ${row.table_name}`);
      const columns = await db.pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [row.table_name]);
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
      });
      console.log('');
    }
  } catch (err) {
    console.error('Error fetching schema:', err);
    timer.end();
    process.exit(1);
  }
  timer.end();
  process.exit(0);
}

showSchema();
