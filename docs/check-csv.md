# check-csv Script

The `check-csv.js` script in `app/check-csv.js` analyzes the CSV file in the `/import` directory and prints header and row statistics.

## Usage
```sh
npm run check-csv-headers
```

- Automatically detects the single CSV file in `/import`.
- Prints total row count and each header with the count of non-empty values.
- Colors:
  - Green: All rows have data for the header
  - Yellow: Some rows are missing data
  - Red: No data for the header

**Instructions:**
- Place only one CSV file in `/import` before running the script.
- Use this script to verify your CSV before mapping or importing.
