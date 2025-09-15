console.log('Starting migration service...');
import db from './app/db/db.js';

async function init() {
  console.log('Testing database connection...');
  try {
    const isConnected = await db.testConnection();
    if (isConnected) {
      console.log('Database connection established successfully.');
    } else {
      console.error('Failed to connect to the database.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during database connection test:', error);
    process.exit(1);
  }
}

init();