import fs from 'fs';
import path from 'path';
import callbacks from './callback-functions.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const columnMapPath = path.join(__dirname, '../import/column-map.json');

function getJsonOrThrow(filePath, name) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required file missing: ${name} (${filePath})`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// function to set the path on the mapping template
function setPathValue(object, path = [], value)
{
  let current = object;
  if (!Array.isArray(path) || path.length === 0) {
    throw new Error('Path must be a non-empty array');
  }

  if (typeof path === 'string') {
    current[path] = value;
    return; 
  }

  while (path.length > 1){
    const segment = path.shift();
    if (!current[segment])  current[segment] = {};
    current = current[segment];
  }
  current[path.shift()] = value;
}

function setValuesOnAllPaths(object, paths = [], value){
  if (!Array.isArray(paths) || typeof paths === 'string') setPathValue(object, paths, value);
  for (const path of paths) {
    setPathValue(object, path, value);
  }
}


/**
 * Applies a mapping to a given record based on a predefined column map.
 *
 * This function processes a record by iterating through a column map, applying
 * transformations or handlers as specified, and constructing a result object
 * based on the mapping configuration. Handlers can be used to modify or process
 * attribute values before they are added to the result.
 *
 * @async
 * @function applyMapping
 * @param {Object} record - The input record to which the mapping will be applied.
 * @returns {Promise<Object|null>} The resulting object after applying the mapping,
 * or `null` if an error occurs during the process.
 *
 * @throws {Error} If there is an issue reading the column map or during the mapping process.
 *
 */
export async function applyMapping(record) {
  try {
    const columnMap = getJsonOrThrow(columnMapPath, 'column-map.json');
    const result = {};
    console.log('Record:', record);
    for (const colMap of columnMap) {
      // Skip element if not set to map
      if (!colMap.wpMap || !colMap.wpMap.mapped) continue;

      // Get the database column name from the attribute
      let attributeValue = record[colMap.cleaned];
      // If a handler is specified, run it
      if( colMap.wpMap.handler ) {
        console.log('colMap.wpMap.handler:', colMap.wpMap.handler);
        // Found a handler run the callback
        attributeValue = await callbacks[colMap.wpMap.handler[0]](attributeValue, record, colMap.wpMap.handler[1]);
      }
      // Add the direct attributeValue or the result of the handler to the payload
      // to the specified field in the payload template
      if( colMap.wpMap.targets ) {
        setValuesOnAllPaths(result, colMap.wpMap.targets, attributeValue);
      } else {
        throw new Error(`No targets defined in mapping for column: ${colMap.cleaned}`);
      }
    }
    console.log('Final merged result:', result);
    return result;
  } catch (error) {
    console.error('Error occurred during merge mapping: ', error)
    return null;
  }
  
}
