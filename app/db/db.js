import { Pool } from 'pg';
import { config } from '../settings.js';
import fs from 'fs';
import path from 'path';

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

/**
 * Inserts a new record into the records table with the given data (JSON)
 * @param {Object} data - The data to store in the record (will be stringified to JSON)
 * @returns {Promise<number|null>} The new record's id, or null if failed
 */
const createRecord = async (data) => {
  try {
    if (typeof data !== 'object' || data === null) throw new Error('Data must be a non-null object');
    const res = await pool.query(
      'INSERT INTO records (data) VALUES ($1) RETURNING id',
      [JSON.stringify(data)]
    );
    return res.rows[0].id;
  } catch (err) {
    console.error('Failed to create record:', err);
    return null;
  }
};

/**
 * Updates the data column of a record by id
 * @param {number} id - The record id to update
 * @param {Object} data - The new data to store (will be stringified to JSON)
 * @returns {Promise<boolean>} True if update succeeded, false otherwise
 */
const updateRecord = async (id, updateFields) => {
  try {
    if (typeof id !== 'number' || id <= 0) throw new Error('Invalid record id');
    if (typeof updateFields !== 'object' || updateFields === null) throw new Error('Update fields must be a non-null object');
    // Build dynamic SET clause
    const allowed = ['data', 'imported', 'imported_id', 'processing_complete', 'processing'];
    const sets = [];
    const values = [];
    let idx = 1;
    for (const key of allowed) {
      if (key in updateFields) {
        sets.push(`${key} = $${idx}`);
        values.push(key === 'data' ? JSON.stringify(updateFields[key]) : updateFields[key]);
        idx++;
      }
    }
    if (sets.length === 0) throw new Error('No valid fields to update');
    values.push(id);
    const sql = `UPDATE records SET ${sets.join(', ')} WHERE id = $${idx}`;
    const res = await pool.query(sql, values);
    return res.rowCount === 1;
  } catch (err) {
    console.error('Failed to update record:', err);
    return false;
  }
};


/**
 * Gets the count of records where imported = true
 * @returns {Promise<number>} Number of imported records
 */
const getImportCount = async () => {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM records WHERE imported = true');
    return parseInt(res.rows[0].count, 10);
  } catch (err) {
    console.error('Failed to get import count:', err);
    return 0;
  }
};

/**
 * Deletes all rows from the records table
 * @returns {Promise<number>} Number of rows deleted
 */
const deleteAllRecords = async () => {
  try {
    const res = await pool.query('DELETE FROM records');
    return res.rowCount;
  } catch (err) {
    console.error('Failed to delete all records:', err);
    return 0;
  }
};

/**
 * Atomically gets and locks the next available record for processing
 * Uses SELECT ... FOR UPDATE SKIP LOCKED to prevent race conditions
 * @returns {Promise<Object|null>} The locked record row, or null if none
 */
const getAndLockNextRecord = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const selectRes = await client.query(`
      SELECT * FROM records
      WHERE (imported IS NULL OR imported = false)
        AND (imported_id IS NULL)
        AND (processing_started IS NULL)
        AND (processing = false)
      ORDER BY id ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED;
    `);
    const record = selectRes.rows[0];
    if (!record) {
      await client.query('ROLLBACK');
      client.release();
      return null;
    }
    // Set processing=true and processing_started timestamp when locking
    await client.query(
      'UPDATE records SET processing = true, processing_started = $2 WHERE id = $1',
      [record.id, new Date().toISOString()]
    );
    await client.query('COMMIT');
    client.release();
    // Return the locked record with updated processing_started and processing
    return { ...record, processing_started: new Date().toISOString(), processing: true };
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Failed to get and lock next available record:', err);
    return null;
  }
};

/**
 * Unlocks a record by setting processing = false
 * @param {number} id - The record id to unlock
 * @returns {Promise<boolean>} True if unlock succeeded, false otherwise
 */
const unlockRecord = async (id) => {
  try {
    if (typeof id !== 'number' || id <= 0) throw new Error('Invalid record id');
    const res = await pool.query(
      'UPDATE records SET processing = false, processing_complete = $2 WHERE id = $1',
      [id, new Date().toISOString()]
    );
    return res.rowCount === 1;
  } catch (err) {
    console.error('Failed to unlock record:', err);
    return false;
  }
};

/**
 * Finds duplicate entity_id values in the records table
 * @returns {Promise<Array<{entity_id: string, count: number}>>}
 */
const findDuplicateEntityIds = async () => {
  try {
    const res = await pool.query(`
      SELECT data->>'entity_id' AS entity_id, COUNT(*) AS count
      FROM records
      GROUP BY entity_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC, entity_id ASC
      LIMIT 10;
    `);
    return res.rows;
  } catch (err) {
    console.error('Error finding duplicate entity_id values:', err);
    return [];
  }
};

/**
 * Finalizes import for a record by updating status columns
 * @param {number} id - The record id to update
 * @param {number|string} imported_id - The WordPress post id
 * @returns {Promise<Object|null>} The updated row or null on failure
 */
const finalizeImport = async (id, imported_id) => {
  console.log('Finalizing import for record id:', id, 'with imported_id:', imported_id);
  try {
    if (typeof id !== 'number' || id <= 0) throw new Error('Invalid record id');
    const updateFields = {
      imported: true,
      imported_id,
      processing_complete: new Date().toISOString(),
      processing: false
    };
    // Build dynamic SET clause
    const sets = [];
    const values = [];
    let idx = 1;
    for (const key of Object.keys(updateFields)) {
      sets.push(`${key} = $${idx}`);
      values.push(updateFields[key]);
      idx++;
    }
    values.push(id);
    const sql = `UPDATE records SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await pool.query(sql, values);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Failed to finalize import:', err);
    return null;
  }
};

const db = {
  testConnection,
  pool,
  initSchema,
  createRecord,
  updateRecord,
  deleteAllRecords,
  getImportCount,
  getAndLockNextRecord,
  unlockRecord,
  findDuplicateEntityIds,
  finalizeImport,
};

export default db;