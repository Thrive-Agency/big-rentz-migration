// add-column-to-map.js
// Usage: node add-column-to-map.js <column-number>
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import getSingleCsvFile from './utils/getSingleCsvFile.js';

const columnMapPath = './import/column-map.json';
const csvPath = getSingleCsvFile('./import');



const csvData = fs.readFileSync(csvPath, 'utf8');
const records = parse(csvData, { columns: true, skip_empty_lines: true });
const headers = Object.keys(records[0] || {});

let columnMap = [];
if (fs.existsSync(columnMapPath)) {
  columnMap = JSON.parse(fs.readFileSync(columnMapPath, 'utf8'));
}

console.log('CSV Columns:');
headers.forEach((h, i) => {
  console.log(` ${i + 1}. ${h}`);
});

process.stdout.write('Select a column number to add: ');
process.stdin.setEncoding('utf8');
process.stdin.once('data', input => {
  const colNum = parseInt(input.trim(), 10);
  if (isNaN(colNum) || colNum < 1 || colNum > headers.length) {
    console.error('Invalid column number.');
    process.exit(1);
  }
  const header = headers[colNum - 1];
  // Build cleaned version: lowercased, spaces and non-alphanumerics replaced with _
  const cleaned = header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  // Add full mapping object
  const newNode = {
    original: header,
    cleaned,
    wpMap: {
      mapped: true,
      targets: [[cleaned]],
      handler: []
    }
  };
  columnMap.push(newNode);
  fs.writeFileSync(columnMapPath, JSON.stringify(columnMap, null, 2));
  console.log(`Added column '${header}' to column-map.json.`);
  process.exit(0);
});
