# init-db Script

The `init-db.js` script in `app/db/init-db.js` initializes your database tables from `schema.sql`.

## Usage
```sh
npm run init-db
```

**Features:**
- Creates tables and indexes as defined in `schema.sql`
- Only runs if tables do not already exist
- Safe to run multiple times
- Use with `show-schema` to confirm results
