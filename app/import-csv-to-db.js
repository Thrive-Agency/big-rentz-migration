import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';
import colors from './utils/colors.js';
import getSingleCsvFile from './utils/getSingleCsvFile.js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import db from './db/db.js';
import progressBar from './utils/progressBar.js';

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
let records;
try {
  records = parse(csvData, { columns: true, skip_empty_lines: true });
} catch (err) {
  console.error(colors.red + 'Error parsing CSV: ' + err.message + colors.reset);
  timer.end();
  process.exit(1);
}
const csvHeaders = Object.keys(records[0] || {});
const totalRows = records.length;
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
// removed: const cleanedColumns = columnMap.map(m => m.cleaned);
const totalNodes = columnMap.length;

// Index validation
const indexCount = columnMap.filter(m => m.index === true).length;
if (indexCount !== 1) {
  console.error(colors.red + 'Error: There must be exactly one column with "index": true in column-map.json.' + colors.reset);
  timer.end();
  process.exit(1);
}

// Print summary
console.log(`${colors.white}Loading Records table with csv data:${colors.reset}`);
console.log(`${colors.white}total rows: ${colors.green}${totalRows}${colors.reset}`);
console.log(`${colors.white}Columns in CSV: ${colors.green}${totalColumns}${colors.reset}`);

// Clean column names: lowercase, replace non-alphanumerics with _
const cleanedColumns = csvHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''));
let failed = 0;
let errorLog = [];
let imported = 0;
let importCount = records.length;

process.stdin.setEncoding('utf8');
const askImport = async () => {
  process.stdout.write(`\n${colors.magenta}Import all rows or a portion?${colors.reset} ${colors.white}(1=all/2=portion):${colors.reset} `);
  const answer = await new Promise(resolve => process.stdin.once('data', resolve));
  const input = answer.trim().toLowerCase();
  
  // Check for portion: 2, p, por, port, porti, portio, portion
  if (input === '2' || input.startsWith('p')) {
    process.stdout.write(`How many rows to import? (1-${records.length}): `);
    const numStr = await new Promise(resolve => process.stdin.once('data', resolve));
    const num = parseInt(numStr.trim(), 10);
    if (isNaN(num) || num < 1 || num > records.length) {
      console.error(colors.red + 'Invalid number.' + colors.reset);
      timer.end();
      process.exit(1);
    }
    importCount = num;
  } else if (input === '1' || input.startsWith('a')) {
    // All rows selected, importCount already set to records.length
  } else {
    console.error(colors.red + 'Invalid selection. Use 1/all or 2/portion.' + colors.reset);
    timer.end();
    process.exit(1);
  }
};
await askImport();

for (let i = 0; i < importCount; i++) {
  const rowObj = {};
  for (let j = 0; j < csvHeaders.length; j++) {
    rowObj[cleanedColumns[j]] = records[i][csvHeaders[j]] || null;
  }
  try {
    const id = await db.createRecord(rowObj);
    if (id) imported++;
    else throw new Error('Insert failed');
  } catch (err) {
    failed++;
    errorLog.push(`Row ${i + 1}: ${JSON.stringify(rowObj)}\nError: ${err.message}`);
  }
  progressBar(i + 1, importCount);
}

// Write error log if needed
if (failed > 0) {
  fs.writeFileSync('./import/error.log', errorLog.join('\n\n'));
  console.log(colors.red + `Import completed with errors. See import/error.log for details.` + colors.reset);
} else {
  console.log(colors.green + 'Import completed successfully.' + colors.reset);
}

console.log(`Rows attempted: ${importCount}`);
console.log(`Rows imported: ${imported}`);
if (importCount < totalRows) {
  console.log(colors.yellow + `Note: ${totalRows - importCount} rows remain in the CSV file.` + colors.reset);
}
timer.end();
process.exit(failed > 0 ? 1 : 0);


