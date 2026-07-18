import { useState, useEffect } from 'react';
import StockChart from './StockChart';
import Portfolio from './Portfolio';
import Alerts from './Alerts';

export default function Dashboard() {
  const [symbol, setSymbol] = useState('');
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [showAddForm, setShowAddForm] = useState(false);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      window.location.href = '/';
    }
  }, [userId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:3000/api/stocks/${symbol.toUpperCase()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await response.json();

      if (data.symbol) {
        setStock(data);
      } else {
        setError('Stock not found. Try AAPL, GOOGL, MSFT, TSLA, etc.');
      }
    } catch (err) {
      setError('Error fetching stock: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">📈 StockPulse Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto flex gap-4 p-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 font-bold border-b-2 ${
              activeTab === 'search'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            📊 Stock Search & Chart
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 font-bold border-b-2 ${
              activeTab === 'portfolio'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            💼 Portfolio
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 font-bold border-b-2 ${
              activeTab === 'alerts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            🔔 Alerts
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            {/* Search Box */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter stock symbol (e.g., AAPL, GOOGL, MSFT)"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-bold"
                >
                  {loading ? 'Loading...' : 'Search'}
                </button>
              </form>

              {error && (
                <div className="text-red-600 mt-2 font-semibold">{error}</div>
              )}
            </div>

            {/* Stock Data */}
            {stock && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold">{stock.symbol}</h2>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    {showAddForm ? '✕ Cancel' : '➕ Add to Portfolio'}
                  </button>
                </div>

                {/* Add to Portfolio Form */}
                {showAddForm && (
                  <div className="bg-gray-100 p-4 rounded mb-6">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const qty = parseInt(e.target.qty.value);
                        const price = parseFloat(e.target.price.value);
                        
                        fetch('http://localhost:3000/api/portfolio/add', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: JSON.stringify({
                            userId,
                            symbol: stock.symbol,
                            quantity: qty,
                            buyPrice: price
                          })
                        }).then(() => {
                          setShowAddForm(false);
                          e.target.reset();
                        });
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="number"
                        name="qty"
                        placeholder="Quantity"
                        required
                        className="p-2 border rounded"
                      />
                      <input
                        type="number"
                        name="price"
                        placeholder="Buy Price"
                        step="0.01"
                        required
                        className="p-2 border rounded"
                      />
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                )}

                {/* Price Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Current Price</p>
                    <p className="text-2xl font-bold text-blue-600">${stock.price}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Change</p>
                    <p className="text-2xl font-bold text-green-600">{stock.change}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Change %</p>
                    <p className="text-2xl font-bold text-purple-600">{stock.changePercent}</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Volume</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {parseInt(stock.volume).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <h3 className="text-xl font-bold mb-4">📈 Price Chart (Last 100 Days)</h3>
                <StockChart symbol={stock.symbol} />
              </div>
            )}

            {!stock && (
              <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <p className="text-gray-600 text-lg">Search for a stock to see real-time price data and chart</p>
                <p className="text-gray-500 mt-2">Try: AAPL, GOOGL, MSFT, TSLA, AMZN, META</p>
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && <Portfolio userId={userId} />}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && <Alerts userId={userId} />}
      </div>
    </div>
  );
}