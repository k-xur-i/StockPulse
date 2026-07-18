import { useState, useEffect } from 'react';

export default function Portfolio({ userId }) {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, [userId]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `http://localhost:3000/api/portfolio?userId=${userId}`
      );
      const data = await response.json();
      console.log('Portfolio data:', data);

      if (Array.isArray(data)) {
        setHoldings(data);
      } else {
        setHoldings([]);
        setError('Unexpected response from server');
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Could not load portfolio: ' + err.message);
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (holdingId) => {
    try {
      await fetch(`http://localhost:3000/api/portfolio/${holdingId}`, {
        method: 'DELETE'
      });
      fetchPortfolio();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const totalInvested = holdings.reduce(
    (sum, h) => sum + (h.quantity * parseFloat(h.buy_price)),
    0
  );

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg text-center text-gray-600">
        Loading portfolio...
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6">💼 My Portfolio</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded mb-8">
        <p className="text-gray-600">Total Invested</p>
        <p className="text-3xl font-bold text-blue-600">₹{totalInvested.toFixed(2)}</p>
      </div>

      {holdings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No stocks in portfolio yet</p>
          <p className="mt-2">Go to "Stock Search & Chart", search a stock, then click "Add to Portfolio"</p>
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3 text-left">Symbol</th>
              <th className="border p-3 text-right">Quantity</th>
              <th className="border p-3 text-right">Buy Price</th>
              <th className="border p-3 text-right">Total</th>
              <th className="border p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50">
                <td className="border p-3 font-bold">{h.symbol}</td>
                <td className="border p-3 text-right">{h.quantity}</td>
                <td className="border p-3 text-right">₹{parseFloat(h.buy_price).toFixed(2)}</td>
                <td className="border p-3 text-right font-bold">
                  ₹{(h.quantity * parseFloat(h.buy_price)).toFixed(2)}
                </td>
                <td className="border p-3 text-center">
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    ✕ Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}