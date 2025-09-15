# Settings Configuration

The `app/settings.js` file loads environment variables from your `.env` file and exports a config object based on the current `MODE` (development or production). This centralizes all environment-based settings for use throughout the project.

**Key variables:**
- `MODE`: Switches between development and production settings
- `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASS`, `PG_DB`, `PG_CA_CERT_PATH`: Database connection settings
- `WC_URL_DEV`, `WC_URL_PRODUCTION`, `WP_API_PASS_DEV`, `WP_API_PASS_PRODUCTION`: WooCommerce/WordPress API settings
- `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`, `WC_VERSION`, `WP_ADMIN_USER`: WooCommerce API credentials
- `ALLOW_SELF_SIGNED_CERTS`: Controls SSL behavior for development

**Usage:**
```js
import { config } from './app/settings.js';
console.log(config.MODE); // 'development' or 'production'
```
