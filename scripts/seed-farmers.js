/**
 * Create farmers table (Layer 1 - Basic Identity per SRS)
 * Run: node scripts/seed-farmers.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

async function run() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(200) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        village VARCHAR(200),
        location VARCHAR(300),
        gps_lat DECIMAL(10, 8),
        gps_lng DECIMAL(11, 8),
        farm_size_ha DECIMAL(10, 2),
        crop_type VARCHAR(200),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Farmers table created successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
