# Column Map Generator

The `generate-column-map.js` script in `app/generate-column-map.js` creates a mapping file for your CSV columns.

## Usage
```sh
npm run generate-column-map
```

- Automatically detects the single CSV file in `/import`.
- Generates `column-map.json` in `/import` with:
  - `original`: Original column name
  - `cleaned`: Suggested new name
  - `count`: Number of non-empty rows

## Example Values in Column Map

The column map generator now includes an `example` property for each column in the output JSON. This property contains a sample value from the CSV for that column (the first non-empty value found). This helps illustrate the type of data present in each column and makes it easier to understand the mapping.

**Note:** The example values are not guaranteed to come from the same record; each column's example is chosen independently from any row with data.

**Instructions:**
- Edit `column-map.json` to remove unused columns or update cleaned names as needed.
- Only one CSV file should be present in `/import`.
- If the mapping file already exists, you will be prompted to delete and regenerate it.
