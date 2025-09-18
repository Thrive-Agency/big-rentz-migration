// process-record.js
// Main app logic for processing a single record
import { createPostByType } from './services/wordpress.js';
import db from './db/db.js';
import { applyMapping } from './merge-mapping-payload.js';
import { config } from './settings.js';

/**
 * Processes the next available record: locks, maps, posts to WordPress, and unlocks.
 * @returns {Promise<{status: string, result?: any, error?: any}>}
 */
export async function processNextRecord() {
  try {
    // Get and lock the next available record
    const record = await db.getAndLockNextRecord();
    if (!record) {
      return { status: 'no-record', error: 'No available records to process.' };
    }
    // Merge mapping and payload for the locked record
    const mergedPayload = await applyMapping(record.data);
    mergedPayload.status = 'publish';
    // Send to WordPress using post type from settings
    const result = await createPostByType(config.WP_POST_SLUG, mergedPayload);

    // if no result.id, consider it an errornpm 
    if (!result?.id) {
      throw new Error('Failed to create post in WordPress');
      //TODO add log to db
    }

    // Finalize import for the record
    console.log('Record processed successfully, finalizing import...');
    await db.finalizeImport(record.id, result?.id || null);

    // Unlock record after processing (for legacy compatibility)
    await db.unlockRecord(record.id);
    return { status: 'success', result };
  } catch (error) {
    return { status: 'error', error };
  }
}

// If run directly, process one record and print result
if (import.meta.url === `file://${process.argv[1]}`) {
  processNextRecord().then(res => {
    if (res.status === 'success') {
      console.log('Create post result:', res.result);
    } else {
      console.error('Error:', res.error);
    }
    process.exit(res.status === 'success' ? 0 : 1);
  });
}
