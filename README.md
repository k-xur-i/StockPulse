<div align="center">

# 📈 StockPulse

### *Real-time market data, without the lag.*

A full-stack stock market dashboard with live price charts, technical indicators, and a fast, cached API layer.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

**[🔗 Live Demo](https://stock-pulse-backend.vercel.app)**

</div>

---

## ✨ Overview

StockPulse is a stock tracking dashboard that pulls live market data and layers on the analysis tools traders actually use — price charts, technical indicators, portfolio tracking, and a news feed with basic sentiment scoring. Built to be fast: a custom caching layer brings API response time down from ~3s to under 200ms.

## 🚀 Features

| | |
|---|---|
| 📊 **Live Price Charts** | Real-time stock price visualization |
| 📉 **Technical Indicators** | RSI, MACD, Bollinger Bands |
| 💼 **Portfolio Tracking** | Track holdings and performance |
| 🔔 **Price Alerts** | Get notified on price movements |
| 📰 **News Feed** | Market news with basic sentiment analysis |
| ⚡ **Caching Layer** | API response time cut from 3s → <200ms |

## 🛠️ Tech Stack

```
Frontend   →  React · Vite · Tailwind CSS
Backend    →  Express · Node.js
Database   →  PostgreSQL
Data       →  Alpha Vantage API
Deployment →  Vercel (frontend) · Railway (backend)
```

## 📁 Project Structure

```
StockPulse/
├── frontend/        # React + Vite client
├── backend/          # Express API & caching layer
└── .gitignore
```

## ⚡ Getting Started

### Prerequisites
- Node.js installed
- An Alpha Vantage API key ([get one free here](https://www.alphavantage.co/support/#api-key))

### Installation

**Backend**
```bash
cd backend
npm install
npm start
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

> You'll need to add your Alpha Vantage API key as an environment variable — check the backend `.env` setup before running.

## 📈 Performance

The caching layer was the core engineering challenge here — repeated API calls to Alpha Vantage were slow and rate-limited. Adding a cache brought average response time from **~3s down to under 200ms**, while keeping data fresh enough for near real-time use. Deployed with **99.5% uptime** on Vercel and Railway.

## 🔮 Future Improvements

- [ ] More granular sentiment analysis on news
- [ ] Historical performance backtesting
- [ ] Watchlist sharing between users

---

<div align="center">
Built to make market data feel instant.
</div>
