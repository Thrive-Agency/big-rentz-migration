// settings.js
import dotenv from 'dotenv';
dotenv.config();

const MODE = process.env.MODE || 'development';

export const config = {
  MODE,
  // Database connection settings
  PG_HOST: process.env.PG_HOST,
  PG_PORT: process.env.PG_PORT,
  PG_USER: process.env.PG_USER,
  PG_PASS: process.env.PG_PASS,
  PG_DB: process.env.PG_DB,
  PG_CA_CERT_PATH: process.env.PG_CA_CERT_PATH,

  // WooCommerce API settings
  WP_URL:
    MODE === 'production'
      ? process.env.WP_URL_PRODUCTION
      : process.env.WP_URL_DEV,
  WP_API_PASS:
    MODE === 'production'
      ? process.env.WP_API_PASS_PRODUCTION
      : process.env.WP_API_PASS_DEV,

  // WooCommerce API Credentials
  WC_CONSUMER_KEY: process.env.WC_CONSUMER_KEY,
  WC_CONSUMER_SECRET: process.env.WC_CONSUMER_SECRET,
  WC_VERSION: process.env.WC_VERSION,
  WP_ADMIN_USER: process.env.WP_ADMIN_USER,

  // Certificate settings
  ALLOW_SELF_SIGNED_CERTS:
    MODE === 'development'
      ? 'true'
      : false,
};
