const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS - MUST BE FIRST
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Create pool FIRST
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Export pool BEFORE requiring routes
module.exports = { pool };

// NOW require routes (after pool is exported)
const authRoutes = require('./auth');
const stockRoutes = require('./stocks');

// Use routes
app.use('/auth', authRoutes);
app.use('/api/stocks', stockRoutes);

// Portfolio routes
// POST /api/portfolio/add
app.post('/api/portfolio/add', async (req, res) => {
  const { userId, symbol, quantity, buyPrice } = req.body;
  
  try {
    // Create portfolio if doesn't exist
    let portfolio = await pool.query(
      'SELECT id FROM portfolios WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    let portfolioId;
    if (portfolio.rows.length === 0) {
      const result = await pool.query(
        'INSERT INTO portfolios (user_id, name) VALUES ($1, $2) RETURNING id',
        [userId, 'My Portfolio']
      );
      portfolioId = result.rows[0].id;
    } else {
      portfolioId = portfolio.rows[0].id;
    }

    // Add holding
    await pool.query(
      'INSERT INTO holdings (portfolio_id, symbol, quantity, buy_price) VALUES ($1, $2, $3, $4)',
      [portfolioId, symbol, quantity, buyPrice]
    );

    res.json({ success: true, message: 'Stock added to portfolio' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/portfolio
app.get('/api/portfolio', async (req, res) => {
  const { userId } = req.query;

  try {
    const result = await pool.query(
      `SELECT h.id, h.symbol, h.quantity, h.buy_price FROM holdings h
       JOIN portfolios p ON h.portfolio_id = p.id
       WHERE p.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/portfolio/:holdingId
app.delete('/api/portfolio/:holdingId', async (req, res) => {
  const { holdingId } = req.params;

  try {
    await pool.query('DELETE FROM holdings WHERE id = $1', [holdingId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Alert routes
app.post('/api/alerts', async (req, res) => {
  const { userId, symbol, targetPrice, alertType } = req.body;

  try {
    await pool.query(
      'INSERT INTO alerts (user_id, symbol, target_price, alert_type) VALUES ($1, $2, $3, $4)',
      [userId, symbol.toUpperCase(), targetPrice, alertType]
    );
    res.json({ success: true, message: 'Alert created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/alerts', async (req, res) => {
  const { userId } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/alerts/:alertId', async (req, res) => {
  const { alertId } = req.params;

  try {
    await pool.query('DELETE FROM alerts WHERE id = $1', [alertId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Test routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connected!', time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

require('./checkAlerts');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});