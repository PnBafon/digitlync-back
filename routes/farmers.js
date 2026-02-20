const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/farmers - list all farmers (with optional search)
router.get('/', async (req, res) => {
  const { search, village, crop } = req.query;
  try {
    let query = 'SELECT * FROM farmers WHERE 1=1';
    const params = [];
    let i = 1;

    if (search) {
      query += ` AND (full_name ILIKE $${i} OR phone ILIKE $${i} OR village ILIKE $${i})`;
      params.push(`%${search}%`);
      i++;
    }
    if (village) {
      query += ` AND village ILIKE $${i}`;
      params.push(`%${village}%`);
      i++;
    }
    if (crop) {
      query += ` AND crop_type ILIKE $${i}`;
      params.push(`%${crop}%`);
      i++;
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ farmers: result.rows });
  } catch (err) {
    console.error('Farmers list error:', err);
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
});

// GET /api/farmers/:id - get single farmer
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM farmers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Farmer get error:', err);
    res.status(500).json({ error: 'Failed to fetch farmer' });
  }
});

// POST /api/farmers - create farmer
router.post('/', async (req, res) => {
  const { full_name, phone, village, location, gps_lat, gps_lng, farm_size_ha, crop_type, notes } = req.body || {};
  if (!full_name || !phone) {
    return res.status(400).json({ error: 'Full name and phone are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO farmers (full_name, phone, village, location, gps_lat, gps_lng, farm_size_ha, crop_type, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        full_name.trim(),
        phone.trim(),
        village?.trim() || null,
        location?.trim() || null,
        gps_lat != null ? parseFloat(gps_lat) : null,
        gps_lng != null ? parseFloat(gps_lng) : null,
        farm_size_ha != null ? parseFloat(farm_size_ha) : null,
        crop_type?.trim() || null,
        notes?.trim() || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Farmer create error:', err);
    res.status(500).json({ error: 'Failed to create farmer' });
  }
});

// PUT /api/farmers/:id - update farmer
router.put('/:id', async (req, res) => {
  const { full_name, phone, village, location, gps_lat, gps_lng, farm_size_ha, crop_type, notes } = req.body || {};
  if (!full_name || !phone) {
    return res.status(400).json({ error: 'Full name and phone are required' });
  }

  try {
    const result = await pool.query(
      `UPDATE farmers SET
        full_name = $1, phone = $2, village = $3, location = $4,
        gps_lat = $5, gps_lng = $6, farm_size_ha = $7, crop_type = $8, notes = $9,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [
        full_name.trim(),
        phone.trim(),
        village?.trim() || null,
        location?.trim() || null,
        gps_lat != null ? parseFloat(gps_lat) : null,
        gps_lng != null ? parseFloat(gps_lng) : null,
        farm_size_ha != null ? parseFloat(farm_size_ha) : null,
        crop_type?.trim() || null,
        notes?.trim() || null,
        req.params.id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Farmer update error:', err);
    res.status(500).json({ error: 'Failed to update farmer' });
  }
});

// DELETE /api/farmers/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM farmers WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Farmer delete error:', err);
    res.status(500).json({ error: 'Failed to delete farmer' });
  }
});

module.exports = router;
