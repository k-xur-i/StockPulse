const nodemailer = require('nodemailer');
const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ keepAlive: false });
const { pool } = require('./server');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function checkAlerts() {
  try {
    const alerts = await pool.query('SELECT * FROM alerts WHERE triggered = false');

    if (alerts.rows.length === 0) return;

    console.log(`Checking ${alerts.rows.length} active alerts...`);

    for (const alert of alerts.rows) {
      try {
        const response = await axios.get(
  `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alert.symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
  { httpsAgent }
);

        const priceStr = response.data['Global Quote']?.['05. price'];
        if (!priceStr) continue;

        const currentPrice = parseFloat(priceStr);
        const target = parseFloat(alert.target_price);

        const shouldTrigger =
          (alert.alert_type === 'above' && currentPrice >= target) ||
          (alert.alert_type === 'below' && currentPrice <= target);

        if (shouldTrigger) {
          const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [alert.user_id]);
          const userEmail = userResult.rows[0]?.email;

          if (userEmail) {
            await transporter.sendMail({
              from: process.env.GMAIL_USER,
              to: userEmail,
              subject: `🔔 StockPulse Alert: ${alert.symbol}`,
              text: `${alert.symbol} has reached $${currentPrice} (target: ${alert.alert_type} $${target})`
            });
            console.log(`Alert email sent for ${alert.symbol} to ${userEmail}`);
          }

          await pool.query('UPDATE alerts SET triggered = true WHERE id = $1', [alert.id]);
        }
      } catch (err) {
        console.error(`Error checking alert for ${alert.symbol}:`, err.message);
      }
    }
  } catch (error) {
    console.error('checkAlerts error:', error.message);
  }
}

// Run every 5 minutes (300000 ms) to conserve API quota
setInterval(checkAlerts, 5 * 60 * 1000);

module.exports = checkAlerts;