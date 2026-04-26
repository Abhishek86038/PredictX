import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WalletConnect from './components/WalletConnect';
import PredictionArena from './pages/PredictionArena';
import Leaderboard from './pages/Leaderboard';
import Dashboard from './pages/Dashboard';
import MyPredictions from './pages/MyPredictions';
import './styles/predictor.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [tokenBalance, setTokenBalance] = useState('0'); // Store as string for precision
  const [activePage, setActivePage] = useState('arena');

  const handleWalletConnect = (address, balance) => {
    console.log('App received wallet data:', { address, balance });
    setWalletAddress(address);
    setTokenBalance(balance || '0');
  };

  return (
    <Router>
      <div className="predictor-app">
        <nav className="main-nav">
          <div className="nav-logo">
            <Link to="/" onClick={() => setActivePage('arena')}>
              <span className="logo-icon">🎯</span>
              <span className="logo-text">XPOLL Predictor</span>
            </Link>
          </div>
          
          <div className="nav-links">
            <Link to="/arena" className={activePage === 'arena' ? 'active' : ''} onClick={() => setActivePage('arena')}>Prediction Arena</Link>
            <Link to="/dashboard" className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>Dashboard</Link>
            <Link to="/predictions" className={activePage === 'predictions' ? 'active' : ''} onClick={() => setActivePage('predictions')}>My Predictions</Link>
            <Link to="/leaderboard" className={activePage === 'leaderboard' ? 'active' : ''} onClick={() => setActivePage('leaderboard')}>Leaderboard</Link>
          </div>

          <div className="nav-actions">
            <div className="network-badge">Stellar Testnet</div>
            <WalletConnect onConnect={handleWalletConnect} />
          </div>
        </nav>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<PredictionArena walletAddress={walletAddress} tokenBalance={tokenBalance} />} />
            <Route path="/arena" element={<PredictionArena walletAddress={walletAddress} tokenBalance={tokenBalance} />} />
            <Route path="/dashboard" element={<Dashboard walletAddress={walletAddress} tokenBalance={tokenBalance} />} />
            <Route path="/predictions" element={<MyPredictions walletAddress={walletAddress} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>

        <footer className="main-footer">
          <p>&copy; 2026 XPOLL Predictor | Powered by Stellar Soroban</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
