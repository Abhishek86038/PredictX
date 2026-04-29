import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WalletConnect from './components/WalletConnect';
import PredictionArena from './pages/PredictionArena';
import Leaderboard from './pages/Leaderboard';
import Dashboard from './pages/Dashboard';
import MyPredictions from './pages/MyPredictions';
import { fetchXLMBalance } from './services/stellarService';
import './styles/predictor.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [xlmBalance, setXlmBalance] = useState(0);
  const [activePage, setActivePage] = useState('arena');

  const handleWalletConnect = (address, balance) => {
    setWalletAddress(address);
    setXlmBalance(balance !== undefined && balance !== null ? balance : 0);
  };

  const refreshBalance = useCallback(async () => {
    if (walletAddress) {
      const balance = await fetchXLMBalance(walletAddress);
      setXlmBalance(parseFloat(balance));
    }
  }, [walletAddress]);

  return (
    <Router>
      <div className="app">
        {/* Header */}
        <header className="app-header">
          <div className="logo-container">
            <h1>🎯 PredictX</h1>
            <span className="network-badge">Stellar Testnet</span>
            <span className="token-badge" title="1 XLM = 1 XPOLL (pegged 1:1)">XLM ⇄ XPOLL</span>
          </div>
          <div className="header-right">
            {walletAddress && (
              <div className="header-balance" title="Live XLM balance from your Stellar wallet">
                <span className="balance-icon">⭐</span>
                <span className="balance-amount">{parseFloat(xlmBalance).toFixed(2)} XLM</span>
              </div>
            )}
            <WalletConnect onConnect={handleWalletConnect} />
          </div>
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
                      xlmBalance={xlmBalance}
                      refreshBalance={refreshBalance}
                    />
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Dashboard
                      walletAddress={walletAddress}
                      xlmBalance={xlmBalance}
                      refreshBalance={refreshBalance}
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
              <p>The ultimate gamified price prediction platform on Stellar. Stake XLM, predict movements, and earn rewards from real market data.</p>
              <div className="hero-token-info">
                <div className="token-explainer">
                  <span className="te-icon">⭐</span>
                  <span className="te-text">Uses your <strong>XLM wallet balance</strong> directly — no separate token swap needed</span>
                </div>
                <div className="token-explainer">
                  <span className="te-icon">⇄</span>
                  <span className="te-text"><strong>1 XLM = 1 XPOLL</strong> — platform points pegged 1:1 to XLM</span>
                </div>
              </div>
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
          </div>
        )}

        {/* Footer */}
        <footer className="app-footer">
          <p>PredictX © 2026 | Powered by Stellar Soroban & CoinGecko | 1 XPOLL = 1 XLM</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
