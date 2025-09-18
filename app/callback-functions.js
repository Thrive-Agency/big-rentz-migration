// callback-functions.js
// Define preprocessing callbacks for mapping/merging logic here.
// Each function should accept (value, record, map) and return the processed value.

import { getTaxTermId } from "./services/wordpress.js";

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
  }
};
