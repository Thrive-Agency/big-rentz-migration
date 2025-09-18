# Help Script Usage

The interactive help script provides a user-friendly way to view and run any npm script in this project.

## Features
- Lists all available npm scripts with numbers and usage instructions.
- Prompts you to select a script by number.
- Runs the selected script automatically.
- Uses color formatting for clarity and easy reading.

## How to Use
1. Run the help script:
   ```sh
   npm run help
   ```
2. Review the numbered list of available scripts.
3. Enter the number of the script you want to run and press Enter.
4. The selected script will execute automatically.

## Example Output
```
Available npm scripts:
----------------------
1. show-schema - (npm run show-schema)
2. load-records - (npm run load-records)
3. process-record - (npm run process-record)
...
Select a script number to run: 
```

## Notes
- The help script uses color formatting for improved readability.
- In VS Code, you can copy/paste or Ctrl+Click the usage command for convenience.
- The script will exit after running the selected command.

---
