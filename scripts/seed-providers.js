/**
 * Create providers table (Layer 1 - Basic Identity per SRS)
 * Run: node scripts/seed-providers.js
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
      CREATE TABLE IF NOT EXISTS providers (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(200) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        services_offered VARCHAR(500),
        work_capacity_ha_per_hour DECIMAL(10, 2),
        base_price_per_ha DECIMAL(12, 2),
        equipment_type VARCHAR(200),
        service_radius_km DECIMAL(8, 2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Providers table created successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
