/**
 * Analytics API - real data for admin dashboard
 * Agricultural & marketplace intelligence
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/analytics/overview - key metrics
router.get('/overview', async (req, res) => {
  try {
    const [farmers, providers, bookings, unassigned, ratings] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS c FROM farmers').then((r) => r.rows[0]?.c ?? 0),
      pool.query('SELECT COUNT(*)::int AS c FROM providers').then((r) => r.rows[0]?.c ?? 0),
      pool.query('SELECT COUNT(*)::int AS c FROM bookings').then((r) => r.rows[0]?.c ?? 0),
      pool.query("SELECT COUNT(*)::int AS c FROM bookings WHERE provider_id IS NULL AND status = 'pending'").then((r) => r.rows[0]?.c ?? 0),
      pool.query('SELECT AVG(rating)::float AS avg, COUNT(*)::int AS count FROM farmer_ratings').then((r) => ({ avg: parseFloat(r.rows[0]?.avg) || 0, count: r.rows[0]?.count ?? 0 })),
    ]);
    res.json({ farmers, providers, bookings, unassigned, ratings });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics/services - most requested services
router.get('/services', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT service_type AS name, COUNT(*)::int AS count
       FROM bookings WHERE service_type IS NOT NULL AND service_type != ''
       GROUP BY service_type ORDER BY count DESC LIMIT 10`
    );
    res.json({ services: r.rows });
  } catch (err) {
    console.error('Analytics services error:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/analytics/crops - crop distribution
router.get('/crops', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT crop_type AS name, COUNT(*)::int AS count
       FROM farmers WHERE crop_type IS NOT NULL AND crop_type != ''
       GROUP BY crop_type ORDER BY count DESC LIMIT 10`
    );
    res.json({ crops: r.rows });
  } catch (err) {
    console.error('Analytics crops error:', err);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

// GET /api/analytics/bookings-trend - bookings by month
router.get('/bookings-trend', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*)::int AS count
       FROM bookings
       GROUP BY TO_CHAR(created_at, 'YYYY-MM')
       ORDER BY month DESC LIMIT 12`
    );
    res.json({ trend: r.rows.reverse() });
  } catch (err) {
    console.error('Analytics bookings-trend error:', err);
    res.status(500).json({ error: 'Failed to fetch trend' });
  }
});

module.exports = router;
