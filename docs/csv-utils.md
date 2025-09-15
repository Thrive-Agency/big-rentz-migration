# CSV Utilities

## getCsvHeaders
Reads the headers from a CSV file.
```js
import { getCsvHeaders } from '../utils/csvUtils.js';
const headers = await getCsvHeaders('import/yourfile.csv');
```

## getSingleCsvFile
Returns the path to the single CSV file in the `/import` directory. Throws an error if there is not exactly one CSV file.
```js
import getSingleCsvFile from '../utils/getSingleCsvFile.js';
const csvPath = getSingleCsvFile();
```

## Usage in Scripts
Scripts like `import-csv.js` and `generate-column-map.js` use these utilities to automatically detect and process the single CSV file in `/import`.

- Place only one CSV file in `/import` before running scripts.
- Scripts will notify you if there are zero or multiple CSV files.
