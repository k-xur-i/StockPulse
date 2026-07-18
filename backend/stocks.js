const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const CACHE_DIR = path.join(__dirname, 'cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

function readCache(file) {
  const filePath = path.join(CACHE_DIR, file);
  if (!fs.existsSync(filePath)) return null;
  const stat = fs.statSync(filePath);
  const ageMinutes = (Date.now() - stat.mtimeMs) / 60000;
  // Chart cache valid for 24 hours, price cache valid for 15 minutes
  const maxAge = file.includes('chart') ? 1440 : 15;
  if (ageMinutes > maxAge) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeCache(file, data) {
  fs.writeFileSync(path.join(CACHE_DIR, file), JSON.stringify(data));
}

// GET /api/stocks/:symbol/chart  (MUST come before /:symbol)
router.get('/:symbol/chart', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheFile = `${symbol}_chart.json`;

    const cached = readCache(cacheFile);
    if (cached) {
      console.log(`Using cached chart for ${symbol}`);
      return res.json(cached);
    }

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}&outputsize=full`
    );

    const timeSeries = response.data['Time Series (Daily)'];

    if (!timeSeries) {
      console.log('API response:', response.data);
      return res.status(404).json({ error: 'Stock data not found', apiMessage: response.data });
    }

    const chartData = Object.entries(timeSeries)
      .slice(0, 100)
      .reverse()
      .map(([date, data]) => ({
        time: date,
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
      }));

    writeCache(cacheFile, chartData);
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stocks/:symbol
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheFile = `${symbol}_price.json`;

    const cached = readCache(cacheFile);
    if (cached) {
      console.log(`Using cached price for ${symbol}`);
      return res.json(cached);
    }

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = response.data['Global Quote'];

    if (!data || !data['01. symbol']) {
      console.log('API response:', response.data);
      return res.status(404).json({ error: 'Stock data not found', apiMessage: response.data });
    }

    const result = {
      symbol: data['01. symbol'],
      price: data['05. price'],
      change: data['09. change'],
      changePercent: data['10. change percent'],
      high: data['03. high'],
      low: data['04. low'],
      volume: data['06. volume']
    };

    writeCache(cacheFile, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;