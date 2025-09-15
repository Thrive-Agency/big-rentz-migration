import { Pool } from 'pg';
// ...existing code...
import { config } from '../settings.js';

const { MODE, PG_HOST, PG_PORT, PG_USER, PG_PASS, PG_DB, PG_CA_CERT_PATH, ALLOW_SELF_SIGNED_CERTS } = config;

let sslConfig;
try {
  sslConfig = {
    rejectUnauthorized: ALLOW_SELF_SIGNED_CERTS === 'true' ? false : true,
    ca: fs.readFileSync(path.resolve(PG_CA_CERT_PATH)),
  };
} catch (err) {
  console.error('Error reading CA certificate:', err);
  sslConfig = false;
}

const pool = new Pool({
  host: PG_HOST,
  port: PG_PORT,
  user: PG_USER,
  password: PG_PASS,
  database: PG_DB,
  ssl: sslConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  acquireTimeoutMillis: 10000,
});

/**
 * Tests the database connection by executing a simple query
 * @returns {Promise<boolean>} True if connection is successful, false otherwise
 */
const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    await pool.connect();
    const res = await pool.query('SELECT NOW()');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack,
      name: err.name,
      detail: err.detail,
      hint: err.hint,
      severity: err.severity,
      connectionParameters: {
        host: PG_HOST,
        port: PG_PORT,
        user: PG_USER,
        database: PG_DB,
      }
    });
    return false;
  }
}

import fs from 'fs';
import path from 'path';

/**
 * Initializes the database tables using the schema.sql file
 */
const initSchema = async () => {
  try {
    const schemaPath = path.resolve(path.dirname(import.meta.url.replace('file://', '')), 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('Database schema initialized successfully.');
    return true;
  } catch (err) {
    console.error('Failed to initialize database schema:', err);
    return false;
  }
};

const db = {
  testConnection,
  pool,
  initSchema,
};

export default db;