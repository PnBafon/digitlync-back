/**
 * Seed default admin user into database.
 * Run: node scripts/seed-admin.js
 *
 * Seeds the default admin user (run after deploy or credential rotation).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const crypto = require('crypto');

const ADMIN_USERNAME = 'Reset@Digilync';
const ADMIN_PASSWORD = 'Reset@Password!';
const LEGACY_USERNAME = 'admin1234';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query('DELETE FROM admins WHERE username = $1', [LEGACY_USERNAME]);

    const hash = hashPassword(ADMIN_PASSWORD);
    await pool.query(
      `INSERT INTO admins (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [ADMIN_USERNAME, hash]
    );

    console.log('Admin user seeded successfully.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
