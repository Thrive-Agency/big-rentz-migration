import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';
import colors from './utils/colors.js';
import getSingleCsvFile from './utils/getSingleCsvFile.js';
import { parse } from 'csv-parse/sync';

const args = process.argv.slice(2);
const checkHeaders = args.includes('-check-headers');
let fileArg;
try {
  fileArg = getSingleCsvFile('./import');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const header = new ScriptHeader('CSV Import: Check Headers');
header.print();
const timer = new ScriptTimer('CSV Header Check');
timer.start();

if (!fileArg) {
  console.error('No CSV file specified. Usage: node import-csv.js <file.csv> -check-headers');
  timer.end();
  process.exit(1);
}

if (checkHeaders) {
  try {
    const fs = await import('fs');
    const data = fs.readFileSync(fileArg, 'utf8');
    
    // Parse CSV using proper CSV parser
    const records = parse(data, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    if (records.length === 0) {
      console.log('No data found in CSV file.');
      timer.end();
      process.exit(1);
    }
    
    const headers = Object.keys(records[0]);
    const rowCount = records.length;
    
    // Count non-empty values for each header (excluding "null" values)
    const counts = headers.map(header => {
      let count = 0;
      for (const record of records) {
        const cellValue = record[header] || '';
        if (cellValue !== '' && cellValue.toLowerCase() !== 'null') {
          count++;
        }
      }
      return count;
    });
    
    console.log(`\nTotal rows: ${rowCount}\n`);
    console.log('Headers found in CSV:');
    headers.forEach((h, i) => {
      let color = colors.green;
      if (counts[i] === 0) color = colors.red;
      else if (counts[i] !== rowCount) color = colors.yellow;
      console.log(` ${i + 1}. ${h} (${color}${counts[i]}${colors.reset})`);
    });
  } catch (err) {
    console.error('Error reading CSV headers:', err);
  }
  timer.end();
  process.exit(0);
} else {
  console.log('No action specified. Use -check-headers to print headers.');
  timer.end();
  process.exit(1);
}
