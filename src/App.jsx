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
                margin-bottom: 2rem;
                line-height: 1.6;
              }
              .hero-token-info {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-bottom: 2.5rem;
                align-items: center;
              }
              .token-explainer {
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                background: rgba(0, 102, 204, 0.06);
                border: 1px solid rgba(0, 102, 204, 0.15);
                padding: 0.6rem 1.2rem;
                border-radius: 50px;
                font-size: 0.95rem;
                color: #444;
              }
              .te-icon {
                font-size: 1.2rem;
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
            `}</style>
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
