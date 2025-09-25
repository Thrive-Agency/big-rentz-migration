# Check Database Headers

**Script:** `check-db.js`  
**NPM Command:** `npm run check-db-headers`  
**Purpose:** Analyze database field structure and view sample data from imported records

## Overview

The `check-db-headers` script analyzes the JSONB data stored in the `records` table to show all available fields, their data counts, and provides sample data viewing capabilities. This is essential for understanding the structure and completeness of imported data before processing.

## Usage

### Interactive Mode (Full Header List)
```bash
# Show all headers with counts and interactive field selection
npm run check-db-headers
```

### Direct Field Access (New!)
```bash
# Go directly to sample data for a specific field number
npm run check-db-headers -- 83
npm run check-db-headers -- 50
npm run check-db-headers -- 25
```

### Legacy Mode
```bash
# Explicit header checking (same as basic usage)
npm run check-db-headers -- -check-headers
```

## Features

### 1. Field Analysis
- **Field Discovery**: Scans all JSONB records to find unique field names
- **Data Counting**: Shows how many records contain non-empty data for each field
- **Sorted Display**: Fields are displayed alphabetically with numbered indices

### 2. Color-Coded Output
- 🟢 **Green**: All records have data for this field (complete coverage)
- 🟡 **Yellow**: Some records have data (partial coverage)
- 🔴 **Red**: No records have data for this field (empty field)

### 3. Sample Data Viewing
- **Random Sampling**: Shows 5 random examples from records with actual data
- **Data Filtering**: Excludes null, undefined, empty, and "null" string values
- **Format Handling**: Displays both string values and JSON objects properly

### 4. Interactive Selection
- **Number Input**: Type field numbers to see sample data
- **Input Validation**: Only accepts valid field numbers within range
- **Error Recovery**: Invalid selections show error and allow retry
- **Visual Feedback**: Shows typed characters and supports backspace
- **Easy Exit**: Press Esc to exit at any time

## Sample Output

### Header List Display
```
Total records: 4198

Headers found in database records:
 1. about_cta_label (4198)
 2. about_cta_link (4198)
 3. address_city (4198)
 4. address_line_1 (4198)
 5. address_line_2 (0)
 6. address_postal_code (4198)
 ...
 83. yext_routable_lat_long_latitude (4096)

Select a field number to see sample data (1-83, or Esc to exit): 
```

### Sample Data Display
```
Sample data for field "address_city":
========================================
1. Fresno
2. Houston
3. Phoenix  
4. Atlanta
5. Denver
========================================
Showing 5 sample(s) from 4198 records with data
```

## Command Line Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `<field_number>` | Direct access to specific field sample data | `83`, `50`, `25` |
| `-check-headers` | Explicit header checking mode (optional) | `-check-headers` |

## Data Quality Indicators

### Field Coverage Analysis
- **100% Coverage (Green)**: `address_city (4198)` - All records have this field
- **Partial Coverage (Yellow)**: `optional_field (2100)` - Some records missing this field  
- **No Data (Red)**: `unused_field (0)` - Field exists but no records have data

### Sample Data Quality
- **Valid Data**: Shows actual field values from the database
- **Filtered Results**: Excludes null, undefined, empty strings, and "null" strings
- **Random Selection**: Provides representative samples, not just first records

## Integration with Other Scripts

### Data Flow
1. **Import Stage**: `import-csv-to-db.js` → Populates `records` table
2. **Analysis Stage**: `check-db-headers` → Analyzes imported data structure
3. **Processing Stage**: `process-record.js` → Uses field data for WordPress migration

### Related Scripts
- **`check-csv-headers`**: Analyzes source CSV structure before import
- **`import-csv-to-db.js`**: Imports CSV data that this script analyzes
- **`process-record.js`**: Processes individual records using field mappings
- **`get-recent-errors`**: Shows processing errors that may relate to field issues

## Troubleshooting

### No Data Found
```
No data found in database records.
```
**Solution**: Run `npm run load-records` to import CSV data first

### Invalid Field Number
```
Invalid field number. Please enter a number between 1 and 83.
```
**Solution**: Use a valid field number from the displayed list

### Database Connection Issues
**Symptoms**: Connection errors or timeouts
**Solutions**:
- Check database is running
- Verify `.env` configuration  
- Test with `npm run show-schema`

## Best Practices

### Data Analysis Workflow
1. **Import Data**: `npm run load-records`
2. **Analyze Structure**: `npm run check-db-headers`
3. **Examine Key Fields**: Use direct field access for important fields
4. **Compare with CSV**: Cross-reference with `npm run check-csv-headers`
5. **Process Records**: Use findings to configure field mappings

### Field Investigation
- **Start with High Coverage**: Focus on fields with green (100%) coverage first
- **Investigate Partial Data**: Yellow fields may need data cleaning or fallbacks
- **Skip Empty Fields**: Red (0 count) fields can often be ignored
- **Validate Critical Fields**: Always check sample data for key fields like IDs, names, addresses

## Performance Notes

- **Direct Access**: `npm run check-db-headers -- 83` is much faster than interactive mode
- **Large Datasets**: Script handles thousands of records efficiently
- **Memory Usage**: Loads all records into memory for analysis
- **Query Optimization**: Uses efficient JSONB queries with proper indexing

## Technical Details

- **File Location**: `app/check-db.js`
- **Database Query**: `SELECT data FROM records WHERE data IS NOT NULL`
- **Data Processing**: Scans JSONB objects to extract all unique keys
- **Sampling Algorithm**: Random selection without replacement
- **Dependencies**: 
  - `ScriptHeader` and `ScriptTimer` utilities
  - `colors` utility for output formatting
  - `db` module for database connection

## See Also

- [Check CSV Headers](check-csv.md) - Analyze source CSV structure
- [Database Documentation](db.md) - Database schema and connection details  
- [Import CSV to DB](import-csv-to-db.md) - Import data for analysis
- [Get Recent Errors](get-recent-errors.md) - Debug processing issues