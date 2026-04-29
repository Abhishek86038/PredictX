import { useState, useEffect, useCallback } from 'react';
import { fetchXLMBalance } from '../services/stellarService';

const CONVERSION_RATE = 1; // 1 XLM = 1 XPOLL (pegged 1:1)
const MIN_RESERVE = 1; // Minimum XLM reserve that cannot be staked

export default function TokenBalanceWidget({ walletAddress, xlmBalance, onBalanceRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const usableBalance = Math.max(0, xlmBalance - MIN_RESERVE);
  const xpollEquivalent = usableBalance * CONVERSION_RATE;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onBalanceRefresh) await onBalanceRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  return (
    <div className="token-balance-widget">
      {/* Main Balance Display */}
      <div className="tbw-header">
        <div className="tbw-title-row">
          <span className="tbw-title">Wallet Balance</span>
          <button
            className={`tbw-refresh-btn ${refreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            title="Refresh balance from blockchain"
            disabled={refreshing}
          >
            ↻
          </button>
        </div>
        <button
          className="tbw-info-toggle"
          onClick={() => setShowInfo(!showInfo)}
          title="How tokens work"
        >
          ℹ
        </button>
      </div>

      {/* XLM Balance */}
      <div className="tbw-balance-row xlm-row">
        <div className="tbw-asset">
          <span className="tbw-asset-icon">⭐</span>
          <div className="tbw-asset-info">
            <span className="tbw-asset-name">XLM</span>
            <span className="tbw-asset-label">Stellar Lumens</span>
          </div>
        </div>
        <div className="tbw-amount">
          <span className="tbw-amount-value">{parseFloat(xlmBalance).toFixed(4)}</span>
          <span className="tbw-amount-sub">Wallet Total</span>
        </div>
      </div>

      {/* Usable / Stakeable Balance */}
      <div className="tbw-balance-row usable-row">
        <div className="tbw-asset">
          <span className="tbw-asset-icon">🎯</span>
          <div className="tbw-asset-info">
            <span className="tbw-asset-name">Usable for Predictions</span>
            <span className="tbw-asset-label">{MIN_RESERVE} XLM reserved for fees</span>
          </div>
        </div>
        <div className="tbw-amount">
          <span className="tbw-amount-value highlight-green">{usableBalance.toFixed(4)}</span>
          <span className="tbw-amount-sub">XLM</span>
        </div>
      </div>

      {/* Conversion Display */}
      <div className="tbw-conversion-bar">
        <div className="tbw-conversion-icon">⇄</div>
        <div className="tbw-conversion-text">
          <span className="tbw-rate">1 XLM = 1 XPOLL</span>
          <span className="tbw-equivalent">
            Your usable balance = <strong>{xpollEquivalent.toFixed(4)} XPOLL</strong>
          </span>
        </div>
      </div>

      {/* Info Panel (toggleable) */}
      {showInfo && (
        <div className="tbw-info-panel">
          <h4>How Tokens Work on PredictX</h4>
          <ul>
            <li><strong>XLM (Stellar Lumens)</strong> is the native currency in your wallet.</li>
            <li><strong>XPOLL</strong> is the platform token, pegged <strong>1:1 to XLM</strong>.</li>
            <li>When you stake on a prediction, <strong>XLM is sent directly</strong> from your wallet.</li>
            <li>The platform displays your balance as XPOLL for consistency, but it always equals your XLM.</li>
            <li><strong>{MIN_RESERVE} XLM</strong> is kept in reserve for Stellar network transaction fees.</li>
            <li>Rewards are calculated in XPOLL and paid out in XLM.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
