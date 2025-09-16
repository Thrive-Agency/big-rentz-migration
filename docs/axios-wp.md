# axios-wp.js

Sets up an Axios instance for connecting to the WordPress REST API.

## Features
- Loads config from `settings.js` (which uses `.env`)
- Supports Bearer token authentication via `WP_API_PASS`
- Allows self-signed certificates in development if `ALLOW_SELF_SIGNED_CERTS=true` in `.env`
- Automatically builds the base URL from config

## Usage
```js
import wpAxios from '../services/axios-wp.js';
```

## Location
- JS: `app/services/axios-wp.js`
- MD: `docs/axios-wp.md`
