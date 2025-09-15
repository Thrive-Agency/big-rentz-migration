import fs from 'fs';
import path from 'path';

/**
 * Returns the path to the single CSV file in the /import directory
 * Throws an error if there is not exactly one CSV file
 */
export default function getSingleCsvFile(importDir = './import') {
  const files = fs.readdirSync(importDir).filter(f => f.endsWith('.csv'));
  if (files.length === 0) throw new Error('No CSV file found in /import directory.');
  if (files.length > 1) throw new Error('Multiple CSV files found in /import directory. Please keep only one.');
  return path.join(importDir, files[0]);
}
