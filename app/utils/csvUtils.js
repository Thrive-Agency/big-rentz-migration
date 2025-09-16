import fs from 'fs';

/**
 * Reads the headers from a CSV file
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<string[]>} Array of header names
 */
export async function getCsvHeaders(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return reject(err);
      const [headerLine] = data.split(/\r?\n/);
      const headers = headerLine.split(',').map(h => h.trim());
      resolve(headers);
    });
  });
}

/**
 * Returns an array of duplicate values in the input array
 * @param {string[]} arr
 * @returns {string[]} Array of duplicate values
 */
export function findDuplicates(arr) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }
  return Array.from(duplicates);
}
