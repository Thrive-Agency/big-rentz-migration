# reset-db.js

Safely resets (empties) the database table in the migration project. This script is intentionally difficult to run to prevent accidental data loss.

## Safety Features
- **Multiple confirmations required**: User must confirm twice and type "RESET".
- **Imported records check**: If any rows have `imported = true`, the script aborts and instructs the user to use their database client for manual management.
- **Color-coded warnings**: Uses red for warnings and green for success.

## Usage

```sh
npm run reset-db
```

## Prompts
1. Initial warning and confirmation (`y/N`).
2. Fails if imported records exist.
3. Requires typing `RESET` to continue.
4. Final confirmation (`y/N`).

## Output
- Aborts with a message if any safety check fails.
- Prints the number of deleted rows if successful.

## Location
- Script: `app/reset-db.js`
- NPM Script: `reset-db`

## See Also
- [`db.js`](./db.md) for database controller functions.
- [`getImportCount`](./db.md#getimportcount) for imported record check.
