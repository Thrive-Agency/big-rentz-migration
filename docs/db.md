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

## Utilities for Script Development
- [ScriptHeader](./script-header.md): Print a formatted, colored header for your scripts.
- [ScriptTimer](./script-timer.md): Track and print execution time with color support.
