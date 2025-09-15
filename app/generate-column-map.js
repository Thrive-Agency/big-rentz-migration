import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';
import colors from './utils/colors.js';
import fs from 'fs';
import getSingleCsvFile from './utils/getSingleCsvFile.js';

function cleanHeader(header) {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

const args = process.argv.slice(2);
const importDir = './import';
let fileArg;
try {
  fileArg = getSingleCsvFile(importDir);
} catch (err) {
  console.error(err.message);
  timer.end();
  process.exit(1);
}
const outArg = args.find(arg => arg.endsWith('.json'))
  ? `${importDir}/${args.find(arg => arg.endsWith('.json')).replace(/^.*[\/]/, '')}`
  : `${importDir}/column-map.json`;

const header = new ScriptHeader('Generate Column Map');
header.print();
const timer = new ScriptTimer('Column Map Generation');
timer.start();


console.log(`Save your CSV file in the '${importDir}' directory before running this script.`);
if (!fileArg) {
  console.error('No CSV file specified. Usage: node generate-column-map.js <file.csv> [output.json]');
  timer.end();
  process.exit(1);
}

if (!fs.existsSync(fileArg)) {
  console.error(`CSV file not found: ${fileArg}`);
  timer.end();
  process.exit(1);
}

if (fs.existsSync(outArg)) {
  console.log(`\n${colors.red}---------------------------------------${colors.reset}`);
  console.log(`${colors.red}Warning!  Mapping field already exists!${colors.reset}`);
  console.log(`${colors.red}---------------------------------------${colors.reset}\n`);
  console.log('How would you like to proceed:');
  console.log('1: Print existing json');
  console.log('2: Cancel');
  console.log('3: Delete existing mapping and create new.');
  process.stdout.write('Enter your choice (default: Cancel): ');
  process.stdin.setEncoding('utf8');
  process.stdin.once('data', answer => {
    const choice = answer.trim();
    if (choice === '1') {
      const existing = fs.readFileSync(outArg, 'utf8');
      console.log('\nCurrent mapping file contents:\n', existing);
      timer.end();
      process.exit(0);
    } else if (choice === '2' || choice === '') {
      console.log('Aborting. No changes made.');
      timer.end();
      process.exit(0);
    } else if (choice === '3') {
      process.stdout.write('Type DELETE to confirm: ');
      process.stdin.once('data', confirm => {
        if (confirm.trim() === 'DELETE') {
          fs.unlinkSync(outArg);
          console.log('Old mapping file deleted. Proceeding...');
          processMapping();
        } else {
          console.log('Confirmation failed. Aborting.');
          timer.end();
          process.exit(0);
        }
      });
    } else {
      console.log('Invalid choice. Aborting.');
      timer.end();
      process.exit(0);
    }
  });
} else {
  processMapping();
}

function processMapping() {

  try {
    try {
      const data = fs.readFileSync(fileArg, 'utf8');
      const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim());
      const rowCount = lines.length - 1;
      const counts = headers.map((_, idx) => {
        let count = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols[idx] && cols[idx].trim() !== '') count++;
        }
        return count;
      });
      // Only include headers with count > 0
      const map = headers
        .map((h, i) => ({ original: h, cleaned: cleanHeader(h), count: counts[i] }))
        .filter(entry => entry.count > 0);
      fs.writeFileSync(outArg, JSON.stringify(map, null, 2));
      console.log(`\nColumn map written to ${outArg}`);
      console.log('Edit this file to remove unused columns or update cleaned names as needed.');
    } catch (err) {
      console.error('Error generating column map:', err);
    }
    timer.end();
  }
  catch (err) {
    console.error('Unexpected error:', err);
    timer.end();
    process.exit(1);
  }
  timer.end();
  process.exit(0);
} 
