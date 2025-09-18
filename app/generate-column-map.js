import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';
import colors from './utils/colors.js';
import fs from 'fs';
import getSingleCsvFile from './utils/getSingleCsvFile.js';

import { findDuplicates } from './utils/csvUtils.js';
import { parse } from 'csv-parse/sync';


export function cleanHeader(header) {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

/**
 * Create a column map node for a single CSV column
 * @param {string} header - The original column header
 * @param {number} count - Number of non-empty values in column
 * @param {string|null} example - Example value from column
 * @param {boolean} isUnique - Whether column has unique values
 * @param {Array<string>} uniqueExamples - Array of unique example values
 * @returns {object} Column map node
 */
export function createColumnMapNode(header, count, example, isUnique, uniqueExamples) {
  return {
    original: header,
    cleaned: cleanHeader(header),
    count,
    example,
    isUnique,
    uniqueExamples: isUnique ? uniqueExamples : [],
    wpMap: {
      mapped: true,
      targets: [[cleanHeader(header)]],
      handler: []
    }
  };
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
      let records;
      try {
        records = parse(data, { columns: true, skip_empty_lines: true });
      } catch (err) {
        console.error('Error parsing CSV:', err);
        timer.end();
        process.exit(1);
      }
      const headers = Object.keys(records[0] || {});
      const rowCount = records.length;
      const counts = headers.map(h => records.filter(r => r[h] && r[h].trim() !== '').length);
      // Find the first record with at least one non-empty value
      const exampleRecord = records.find(r => headers.some(h => r[h] && r[h].trim() !== ''));
      const examples = headers.map(h => {
        return exampleRecord && exampleRecord[h] && exampleRecord[h].trim() !== ''
          ? exampleRecord[h].trim()
          : null;
      });
      const uniqueInfoArr = headers.map(h => {
        const valueCount = {};
        records.forEach(r => {
          const val = r[h] && r[h].trim();
          if (val) valueCount[val] = (valueCount[val] || 0) + 1;
        });
        const uniqueValues = Object.keys(valueCount).filter(v => valueCount[v] === 1);
        return {
          isUnique: uniqueValues.length > 0,
          uniqueExamples: uniqueValues.slice(0, 10)
        };
      });
      const map = headers
        .map((h, i) => createColumnMapNode(
          h,
          counts[i],
          examples[i],
          uniqueInfoArr[i].isUnique,
          uniqueInfoArr[i].isUnique ? uniqueInfoArr[i].uniqueExamples : []
        ))
        .filter(entry => entry.count > 0);
      if (map.length > 0) {
        map[0].index = true;
      }
      // Check for duplicate cleaned keys
      const cleanedNames = map.map(entry => entry.cleaned);
      const duplicates = findDuplicates(cleanedNames);
      if (duplicates.length > 0) {
        console.log(`${colors.red}Warning: Duplicate cleaned column names found!${colors.reset}`);
        duplicates.forEach(name => console.log(`${colors.red} - ${name}${colors.reset}`));
        console.log('Please edit the mapping file to resolve duplicates before proceeding.');
      }
      fs.writeFileSync(outArg, JSON.stringify(map, null, 2));
      console.log(`\n${colors.green}Column map with ${rowCount} written to ${outArg}${colors.reset}`);
      console.log('Edit this file to remove unused columns or update cleaned names as needed.');
      timer.end();
      process.exit(0);
    } catch (err) {
      console.error('Error generating column map:', err);
    }
  }
  catch (err) {
    console.error('Unexpected error:', err);
    timer.end();
    process.exit(1);
  }
  timer.end();
  process.exit(0);
} 
