import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './dashboard';  // File is lowercase, but import name is capital

export default function App() {
  const [page, setPage] = useState('login');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setPage('dashboard');
    } else {
      setPage('login');
    }
  }, []);

  return (
    <div>
      {page === 'login' && <Login />}
      {page === 'dashboard' && <Dashboard />}  {/* Component name must be capital */}
    </div>
  );
}