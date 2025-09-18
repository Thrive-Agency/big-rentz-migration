// bulk-process.js
// Runs multiple process-record instances in parallel to handle many records
import { processNextRecord } from './process-record.js';
import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';
import colors from './utils/colors.js';

const header = new ScriptHeader('Bulk Process Records', 'blue');
header.print();
const timer = new ScriptTimer('Bulk Process', 'blue');
timer.start();

// Configuration
const DEFAULT_WORKERS = 5;
const DEFAULT_MAX_RECORDS = 100;

// Parse command line arguments
const args = process.argv.slice(2);
const workersArg = args.find(arg => arg.startsWith('--workers='));
const maxRecordsArg = args.find(arg => arg.startsWith('--max='));

const workers = workersArg ? parseInt(workersArg.split('=')[1], 10) : DEFAULT_WORKERS;
const maxRecords = maxRecordsArg ? parseInt(maxRecordsArg.split('=')[1], 10) : DEFAULT_MAX_RECORDS;

console.log(`${colors.cyan}Starting bulk processing with ${workers} workers, max ${maxRecords} records${colors.reset}`);

let processedCount = 0;
let successCount = 0;
let errorCount = 0;
let noRecordCount = 0;
const errors = [];

async function worker(workerId) {
  while (processedCount < maxRecords) {
    try {
      const result = await processNextRecord();
      processedCount++;
      
      if (result.status === 'success') {
        successCount++;
        console.log(`${colors.green}Worker ${workerId}: Record processed successfully (${processedCount}/${maxRecords})${colors.reset}`);
      } else if (result.status === 'no-record') {
        noRecordCount++;
        console.log(`${colors.yellow}Worker ${workerId}: No more records available${colors.reset}`);
        break; // Exit worker when no records left
      } else if (result.status === 'error') {
        errorCount++;
        errors.push(`Worker ${workerId}: ${result.error}`);
        console.error(`${colors.red}Worker ${workerId}: Error processing record${colors.reset}`);
      }
    } catch (err) {
      errorCount++;
      errors.push(`Worker ${workerId}: ${err.message}`);
      console.error(`${colors.red}Worker ${workerId}: Unexpected error: ${err.message}${colors.reset}`);
    }
  }
}

// Start workers
const workerPromises = [];
for (let i = 1; i <= workers; i++) {
  workerPromises.push(worker(i));
}

// Wait for all workers to complete
await Promise.all(workerPromises);

// Print summary
console.log(`\n${colors.cyan}=== Bulk Processing Summary ===${colors.reset}`);
console.log(`Total processed: ${processedCount}`);
console.log(`${colors.green}Successful: ${successCount}${colors.reset}`);
console.log(`${colors.red}Errors: ${errorCount}${colors.reset}`);

if (noRecordCount > 0) {
  if (successCount > 0) {
    console.log(`${colors.cyan}Workers completed: All available records processed${colors.reset}`);
  } else {
    console.log(`${colors.yellow}No records available to process${colors.reset}`);
  }
}

if (errors.length > 0) {
  console.log(`\n${colors.red}Errors encountered:${colors.reset}`);
  errors.forEach(error => console.log(`  ${error}`));
}

timer.end();
process.exit(errorCount > 0 ? 1 : 0);