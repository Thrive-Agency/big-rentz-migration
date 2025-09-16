import { createPostByType } from './services/wordpress.js';
import db from './db/db.js';

(async () => {
  try {
    // Get and lock the next available record
    const record = await db.getAndLockNextRecord();
    if (!record) {
      console.log('No available records to process.');
      return;
    }
    // Use dummy data for post creation test
    const dummyData = {
      title: 'Test Rental Location',
      acf: {
        latitude: '34.000000',
        longitude: '-118.000000',
        raw_latitude: '34.000123',
        raw_longitude: '-118.000456',
        address_line_1: '123 Main St',
        address_line_2: 'Suite 100',
        address_sub_local: 'Downtown',
        postal_code: '12345',
        friendly_location_full_name: 'Testville, TS 12345'
      },
      taxonomies: {
        state: ['test-state']
      }
    };
    const result = await createPostByType('rental-locations', dummyData);
    console.log('Create post result:', result);
  } catch (error) {
    console.error('Error creating post:', error);
  }
  process.exit(0);
})();
