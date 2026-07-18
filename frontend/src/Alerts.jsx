import { useState, useEffect } from 'react';

export default function Alerts({ userId }) {
  const [alerts, setAlerts] = useState([]);
  const [symbol, setSymbol] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState('above');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, [userId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/alerts?userId=${userId}`);
      const data = await response.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          symbol: symbol.toUpperCase(),
          targetPrice: parseFloat(targetPrice),
          alertType
        })
      });

      const data = await response.json();

      if (data.success) {
        setSymbol('');
        setTargetPrice('');
        fetchAlerts();
      } else {
        setError(data.error || 'Failed to create alert');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (alertId) => {
    try {
      await fetch(`http://localhost:3000/api/alerts/${alertId}`, {
        method: 'DELETE'
      });
      fetchAlerts();
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg text-center text-gray-600">
        Loading alerts...
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6">🔔 Price Alerts</h2>

      {/* Create Alert Form */}
      <div className="bg-gray-100 p-6 rounded mb-8">
        <h3 className="font-bold mb-4">Set a New Alert</h3>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateAlert} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Symbol (e.g., AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            required
            className="p-2 border rounded"
          />

          <select
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="above">Price goes above</option>
            <option value="below">Price goes below</option>
          </select>

          <input
            type="number"
            step="0.01"
            placeholder="Target Price"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            required
            className="p-2 border rounded"
          />

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? 'Creating...' : 'Create Alert'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-2">
          💡 We check prices every 5 minutes and email you when the target is hit.
        </p>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No alerts set yet</p>
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3 text-left">Symbol</th>
              <th className="border p-3 text-left">Condition</th>
              <th className="border p-3 text-right">Target Price</th>
              <th className="border p-3 text-center">Status</th>
              <th className="border p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="border p-3 font-bold">{a.symbol}</td>
                <td className="border p-3 capitalize">{a.alert_type}</td>
                <td className="border p-3 text-right">₹{parseFloat(a.target_price).toFixed(2)}</td>
                <td className="border p-3 text-center">
                  {a.triggered ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">✓ Triggered</span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm">⏳ Active</span>
                  )}
                </td>
                <td className="border p-3 text-center">
                  <button
                    onClick={() => handleDelete(a.id)}
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