import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';
import colors from './utils/colors.js';
import db from './db/db.js';

// Function to prompt user for field selection and show sample data
async function promptForSampleData(headers, rows) {
  return new Promise((resolve) => {
    process.stdout.write(`\n${colors.blue}Select a field number to see sample data (1-${headers.length}, or Esc to exit): ${colors.reset}`);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    let inputBuffer = '';
    
    const dataHandler = (chunk) => {
      // Esc key (ASCII 27)
      if (chunk.length === 1 && chunk[0] === 27) {
        console.log(colors.cyan + '\nExiting...' + colors.reset);
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', dataHandler);
        resolve();
        return;
      }
      // Backspace key (ASCII 8 or 127)
      else if (chunk.length === 1 && (chunk[0] === 8 || chunk[0] === 127)) {
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          process.stdout.write('\b \b');
        }
      }
      // Enter key
      else if (chunk.length === 1 && (chunk[0] === 10 || chunk[0] === 13)) {
        const num = parseInt(inputBuffer.trim(), 10);
        if (isNaN(num) || num < 1 || num > headers.length) {
          console.error(colors.red + `Invalid selection. Please enter a number between 1 and ${headers.length}.` + colors.reset);
          inputBuffer = ''; // Clear the input buffer
          process.stdout.write(`${colors.blue}Select a field number to see sample data (1-${headers.length}, or Esc to exit): ${colors.reset}`);
          return; // Don't exit, allow user to try again
        }
        
        const selectedField = headers[num - 1];
        console.log(`\n${colors.green}Sample data for field "${selectedField}":${colors.reset}`);
        console.log(`${colors.magenta}${'='.repeat(40)}${colors.reset}`);
        
        // Get rows that have non-empty data for this field
        const rowsWithData = rows.filter(row => {
          const cellValue = row.data[selectedField];
          return cellValue !== null && 
                 cellValue !== undefined && 
                 cellValue !== '' && 
                 (typeof cellValue === 'string' ? cellValue.toLowerCase() !== 'null' : true);
        });
        
        // Get 5 random samples
        const sampleCount = Math.min(5, rowsWithData.length);
        const samples = [];
        const usedIndices = new Set();
        
        while (samples.length < sampleCount) {
          const randomIndex = Math.floor(Math.random() * rowsWithData.length);
          if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            samples.push(rowsWithData[randomIndex].data[selectedField]);
          }
        }
        
        samples.forEach((sample, i) => {
          const displayValue = typeof sample === 'string' ? sample : JSON.stringify(sample);
          console.log(`${colors.yellow}${i + 1}.${colors.reset} ${colors.white}${displayValue}${colors.reset}`);
        });
        
        console.log(`${colors.magenta}${'='.repeat(40)}${colors.reset}`);
        console.log(`${colors.cyan}Showing ${sampleCount} sample(s) from ${rowsWithData.length} records with data${colors.reset}\n`);
        
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', dataHandler);
        resolve();
      }
      // Regular characters (numbers only)
      else {
        const char = chunk.toString();
        if (/^\d$/.test(char)) {
          inputBuffer += char;
          process.stdout.write(char);
        }
      }
    };
    
    process.stdin.on('data', dataHandler);
  });
}

const args = process.argv.slice(2);
const checkHeaders = args.includes('-check-headers');

const header = new ScriptHeader('Database Import: Check Headers');
header.print();
const timer = new ScriptTimer('Database Header Check');
timer.start();

if (checkHeaders) {
  try {
    // Get all records from the database
    const result = await db.pool.query('SELECT data FROM records WHERE data IS NOT NULL');
    
    if (result.rows.length === 0) {
      console.log('No data found in database records.');
      timer.end();
      process.exit(1);
    }
    
    // Collect all unique keys from all JSONB records
    const allKeys = new Set();
    result.rows.forEach(row => {
      if (row.data && typeof row.data === 'object') {
        Object.keys(row.data).forEach(key => allKeys.add(key));
      }
    });
    
    const headers = Array.from(allKeys).sort();
    const rowCount = result.rows.length;
    
    // Count non-empty values for each header (excluding "null" values)
    const counts = headers.map(header => {
      let count = 0;
      for (const row of result.rows) {
        const cellValue = row.data[header];
        if (cellValue !== null && 
            cellValue !== undefined && 
            cellValue !== '' && 
            (typeof cellValue === 'string' ? cellValue.toLowerCase() !== 'null' : true)) {
          count++;
        }
      }
      return count;
    });
    
    console.log(`\nTotal records: ${rowCount}\n`);
    console.log('Headers found in database records:');
    headers.forEach((h, i) => {
      let color = colors.green;
      if (counts[i] === 0) color = colors.red;
      else if (counts[i] !== rowCount) color = colors.yellow;
      console.log(` ${i + 1}. ${h} (${color}${counts[i]}${colors.reset})`);
    });

    // Interactive field selection for sample data
    await promptForSampleData(headers, result.rows);
    
  } catch (err) {
    console.error('Error reading database headers:', err);
  } finally {
    await db.pool.end();
  }
  timer.end();
  process.exit(0);
} else {
  console.log('No action specified. Use -check-headers to print headers.');
  await db.pool.end();
  timer.end();
  process.exit(1);
}