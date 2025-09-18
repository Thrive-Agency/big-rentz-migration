import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';
import colors from './utils/colors.js';
import getSingleCsvFile from './utils/getSingleCsvFile.js';

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
    const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    const rowCount = lines.length - 1;
    // Count non-empty values for each header
    const counts = headers.map((_, idx) => {
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols[idx] && cols[idx].trim() !== '') count++;
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
