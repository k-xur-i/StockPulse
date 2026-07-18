const express = require('express');
const axios = require('axios');

const router = express.Router();

const chartCache = {};
const priceCache = {};
const CHART_TTL = 24 * 60 * 60 * 1000; // 24 hours
const PRICE_TTL = 15 * 60 * 1000; // 15 minutes

// GET /api/stocks/:symbol/chart  (MUST come before /:symbol)
router.get('/:symbol/chart', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cached = chartCache[symbol];

    if (cached && Date.now() - cached.timestamp < CHART_TTL) {
      return res.json(cached.data);
    }

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}&outputsize=full`
    );

    const timeSeries = response.data['Time Series (Daily)'];

    if (!timeSeries) {
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

    chartCache[symbol] = { data: chartData, timestamp: Date.now() };
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stocks/:symbol
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cached = priceCache[symbol];

    if (cached && Date.now() - cached.timestamp < PRICE_TTL) {
      return res.json(cached.data);
    }

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = response.data['Global Quote'];

    if (!data || !data['01. symbol']) {
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

    priceCache[symbol] = { data: result, timestamp: Date.now() };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;