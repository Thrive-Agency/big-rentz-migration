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

## Unique Value Detection in Column Map

The column map generator now includes an `isUnique` property for each column. This property is `true` if the column contains any unique values (i.e., at least one value in the column does not repeat). This helps users decide which columns may be useful for uniquely identifying records or for import decisions.

**Note:** The uniqueness check is based on the presence of any unique value, not whether all values are unique.

## Unique Value Examples in Column Map

For columns where `isUnique` is true, the column map generator now includes a `uniqueExamples` array. This array contains up to 10 unique values found in the column, helping users understand what unique data is present and make informed decisions about import requirements.

**Note:** If a column has no unique values, `uniqueExamples` will be an empty array.

**Instructions:**
- Edit `column-map.json` to remove unused columns or update cleaned names as needed.
- Only one CSV file should be present in `/import`.
- If the mapping file already exists, you will be prompted to delete and regenerate it.
