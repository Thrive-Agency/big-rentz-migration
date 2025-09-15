# MIGRATION SERVICES

## Developer Documentation

See the [Developer Documentation](./docs/index.md) for configuration, database setup, and troubleshooting guides.

## How to get your wordpress credentials:
 1. login to the site you wish to migrate data into
 2. Create a dedicated API User
 3. Navigate to `Users->Profile`
 4. Under Application Passwords, Fill in the `New Application Password Name` field with a descriptive name (Such as: Your Name Migration)
 5. Copy the code provided to your env for: `WP_API_PASS_PRODUCTION` or `WP_API_PASS_DEV`

## Database Initialization

To set up your database tables for the migration system:

1. **Update your environment variables:**
   - Copy `.example.env` to `.env` and fill in all required values for your database and API connections.

2. **Update the schema as needed:**
   - Edit `app/db/schema.sql` to add or modify tables and indexes as your requirements change.

3. **Run the initialization script:**
   - Use the following command to create the tables:
     ```sh
     npm run init-db
     ```
   - The script will only run if the tables do not already exist.

4. **Inspect the database:**
   - After running the script, use a database client (such as DBeaver, TablePlus, or psql) to inspect your database and ensure the tables and indexes look correct.

---

If you update the schema, re-run the script to apply changes. If tables already exist, the script will show you the current schema visually.
