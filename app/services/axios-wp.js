import axios from 'axios';
import { config } from '../settings.js';
import https from 'https';

if (!config.WP_URL) {
  console.error('[WP API] Error: WordPress API URL is not set in settings.js or environment variables.');
  throw new Error('WordPress API URL missing. Set WP_URL in your environment or settings.js.');
}

const agent = config.ALLOW_SELF_SIGNED_CERTS
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;

const wpAxios = axios.create({
  baseURL: `${config.WP_URL.replace(/\/+$/, '')}/wp-json`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    ...(config.WP_API_PASS ? { 'Authorization': `Bearer ${config.WP_API_PASS}` } : {}),
  },
  httpsAgent: agent,
});

export default wpAxios;
