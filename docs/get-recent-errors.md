# Get Recent Errors

**Script:** `get-recent-errors.js`  
**NPM Command:** `npm run get-recent-errors`  
**Purpose:** Retrieve and display the most recent error logs from the database

## Overview

The `get-recent-errors` script queries the `import_errors` table to show the most recent error logs generated during data processing. This is essential for debugging processing issues and understanding what went wrong during record migration.

## Usage

### Basic Usage
```bash
# Get the most recent error log
npm run get-recent-errors
```

### Advanced Usage
```bash
# Get multiple recent error logs
npm run get-recent-errors -- -limit 5
```

## Command Line Arguments

| Argument | Description | Default | Example |
|----------|-------------|---------|---------|
| `-limit N` | Number of recent errors to retrieve | 1 | `-limit 10` |

## Features

### Rich Error Information
The script displays comprehensive information for each error:

- **Error ID**: Unique identifier from the database
- **Timestamp**: When the error occurred
- **Record ID**: Which record caused the error
- **Entity ID**: The entity_id from the source data (if available)
- **Record Name**: The name field from the source data (if available)
- **Status**: Resolution and import status
- **Error Messages**: Full error details (supports both single messages and arrays)

### Color-Coded Output
- 🟢 **Green**: Resolved/imported status
- 🔴 **Red**: Unresolved/not imported status  
- 🟡 **Yellow**: Field labels
- 🔵 **Cyan**: Section headings
- 🟣 **Magenta**: Separators

## Sample Output

```
Recent Error Logs:
============================================================

Error #123 (9/24/2025, 10:30:15 AM)
Record ID: 456
Entity ID: 789
Record Name: Big Rentz Location - Dallas
Status: Unresolved | Not Imported
Error Messages:
  1. Unable to convert value "invalid" to integer
  2. Missing required field: phone_number

----------------------------------------

Error #122 (9/24/2025, 10:28:45 AM)
Record ID: 455
Entity ID: 788
Record Name: Big Rentz Location - Houston
Status: Resolved | Imported
Error Messages:
  1. Warning: Empty field detected for optional parameter
============================================================
Showing 2 most recent error logs
```

## Database Query

The script performs a LEFT JOIN between `import_errors` and `records` tables:

```sql
SELECT 
  ie.id,
  ie.record_id,
  ie.error_messages,
  ie.created_at,
  ie.resolved,
  ie.imported,
  r.data->>'entity_id' as entity_id,
  r.data->>'name' as record_name
FROM import_errors ie
LEFT JOIN records r ON ie.record_id = r.id
ORDER BY ie.created_at DESC
LIMIT $1
```

## Error Types

Common error types you might see:

### Data Conversion Errors
- **Integer Conversion**: `Unable to convert value "abc" to integer`
- **Date Parsing**: `Invalid date format for field`

### Validation Errors
- **Required Fields**: `Missing required field: phone_number`
- **Format Validation**: `Invalid email format`

### API Errors
- **WordPress API**: `Failed to create WordPress post`
- **Network Issues**: `Request timeout to external service`

## Integration with Other Scripts

### Related Scripts
- **`process-record.js`**: Generates errors that this script displays
- **`bulk-process.js`**: Mass processing that may generate multiple errors
- **`check-duplicates.js`**: May log duplicate detection errors

### Error Logging
Errors are logged using the `db.logError()` function from callback functions and processing scripts.

## Troubleshooting

### No Errors Found
If the script shows "No error logs found":
- Check if any processing has been run
- Verify database connection
- Run `npm run show-schema` to confirm table exists

### Database Connection Issues
- Ensure database is running
- Check `.env` configuration
- Verify SSL certificates if using remote database

## Best Practices

1. **Regular Monitoring**: Check recent errors after bulk processing
2. **Error Analysis**: Use this script to identify patterns in errors
3. **Debugging Workflow**: 
   - Run `get-recent-errors` to see latest issues
   - Use `process-record` to test fixes on individual records
   - Monitor with `bulk-process` for larger batches

## Technical Details

- **File Location**: `app/get-recent-errors.js`
- **Dependencies**: 
  - `ScriptHeader` utility
  - `ScriptTimer` utility  
  - `colors` utility
  - `db` module
- **Database Tables**: `import_errors`, `records`
- **Exit Codes**: 0 on success, 1 on error

## See Also

- [Database Documentation](db.md) - Database schema and connection details
- [Script Header Documentation](script-header.md) - Header utility used
- [Reset Database](reset-db.md) - For clearing error logs during development