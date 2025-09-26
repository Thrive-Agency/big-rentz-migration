import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';
import colors from './utils/colors.js';
import db from './db/db.js';

const args = process.argv.slice(2);
const force = args.includes('--force');

const header = new ScriptHeader('Soft Reset Database', 'yellow');
header.print();
const timer = new ScriptTimer('Soft Reset Database', 'yellow');
timer.start();

console.log(`${colors.yellow}WARNING: This will reset import status for ALL records!${colors.reset}`);
console.log(`${colors.cyan}This will:${colors.reset}`);
console.log(`  - Set imported = FALSE for all records`);
console.log(`  - Clear imported_id (set to NULL)`);
console.log(`  - Clear processing_started (set to NULL)`);
console.log(`  - Clear processing_complete (set to NULL)`);
console.log(`  - Set processing = FALSE for all records`);
console.log(`${colors.green}Records data will be preserved${colors.reset}\n`);

if (!force) {
  process.stdin.setEncoding('utf8');
  process.stdout.write('Are you sure you want to soft reset the database? (y/N): ');
  const answer = await new Promise(resolve => process.stdin.once('data', resolve));
  
  if (answer.trim().toLowerCase() !== 'y') {
    console.log('Aborting soft reset.');
    timer.end();
    process.exit(0);
  }

  process.stdout.write('Type RESET to confirm: ');
  const confirm = await new Promise(resolve => process.stdin.once('data', resolve));
  
  if (confirm.trim() !== 'RESET') {
    console.log('Confirmation failed. Aborting.');
    timer.end();
    process.exit(0);
  }
}

try {
  // Get current statistics before reset
  console.log(`${colors.yellow}Getting current statistics...${colors.reset}`);
  
  const totalRecords = await db.pool.query('SELECT COUNT(*) FROM records');
  const importedRecords = await db.pool.query('SELECT COUNT(*) FROM records WHERE imported = true');
  const processingRecords = await db.pool.query('SELECT COUNT(*) FROM records WHERE processing = true');
  const withImportedIds = await db.pool.query('SELECT COUNT(*) FROM records WHERE imported_id IS NOT NULL');
  
  console.log(`\n${colors.cyan}Current Status:${colors.reset}`);
  console.log(`  Total records: ${totalRecords.rows[0].count}`);
  console.log(`  Imported records: ${importedRecords.rows[0].count}`);
  console.log(`  Currently processing: ${processingRecords.rows[0].count}`);
  console.log(`  With WordPress IDs: ${withImportedIds.rows[0].count}`);

  // Perform the soft reset
  console.log(`\n${colors.yellow}Performing soft reset...${colors.reset}`);
  
  const resetResult = await db.pool.query(`
    UPDATE records 
    SET 
      imported = FALSE,
      imported_id = NULL,
      processing_started = NULL,
      processing_complete = NULL,
      processing = FALSE
    WHERE 
      imported = TRUE 
      OR imported_id IS NOT NULL 
      OR processing_started IS NOT NULL 
      OR processing_complete IS NOT NULL 
      OR processing = TRUE
  `);

  // Also clear any import errors if they exist
  console.log(`${colors.yellow}Clearing import errors...${colors.reset}`);
  const errorClearResult = await db.pool.query(`
    UPDATE import_errors 
    SET resolved = FALSE, imported = FALSE
    WHERE resolved = TRUE OR imported = TRUE
  `);

  // Get final statistics
  const finalImported = await db.pool.query('SELECT COUNT(*) FROM records WHERE imported = true');
  const finalProcessing = await db.pool.query('SELECT COUNT(*) FROM records WHERE processing = true');
  const finalWithIds = await db.pool.query('SELECT COUNT(*) FROM records WHERE imported_id IS NOT NULL');

  // Summary
  console.log(`\n${colors.green}=== Soft Reset Complete ===${colors.reset}`);
  console.log(`${colors.green}Records updated: ${resetResult.rowCount}${colors.reset}`);
  console.log(`${colors.green}Import errors updated: ${errorClearResult.rowCount}${colors.reset}`);
  
  console.log(`\n${colors.cyan}Final Status:${colors.reset}`);
  console.log(`  Total records: ${totalRecords.rows[0].count} (unchanged)`);
  console.log(`  Imported records: ${finalImported.rows[0].count}`);
  console.log(`  Currently processing: ${finalProcessing.rows[0].count}`);
  console.log(`  With WordPress IDs: ${finalWithIds.rows[0].count}`);

  console.log(`\n${colors.green}✅ Database soft reset completed successfully!${colors.reset}`);
  console.log(`${colors.cyan}You can now re-run the import process.${colors.reset}`);

} catch (error) {
  console.error(`${colors.red}Error during soft reset:${colors.reset}`, error);
} finally {
  await db.pool.end();
}

timer.end();