import {
  getPostsByType,
  getPostByType,
  createPostByType,
  getTaxonomyTerms
} from './services/wordpress.js';
import db from './db/db.js';

// Example usage: Fetch and log all rental locations
(async () => {
  try {
    // Print first row's data column from the database using db controller
    const firstRecord = await db.getFirstRecord();
    if (firstRecord) {
      console.log('First row data column:', firstRecord.data);
    } else {
      console.log('No rows found in records table.');
    }

    const locations = await getPostsByType('rental-locations');
    console.log('Rental Locations:', locations);
    // Fetch all state taxonomy terms once
    const stateTerms = await getTaxonomyTerms('state');
    // Log ACF fields and state taxonomy for each location
    locations.forEach(loc => {
      if (loc.acf) {
        console.log(`ACF fields for location ${loc.id}:`, loc.acf);
      } else {
        console.log(`No ACF fields for location ${loc.id}`);
      }
      if (loc.state) {
        // loc.state is an array of term IDs
        const terms = Array.isArray(loc.state) ? loc.state : [loc.state];
        const termDetails = terms.map(termId => stateTerms.find(t => t.id === termId));
        console.log(`State taxonomy for location ${loc.id}:`, termDetails);
      } else {
        console.log(`No state taxonomy for location ${loc.id}`);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
