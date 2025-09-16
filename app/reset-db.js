import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';
import colors from './utils/colors.js';
import db from './db/db.js';

const header = new ScriptHeader('Reset Database Table', 'red');
header.print();
const timer = new ScriptTimer('DB Reset', 'red');
timer.start();

process.stdin.setEncoding('utf8');

console.log(colors.red + 'WARNING: This will delete ALL rows from the records table!' + colors.reset);
process.stdout.write('Are you sure you want to continue? (y/N): ');
const answer1 = await new Promise(resolve => process.stdin.once('data', resolve));
if (answer1.trim().toLowerCase() !== 'y') {
  console.log('Aborting reset.');
  timer.end();
  process.exit(0);
}

const importedCount = await db.getImportCount();
if (importedCount > 0) {
  console.log(colors.red + `Reset failed: There are ${importedCount} imported records.` + colors.reset);
  console.log('Please use your database client to manage imported records.');
  timer.end();
  process.exit(1);
}

process.stdout.write('Type RESET to confirm: ');
const confirm = await new Promise(resolve => process.stdin.once('data', resolve));
if (confirm.trim() !== 'RESET') {
  console.log('Confirmation failed. Aborting.');
  timer.end();
  process.exit(0);
}

process.stdout.write('Are you absolutely sure? (y/N): ');
const answer2 = await new Promise(resolve => process.stdin.once('data', resolve));
if (answer2.trim().toLowerCase() !== 'y') {
  console.log('Aborting reset.');
  timer.end();
  process.exit(0);
}

const deleted = await db.deleteAllRecords();
console.log(colors.green + `Deleted ${deleted} rows from records table.` + colors.reset);
timer.end();

process.exit(0);
