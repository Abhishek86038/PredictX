// XPOLL Predictor - Production Ready v1.0
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WalletConnect from './components/WalletConnect';
import PredictionArena from './pages/PredictionArena';
import Leaderboard from './pages/Leaderboard';
import Dashboard from './pages/Dashboard';
import MyPredictions from './pages/MyPredictions';
import './styles/predictor.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [activePage, setActivePage] = useState('arena');

  const handleWalletConnect = (address, balance) => {
    setWalletAddress(address);
    setTokenBalance(balance || 0);
  };

  return (
    <Router>
      <div className="app">
        {/* Header */}
        <header className="app-header">
          <div className="logo-container">
            <h1>🎯 XPOLL Predictor</h1>
            <span className="network-badge">Stellar Testnet</span>
          </div>
          <WalletConnect onConnect={handleWalletConnect} />
        </header>

        {walletAddress ? (
          <>
            {/* Navigation */}
            <nav className="app-nav">
              <Link
                to="/"
                className={activePage === 'arena' ? 'active' : ''}
                onClick={() => setActivePage('arena')}
              >
                Prediction Arena
              </Link>
              <Link
                to="/dashboard"
                className={activePage === 'dashboard' ? 'active' : ''}
                onClick={() => setActivePage('dashboard')}
              >
                Dashboard
              </Link>
              <Link
                to="/predictions"
                className={activePage === 'predictions' ? 'active' : ''}
                onClick={() => setActivePage('predictions')}
              >
                My Predictions
              </Link>
              <Link
                to="/leaderboard"
                className={activePage === 'leaderboard' ? 'active' : ''}
                onClick={() => setActivePage('leaderboard')}
              >
                Leaderboard
              </Link>
            </nav>

            {/* Routes */}
            <main className="app-main">
              <Routes>
                <Route
                  path="/"
                  element={
                    <PredictionArena
                      walletAddress={walletAddress}
                      tokenBalance={tokenBalance}
                    />
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Dashboard
                      walletAddress={walletAddress}
                      tokenBalance={tokenBalance}
                    />
                  }
                />
                <Route
                  path="/predictions"
                  element={<MyPredictions walletAddress={walletAddress} />}
                />
                <Route
                  path="/leaderboard"
                  element={<Leaderboard walletAddress={walletAddress} />}
                />
              </Routes>
            </main>
          </>
        ) : (
          <div className="no-wallet-container">
            <div className="hero-section">
              <h2>Master the Market Trends</h2>
              <p>The ultimate gamified price prediction platform on Stellar. Stake XPOLL, predict movements, and earn rewards from real market data.</p>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="stat-val">$24.5M+</span>
                  <span className="stat-lbl">Volume</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-val">50k+</span>
                  <span className="stat-lbl">Predictions</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-val">12k+</span>
                  <span className="stat-lbl">Winners</span>
                </div>
              </div>
              <button className="btn-hero" onClick={() => document.querySelector('.connect-btn').click()}>
                Get Started Now
              </button>
            </div>
            <style>{`
              .no-wallet-container {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4rem 2rem;
                background: radial-gradient(circle at top right, rgba(0, 102, 204, 0.1), transparent),
                            radial-gradient(circle at bottom left, rgba(76, 175, 80, 0.05), transparent);
              }
              .hero-section {
                max-width: 800px;
                text-align: center;
              }
              .hero-section h2 {
                font-size: 3.5rem;
                font-weight: 800;
                margin-bottom: 1.5rem;
                background: linear-gradient(135deg, #0066CC, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              .hero-section p {
                font-size: 1.25rem;
                color: #666;
                margin-bottom: 3rem;
                line-height: 1.6;
              }
              .hero-stats {
                display: flex;
                justify-content: center;
                gap: 4rem;
                margin-bottom: 3rem;
              }
              .hero-stat {
                display: flex;
                flex-direction: column;
              }
              .stat-val {
                font-size: 2rem;
                font-weight: 800;
                color: #1a1a1a;
              }
              .stat-lbl {
                font-size: 0.9rem;
                color: #999;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .btn-hero {
                background: var(--primary);
                color: white;
                border: none;
                padding: 1.2rem 3rem;
                border-radius: 50px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 10px 20px rgba(0, 102, 204, 0.2);
                transition: all 0.3s ease;
              }
              .btn-hero:hover {
                transform: translateY(-3px);
                box-shadow: 0 15px 30px rgba(0, 102, 204, 0.3);
              }
              .network-badge {
                font-size: 0.7rem;
                background: #E8F5E9;
                color: #2E7D32;
                padding: 2px 8px;
                border-radius: 10px;
                font-weight: 700;
                margin-left: 10px;
                vertical-align: middle;
              }
            `}</style>
          </div>
        )}

        {/* Footer */}
        <footer className="app-footer">
          <p>XPOLL Predictor © 2026 | Powered by Stellar Soroban & CoinGecko</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
