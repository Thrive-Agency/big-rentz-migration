# Database Connection

The `app/db/db.js` file sets up a PostgreSQL connection pool using the configuration from `settings.js`. It supports SSL connections and logs detailed information for troubleshooting.

**Features:**
- Uses environment variables for all connection parameters
- Supports SSL with CA certificate
- Provides a `testConnection()` function to verify connectivity
- Logs connection config and errors for debugging

**Usage:**
```js
import db from './app/db/db.js';
await db.testConnection(); // Returns true if successful, false otherwise
```

**Troubleshooting:**
- Ensure all required environment variables are set in your `.env` file
- Check that your remote database allows connections from your IP
- Review console logs for detailed error information

## Database Schema Initialization

The database schema is defined in `app/db/schema.sql`. This file contains the SQL statements to create the initial tables and indexes for the migration system:
- `records`: Stores imported records and their processing status
- `import_errors`: Tracks errors encountered during import, linked to records
- `skipped_orders`: Records orders that were skipped, with reasons

**How to initialize the schema:**

Use the `initSchema()` function from `db.js` to create the tables and indexes defined in `schema.sql`:

```js
import db from './app/db/db.js';
await db.initSchema(); // Creates tables and indexes from schema.sql
```

**Schema Overview:**
- See `app/db/schema.sql` for full details and table definitions
- Indexes are created for efficient lookups on key columns

**Note:**
- You should run `initSchema()` once when setting up a new database.

## Functions

### testConnection
Tests the database connection by executing a simple query. Returns `true` if successful, `false` otherwise.
```js
await db.testConnection();
```

### initSchema
Initializes the database tables using the SQL statements in `schema.sql`. Returns `true` if successful, `false` otherwise.
```js
await db.initSchema();
```

### pool
The raw PostgreSQL connection pool instance. Use for advanced queries if needed.
```js
db.pool.query('SELECT * FROM records');
```

### createRecord
Inserts a new row into the `records` table with the provided data (as JSON). Returns the new record's ID or `null` if failed.
```js
const id = await db.createRecord({ foo: 'bar', value: 123 });
```

### updateRecord
Updates the `data` column of an existing record by ID. Returns `true` if the update succeeded, or `false` if it failed.
```js
const success = await db.updateRecord(1, { foo: 'updated', value: 456 });
```

### deleteAllRecords
Deletes all rows from the `records` table. Returns the number of rows deleted.
```js
const deleted = await db.deleteAllRecords();
console.log(`Deleted ${deleted} rows from records table.`);
```

### getImportCount
Gets the count of records in the `records` table where `imported = true`.
```js
const count = await db.getImportCount();
console.log(`Imported records: ${count}`);
```

### getFirstRecord
Gets the first available record from the `records` table. Criteria:
- `imported` is false or null
- `imported_id` is not set
- `processing_started` is not set
Returns the first matching row or `null` if none found.
```js
const record = await db.getFirstRecord();
console.log('First available record:', record);
```

## Script Files
- `generate-column-map.js`: Generates a column mapping JSON for the single CSV file in `/import`. Ensures the first element is flagged as index and checks for duplicate cleaned names.
- `import-csv-to-db.js`: Imports CSV data into the database using the column map. Validates index, checks for existing rows, logs errors, and verifies import counts.
