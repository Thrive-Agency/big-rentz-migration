import { getSiteInfo } from './wordpress.js';
import { config } from '../settings.js';

(async () => {
  try {
    console.log('Testing WordPress API connection...');
    console.log('Connecting to:', `${config.WP_URL.replace(/\/+$/, '')}/wp-json`);
    console.log('ALLOW_SELF_SIGNED_CERTS:', config.ALLOW_SELF_SIGNED_CERTS);
    console.log('Node TLS setting:', process.env.NODE_TLS_REJECT_UNAUTHORIZED);
    const info = await getSiteInfo();
    console.log('Site Info:', info);
    console.log('WordPress API test succeeded.');
  } catch (err) {
    console.error('WordPress API test failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
})();
