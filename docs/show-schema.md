# show-schema Script

The `show-schema.js` script in `app/db/show-schema.js` prints a visual overview of your current database tables and columns.

## Usage
```sh
npm run show-schema
```

**Features:**
- Prints a formatted list of all tables and their columns
- Notifies if no tables are found and suggests running the init script
- Useful for confirming schema after migrations or initialization
