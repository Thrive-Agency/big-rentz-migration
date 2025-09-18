// check-duplicates.js
// Utility script to check for duplicate entity_id values in the records table
import db from './db/db.js';

async function checkDuplicates() {
  try {
    const duplicates = await db.findDuplicateEntityIds();
    if (duplicates.length === 0) {
      console.log('No duplicate entity_id values found.');
    } else {
      console.log('Duplicate entity_id values:');
      duplicates.forEach(row => {
        console.log(`entity_id: ${row.entity_id} | count: ${row.count}`);
      });
    }
  } catch (err) {
    console.error('Error checking for duplicates:', err);
  }
  process.exit(0);
}

checkDuplicates();
