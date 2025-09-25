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
  }
};
