// callback-functions.js
// Define preprocessing callbacks for mapping/merging logic here.
// Each function should accept (value, record, map) and return the processed value.

import { getTaxTermId } from "./services/wordpress.js";
import db from "./db/db.js";


export default {
  /**
   * Uppercase a string value.
   * @param {string} value - The value to uppercase.
   * @returns {string} Uppercased string or original value if not a string.
   * Usage: ["uppercase"]
   */
  uppercase: (value) => typeof value === 'string' ? value.toUpperCase() : value,

  /**
   * Trim whitespace from a string value.
   * @param {string} value - The value to trim.
   * @returns {string} Trimmed string or original value if not a string.
   * Usage: ["trim"]
   */
  trim: (value) => typeof value === 'string' ? value.trim() : value,

  /**
   * Cast value to integer. returns null and logs to db if failure
   * @param {any} value - The value to cast.
   * @param {object} record - The full record being processed.
   * @returns {number|null} The integer value or null if conversion fails.
   * Usage: ["toInteger"]
   */
  toInteger: (value, record) => {
    console.log('toInteger called with value:', value, 'isString:', typeof value === 'string');
    if (value === null || value === undefined || value === '') {
      db.logError(record.id, new Error('Value is null, undefined, or empty string'));
      return null;
    }
    const intValue = parseInt(value, 10);
    if (isNaN(intValue)) {
      console.warn(`Warning: Unable to convert value "${value}" to integer in record:`, record);
      // Log the error to the database or monitoring system
      db.logError(record.id, new Error(`Unable to convert value "${value}" to integer`));
      return null;
    }
    console.log('toInteger returning:', intValue);
    return intValue;
  },

  /**
   * Lookup a WordPress taxonomy term ID by value and taxonomy slug.
   * @param {string} value - The term name or slug to look up.
   * @param {object} record - The full record being processed.
   * @param {object} args - Handler arguments, e.g. { taxonomy: "state" }
   * @returns {Promise<number|null>} The term ID or null if not found.
   * Usage: ["getTaxonomyTermId", { "taxonomy": "state" }]
   */
  getTaxonomyTermId: async (value, record, args) => {
    console.log('getTaxonomyTermId called with value:', value, 'args:', args);
    if (typeof value !== 'string' || !value.trim()) return null;
    const termId = await getTaxTermId(value.trim(), args.taxonomy);
    if (!termId) {
      console.warn(`Warning: Term "${value}" not found in taxonomy "${args.taxonomy}".`);
    }
    return [termId];
  },

  /**
   * Set an alternate field value if the current value is empty.
   * @param {string|null} value - The current value of the field.
   * @param {object} record - The full record being processed.
   * @param {object} args - Handler arguments, e.g., { sourceField: "alternateFieldName" }.
   * @param {string} args.sourceField - The name of the field to use as an alternate source.
   * @returns {Promise<string|null>} The original value, or the trimmed value of the alternate field if the original is empty.
   * Usage: ["setAlternateField", { "sourceField": "alternateFieldName" }]
   */
  setFallbackField: async (value, record, args) => {
    console.log('setAlternateField called with value:', value, 'args:', args);
    // check if value is empty, if so set from another field in record
    if ((!value || (typeof value === 'string' && !value.trim())) && args.sourceField) {
      const altValue = record[args.sourceField];
      if (altValue && typeof altValue === 'string' && altValue.trim()) {
        return altValue.trim();
      }
    }
    return value;
  },

  /**
   * Testing Callback Function to log out the current value and record.
   * @param {any} value - The current value of the field.
   * @param {object} record - The full record being processed.
   * @returns {any} The original value, unchanged.
   * Usage: ["logValue"]
   */
  logValue: (value, record) => {
    console.log('logValue called with value:', value);
    return value;
  },

  /**
   * Validate and clean FAQ data for extraction.
   * @param {object} item - The extracted FAQ item with questions and answers.
   * @param {object} sourceRecord - The original source record.
   * @param {object} config - The extraction configuration.
   * @returns {object} The validated and cleaned FAQ item.
   * Usage: Used in extract-unique-data.js
   */
  validateFaqData: (item, sourceRecord, config) => {
    const cleaned = { ...item };
    
    // Clean and validate question
    if (cleaned.questions) {
      cleaned.questions = cleaned.questions.trim();
      // Ensure question ends with question mark
      if (!cleaned.questions.endsWith('?')) {
        cleaned.questions += '?';
      }
    }

    // Clean and validate answer
    if (cleaned.answers) {
      cleaned.answers = cleaned.answers.trim();
      // Remove any HTML tags if present
      cleaned.answers = cleaned.answers.replace(/<[^>]*>/g, '');
    }

    // Skip empty items
    if (!cleaned.questions || !cleaned.answers) {
      return null;
    }

    console.log('FAQ validated:', cleaned.questions.substring(0, 50) + '...');
    return cleaned;
  },

  /**
   * Create a slug from category name and validate category data.
   * @param {object} item - The extracted category item.
   * @param {object} sourceRecord - The original source record.
   * @param {object} config - The extraction configuration.
   * @returns {object} The processed category item with slug.
   * Usage: Used in extract-unique-data.js
   */
  slugifyCategory: (item, sourceRecord, config) => {
    const processed = { ...item };
    
    // Create slug from category name
    if (processed.category_name) {
      processed.category_slug = processed.category_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Validate required fields
    if (!processed.category_name) {
      console.warn('Category missing name, skipping...');
      return null;
    }

    console.log('Category processed:', processed.category_name, '→', processed.category_slug);
    return processed;
  },

  /**
   * Build ACF repeater field data from paired arrays.
   * @param {object} item - The extracted item with array data.
   * @param {object} sourceRecord - The original source record.
   * @param {object} config - The extraction configuration.
   * @returns {object} The processed item with ACF repeater structure.
   * Usage: Used in extract-unique-data.js for ACF repeater fields
   */
  buildServiceAreaRepeater: (item, sourceRecord, config) => {
    const processed = {
      location_name: sourceRecord.name || 'Service Location',
      location_description: sourceRecord.description || '',
      repeater_data: []
    };

    // Build repeater field data from paired arrays
    if (item.area_names && Array.isArray(item.area_names)) {
      for (let i = 0; i < item.area_names.length; i++) {
        const repeaterRow = {
          area_name: item.area_names[i] || '',
          area_description: (item.area_descriptions && item.area_descriptions[i]) || '',
          zipcode: (item.area_zipcodes && item.area_zipcodes[i]) || '',
          population: (item.area_populations && item.area_populations[i]) || ''
        };

        // Only add rows with at least a name
        if (repeaterRow.area_name.trim()) {
          processed.repeater_data.push(repeaterRow);
        }
      }
    }

    console.log(`Built repeater with ${processed.repeater_data.length} service areas for: ${processed.location_name}`);
    return processed;
  },

  /**
   * Build ACF repeater field for team members.
   * @param {object} item - The extracted item with team member data.
   * @param {object} sourceRecord - The original source record.
   * @param {object} config - The extraction configuration.
   * @returns {object} The processed item with team member repeater structure.
   * Usage: Used in extract-unique-data.js for team member repeater fields
   */
  buildTeamMemberRepeater: (item, sourceRecord, config) => {
    const processed = {
      department_name: sourceRecord.department_name || 'Department',
      department_description: sourceRecord.department_description || '',
      repeater_data: []
    };

    // Build team members repeater
    if (item.member_names && Array.isArray(item.member_names)) {
      for (let i = 0; i < item.member_names.length; i++) {
        const memberRow = {
          name: item.member_names[i] || '',
          title: (item.member_titles && item.member_titles[i]) || '',
          email: (item.member_emails && item.member_emails[i]) || '',
          phone: (item.member_phones && item.member_phones[i]) || '',
          bio: (item.member_bios && item.member_bios[i]) || '',
          photo_url: (item.member_photos && item.member_photos[i]) || ''
        };

        // Only add members with at least a name
        if (memberRow.name.trim()) {
          processed.repeater_data.push(memberRow);
        }
      }
    }

    console.log(`Built team repeater with ${processed.repeater_data.length} members for: ${processed.department_name}`);
    return processed;
  }
};
