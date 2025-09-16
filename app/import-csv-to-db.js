import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';
import colors from './utils/colors.js';
import getSingleCsvFile from './utils/getSingleCsvFile.js';
import { findDuplicates } from './utils/csvUtils.js';
import fs from 'fs';
import db from './db/db.js';

const header = new ScriptHeader('CSV to Database Import');
header.print();
const timer = new ScriptTimer('CSV Import');
timer.start();

// Load CSV
let csvPath;
try {
  csvPath = getSingleCsvFile('./import');
} catch (err) {
  console.error(colors.red + err.message + colors.reset);
  timer.end();
  process.exit(1);
}
const csvData = fs.readFileSync(csvPath, 'utf8');
const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
const csvHeaders = lines[0].split(',').map(h => h.trim());
const totalRows = lines.length - 1;
const totalColumns = csvHeaders.length;

// Load column map
const mapPath = './import/column-map.json';
if (!fs.existsSync(mapPath)) {
  console.error(colors.red + 'Column map file not found: ' + mapPath + colors.reset);
  timer.end();
  process.exit(1);
}
const columnMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const mappedColumns = columnMap.map(m => m.original);
const cleanedColumns = columnMap.map(m => m.cleaned);
const totalNodes = columnMap.length;

// Index validation
const indexCount = columnMap.filter(m => m.index === true).length;
if (indexCount !== 1) {
  console.error(colors.red + 'Error: There must be exactly one column with "index": true in column-map.json.' + colors.reset);
  timer.end();
  process.exit(1);
}

// Print summary
console.log(`${colors.green}Loading Records table with csv data:${colors.reset}`);
console.log(`${colors.green}total rows: ${totalRows}${colors.reset}`);
console.log(`Columns in CSV: ${totalColumns}`);
console.log(`Columns being imported: ${totalNodes}`);
if (totalNodes !== totalColumns) {
  console.log(`${colors.yellow}Warning: Number of columns being imported does not match CSV columns.${colors.reset}`);
  process.stdout.write('Continue? (y/N): ');
  process.stdin.setEncoding('utf8');
  const answer = await new Promise(resolve => process.stdin.once('data', resolve));
  if (answer.trim().toLowerCase() !== 'y') {
    console.log('Aborting import.');
    timer.end();
    process.exit(0);
  }
}

// Check if records table is empty
const checkTable = await db.pool.query('SELECT COUNT(*) FROM records');
const existingRows = parseInt(checkTable.rows[0].count, 10);
if (existingRows > 0) {
  console.log(colors.yellow + `Records table already has ${existingRows} rows.` + colors.reset);
  process.stdout.write('Do you intend to add additional rows to the database? (y/N): ');
  process.stdin.setEncoding('utf8');
  const answer = await new Promise(resolve => process.stdin.once('data', resolve));
  if (answer.trim().toLowerCase() !== 'y') {
    console.log('Aborting import.');
    timer.end();
    process.exit(0);
  }
}

// Import rows
let imported = 0;
let failed = 0;
const errorLog = [];
import progressBar from './utils/progressBar.js';
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',');
  const rowObj = {};
  for (let j = 0; j < columnMap.length; j++) {
    const mapIdx = csvHeaders.indexOf(columnMap[j].original);
    rowObj[columnMap[j].cleaned] = mapIdx !== -1 ? cols[mapIdx] : null;
  }
  try {
    const id = await db.createRecord(rowObj);
    if (id) imported++;
    else throw new Error('Insert failed');
  } catch (err) {
    failed++;
    errorLog.push(`Row ${i}: ${JSON.stringify(rowObj)}\nError: ${err.message}`);
  }
  progressBar(i, totalRows);
}

// Write error log if needed
if (failed > 0) {
  fs.writeFileSync('./import/error.log', errorLog.join('\n\n'));
  console.log(colors.red + `Import completed with errors. See import/error.log for details.` + colors.reset);
} else {
  console.log(colors.green + 'Import completed successfully.' + colors.reset);
}

console.log(`Rows attempted: ${totalRows}`);
console.log(`Rows imported: ${imported}`);
if (imported !== totalRows) {
  console.log(colors.red + `Mismatch: Not all rows were imported.` + colors.reset);
}
timer.end();
