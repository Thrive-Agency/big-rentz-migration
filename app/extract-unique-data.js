// extract-unique-data.js
// Generic tool to extract unique data from database records and create separate WordPress posts
// Usage: node app/extract-unique-data.js <config-file>

import fs from 'fs';
import path from 'path';
import db from './db/db.js';
import { createPostByType } from './services/wordpress.js';
import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';
import colors from './utils/colors.js';

const args = process.argv.slice(2);
const configFile = args[0];
const dryRun = args.includes('--dry-run');

if (!configFile) {
  console.error('Usage: node app/extract-unique-data.js <config-file> [--dry-run]');
  console.error('Example: node app/extract-unique-data.js faq-extraction.json');
  process.exit(1);
}

const header = new ScriptHeader(`Extract Unique Data: ${configFile}`, 'cyan');
header.print();
const timer = new ScriptTimer('Data Extraction');
timer.start();

// Load extraction configuration
let config;
try {
  const configPath = path.resolve('./import', configFile);
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error(`${colors.red}Error loading config file:${colors.reset}`, error.message);
  process.exit(1);
}

// Validate required config properties
const requiredProps = ['cpt_slug', 'source_record_id', 'columns', 'wordpress_mapping'];
for (const prop of requiredProps) {
  if (!config[prop]) {
    console.error(`${colors.red}Missing required config property: ${prop}${colors.reset}`);
    process.exit(1);
  }
}

// Load callback function if specified
let transformCallback = null;
if (config.callback_function) {
  try {
    const callbackModule = await import(`./callback-functions.js`);
    transformCallback = callbackModule.default[config.callback_function];
    if (!transformCallback) {
      console.error(`${colors.red}Callback function '${config.callback_function}' not found${colors.reset}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`${colors.red}Error loading callback function:${colors.reset}`, error.message);
    process.exit(1);
  }
}

try {
  // Get the specified source record
  console.log(`${colors.yellow}Fetching source record ID: ${config.source_record_id}${colors.reset}`);
  const result = await db.pool.query('SELECT data FROM records WHERE id = $1', [config.source_record_id]);
  
  if (result.rows.length === 0) {
    console.error(`${colors.red}No record found with ID: ${config.source_record_id}${colors.reset}`);
    process.exit(1);
  }

  const sourceRecord = result.rows[0].data;
  console.log(`${colors.green}Source record loaded successfully${colors.reset}`);

  // Extract data from specified columns
  const extractedData = {};
  for (const [key, sourceField] of Object.entries(config.columns)) {
    extractedData[key] = sourceRecord[sourceField];
    console.log(`${colors.cyan}Extracted ${key}:${colors.reset} ${Array.isArray(extractedData[key]) ? extractedData[key].length + ' items' : 'single value'}`);
  }

  // Process the data (assuming arrays that need to be paired)
  let dataItems = [];
  
  if (config.processing_mode === 'array_pairing') {
    // Pair arrays together (e.g., questions with answers)
    const keys = Object.keys(extractedData);
    const firstArray = extractedData[keys[0]];
    
    if (Array.isArray(firstArray)) {
      for (let i = 0; i < firstArray.length; i++) {
        const item = {};
        for (const key of keys) {
          if (Array.isArray(extractedData[key]) && extractedData[key][i]) {
            item[key] = extractedData[key][i];
          }
        }
        dataItems.push(item);
      }
    }
  } else if (config.processing_mode === 'single_item') {
    // Single item extraction
    dataItems.push(extractedData);
  }

  console.log(`${colors.yellow}Processing ${dataItems.length} items${colors.reset}`);

  let created = 0;
  let errors = 0;
  const errorLog = [];

  for (const [index, item] of dataItems.entries()) {
    try {
      // Apply callback transformation if specified
      let processedItem = item;
      if (transformCallback) {
        processedItem = await transformCallback(item, sourceRecord, config);
        console.log(`${colors.blue}Callback applied for item ${index + 1}${colors.reset}`);
      }

      // Build WordPress payload
      const wpPayload = {};
      
      // Map data to WordPress fields
      for (const [wpField, sourceKey] of Object.entries(config.wordpress_mapping.fields)) {
        if (processedItem[sourceKey]) {
          // Handle nested fields (e.g., "acf.field_name")
          if (wpField.includes('.')) {
            const parts = wpField.split('.');
            if (!wpPayload[parts[0]]) wpPayload[parts[0]] = {};
            wpPayload[parts[0]][parts[1]] = processedItem[sourceKey];
          } else {
            wpPayload[wpField] = processedItem[sourceKey];
          }
        }
      }

      // Set post status if specified
      if (config.wordpress_mapping.status) {
        wpPayload.status = config.wordpress_mapping.status;
      }

      if (dryRun) {
        console.log(`${colors.green}[DRY RUN] Would create post ${index + 1}:${colors.reset}`);
        console.log(JSON.stringify(wpPayload, null, 2));
      } else {
        // Create WordPress post
        const wpResponse = await createPostByType(config.cpt_slug, wpPayload);
        created++;
        console.log(`${colors.green}Created post ${index + 1}: ID ${wpResponse.id} - "${wpResponse.title?.rendered || 'No title'}"${colors.reset}`);
      }

    } catch (error) {
      errors++;
      const errorMsg = `Failed to process item ${index + 1}: ${error.message}`;
      errorLog.push(errorMsg);
      console.error(`${colors.red}${errorMsg}${colors.reset}`);
    }
  }

  // Summary
  console.log(`\n${colors.cyan}=== Extraction Summary ===${colors.reset}`);
  if (dryRun) {
    console.log(`${colors.yellow}[DRY RUN] Would have created: ${dataItems.length - errors}${colors.reset}`);
  } else {
    console.log(`${colors.green}Successfully created: ${created}${colors.reset}`);
  }
  console.log(`${colors.red}Errors: ${errors}${colors.reset}`);
  
  if (errorLog.length > 0) {
    console.log(`\n${colors.red}Error details:${colors.reset}`);
    errorLog.forEach(error => console.log(`  ${error}`));
  }

} catch (error) {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
} finally {
  await db.pool.end();
  timer.end();
  process.exit(0);
}