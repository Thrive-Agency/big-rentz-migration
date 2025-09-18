import { createPostByType, getTaxTermId } from './services/wordpress.js';
import db from './db/db.js';
import { applyMapping } from './merge-mapping-payload.js';

(async () => {
  try {
    // Get and lock the next available record
    const record = await db.getAndLockNextRecord();
    if (!record) {
      console.log('No available records to process.');
      return;
    }
  // Merge mapping and payload for the locked record using self-contained applyMapping
  const mergedPayload = await applyMapping(record.data);
  mergedPayload.status = 'publish'; // Set status to publish or as needed
  //console.log('Merged Payload:', JSON.stringify(mergedPayload, null, 2));

  const result = await createPostByType('rental-locations', mergedPayload);
  console.log('Create post result:', result);
} catch (error) {
    console.error('Error creating post:', error);
  }
  process.exit(0);
})();
