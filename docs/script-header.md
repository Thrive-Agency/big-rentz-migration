# ScriptHeader Utility

The `ScriptHeader` class in `app/utils/ScriptHeader.js` prints a formatted header for your scripts.

## Usage
```js
import ScriptHeader from '../utils/ScriptHeader.js';
const header = new ScriptHeader('My Script');
header.print();
```

**Output:**
```
--------------------------------
Running: My Script
--------------------------------
```

You can set a color for the header (default is green):
```js
const header = new ScriptHeader('My Script', 'magenta');
header.print();
```

Supported colors: green, red, yellow, blue, magenta, cyan, white.

additional colors can be added in  /utils/colors.js
