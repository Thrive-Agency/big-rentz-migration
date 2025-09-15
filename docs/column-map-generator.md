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

**Instructions:**
- Edit `column-map.json` to remove unused columns or update cleaned names as needed.
- Only one CSV file should be present in `/import`.
- If the mapping file already exists, you will be prompted to delete and regenerate it.
