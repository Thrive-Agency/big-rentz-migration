# ScriptTimer Utility

The `ScriptTimer` class in `app/utils/ScriptTimer.js` helps you measure and print the execution time of any script.

## Usage
```js
import ScriptTimer from '../utils/ScriptTimer.js';
const timer = new ScriptTimer('My Script');
timer.start();
// ... your script logic ...
timer.end();
```

**Output:**
- Start and end timestamps
- Execution time in milliseconds

Use this utility at the beginning and end of any script to track performance.

## Color Support
You can set the color of the timer output by passing a color name (e.g., 'cyan', 'green', 'red') to the constructor:
```js
const timer = new ScriptTimer('My Script', 'green');
timer.start();
// ...
timer.end();
```
