const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    let query = 'SELECT * FROM providers WHERE 1=1';
    const params = [];
    if (search) {
      query += ' AND (full_name ILIKE $1 OR phone ILIKE $1 OR services_offered ILIKE $1)';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ providers: result.rows });
  } catch (err) {
    console.error('Providers list error:', err);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM providers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Provider get error:', err);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

router.post('/', async (req, res) => {
  const { full_name, phone, services_offered, work_capacity_ha_per_hour, base_price_per_ha, equipment_type, service_radius_km, notes } = req.body || {};
  if (!full_name || !phone) return res.status(400).json({ error: 'Full name and phone are required' });
  try {
    const result = await pool.query(
      `INSERT INTO providers (full_name, phone, services_offered, work_capacity_ha_per_hour, base_price_per_ha, equipment_type, service_radius_km, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [full_name.trim(), phone.trim(), services_offered?.trim() || null, work_capacity_ha_per_hour != null ? parseFloat(work_capacity_ha_per_hour) : null, base_price_per_ha != null ? parseFloat(base_price_per_ha) : null, equipment_type?.trim() || null, service_radius_km != null ? parseFloat(service_radius_km) : null, notes?.trim() || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Provider create error:', err);
    res.status(500).json({ error: 'Failed to create provider' });
  }
});

router.put('/:id', async (req, res) => {
  const { full_name, phone, services_offered, work_capacity_ha_per_hour, base_price_per_ha, equipment_type, service_radius_km, notes } = req.body || {};
  if (!full_name || !phone) return res.status(400).json({ error: 'Full name and phone are required' });
  try {
    const result = await pool.query(
      `UPDATE providers SET full_name=$1, phone=$2, services_offered=$3, work_capacity_ha_per_hour=$4, base_price_per_ha=$5, equipment_type=$6, service_radius_km=$7, notes=$8, updated_at=CURRENT_TIMESTAMP WHERE id=$9 RETURNING *`,
      [full_name.trim(), phone.trim(), services_offered?.trim() || null, work_capacity_ha_per_hour != null ? parseFloat(work_capacity_ha_per_hour) : null, base_price_per_ha != null ? parseFloat(base_price_per_ha) : null, equipment_type?.trim() || null, service_radius_km != null ? parseFloat(service_radius_km) : null, notes?.trim() || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Provider update error:', err);
    res.status(500).json({ error: 'Failed to update provider' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM providers WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Provider delete error:', err);
    res.status(500).json({ error: 'Failed to delete provider' });
  }
});

module.exports = router;
