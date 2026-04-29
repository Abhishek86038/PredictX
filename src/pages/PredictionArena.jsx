import { useState, useEffect, useCallback } from 'react';
import { createPrediction } from '../services/predictionService';
import { getPriceData } from '../services/priceService';
import ToastNotification from '../components/ToastNotification';
import PriceChart from '../components/PriceChart';
import TokenBalanceWidget from '../components/TokenBalanceWidget';

const MIN_STAKE = 1;       // Minimum stake in XLM
const XLM_RESERVE = 1;     // Reserve XLM for transaction fees

export default function PredictionArena({ walletAddress, xlmBalance, refreshBalance }) {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [selectedTimeframe, setSelectedTimeframe] = useState(60);
  const [stakeAmount, setStakeAmount] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [priceChange24h, setPriceChange24h] = useState(0);

  const usableBalance = Math.max(0, xlmBalance - XLM_RESERVE);

  const timeframes = [
    { label: '1 hour', value: 60 },
    { label: '4 hours', value: 240 },
    { label: '12 hours', value: 720 },
    { label: '24 hours', value: 1440 },
  ];

  const fetchPrice = useCallback(async () => {
    try {
      const data = await getPriceData(selectedCrypto);
      setCurrentPrice(data.usd);
      setPriceChange24h(data.usd_24h_change || 0);
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  }, [selectedCrypto]);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Updated to 60 seconds to avoid API rate limits
    return () => clearInterval(interval);
  }, [fetchPrice]);

  const handleCreatePrediction = async (direction) => {
    const amount = parseFloat(stakeAmount);

    if (!stakeAmount || amount <= 0) {
      setNotification({ type: 'error', message: 'Enter a valid stake amount' });
      return;
    }

    if (amount < MIN_STAKE) {
      setNotification({ type: 'error', message: `Minimum stake is ${MIN_STAKE} XLM` });
      return;
    }

    if (amount > usableBalance) {
      setNotification({
        type: 'error',
        message: `Insufficient balance. You have ${usableBalance.toFixed(4)} XLM available (${XLM_RESERVE} XLM reserved for fees)`
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createPrediction(
        walletAddress,
        selectedCrypto,
        selectedTimeframe,
        currentPrice,
        direction,
        amount
      );

      setPrediction({
        id: result.predictionId,
        crypto: selectedCrypto,
        timeframe: selectedTimeframe,
        startPrice: currentPrice,
        direction: direction,
        stake: amount,
        createdAt: new Date(),
      });

      setNotification({
        type: 'success',
        message: `Prediction created! Staked ${amount} XLM on ${direction.toUpperCase()}`
      });

      setStakeAmount('');
      
      // Refresh the user's actual XLM balance after the stake transaction succeeds
      if (refreshBalance) {
        await refreshBalance();
      }

    } catch (error) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill percentage buttons
  const handleQuickFill = (percentage) => {
    const amount = (usableBalance * percentage / 100).toFixed(4);
    setStakeAmount(amount);
  };

  return (
    <div className="prediction-arena-container">
      <header className="page-header">
        <h2>Prediction Arena</h2>
        <p className="page-subtitle">Predict the market trend — stake XLM, earn rewards</p>
      </header>

      {/* Token Balance Widget */}
      <TokenBalanceWidget
        walletAddress={walletAddress}
        xlmBalance={xlmBalance}
        onBalanceRefresh={refreshBalance}
      />

      {/* Price Display */}
      <div className="price-display">
        <div className="price-card">
          <h3>{selectedCrypto.toUpperCase()}</h3>
          <div className="price-main">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={`price-change ${priceChange24h >= 0 ? 'up' : 'down'}`}>
            {priceChange24h >= 0 ? '↑' : '↓'} {Math.abs(priceChange24h).toFixed(2)}% (24h)
          </div>
        </div>

        {/* Chart */}
        <PriceChart cryptoId={selectedCrypto} />
      </div>

      {/* Prediction Setup */}
      <div className="prediction-setup">
        <div className="setup-card">
          <label>Select Asset</label>
          <select value={selectedCrypto} onChange={(e) => setSelectedCrypto(e.target.value)}>
            <option value="bitcoin">Bitcoin (BTC)</option>
            <option value="ethereum">Ethereum (ETH)</option>
            <option value="solana">Solana (SOL)</option>
            <option value="cardano">Cardano (ADA)</option>
          </select>

          <label>Select Timeframe</label>
          <div className="timeframe-buttons">
            {timeframes.map(tf => (
              <button
                key={tf.value}
                className={selectedTimeframe === tf.value ? 'active' : ''}
                onClick={() => setSelectedTimeframe(tf.value)}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <label>Stake Amount (XLM)</label>
          <div className="stake-input-container">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder={`Min ${MIN_STAKE} XLM`}
              min={MIN_STAKE}
              max={usableBalance}
              step="0.01"
            />
            <span className="balance-text">
              Available: <strong>{usableBalance.toFixed(4)} XLM</strong>
            </span>
          </div>

          {/* Quick-fill buttons */}
          <div className="quick-fill-buttons">
            {[10, 25, 50, 100].map(pct => (
              <button
                key={pct}
                className="quick-fill-btn"
                onClick={() => handleQuickFill(pct)}
                disabled={usableBalance <= 0}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Stake summary */}
          {stakeAmount && parseFloat(stakeAmount) > 0 && (
            <div className="stake-summary">
              <div className="stake-summary-row">
                <span>Staking</span>
                <span><strong>{parseFloat(stakeAmount).toFixed(4)} XLM</strong></span>
              </div>
              <div className="stake-summary-row">
                <span>Potential Win (1.8×)</span>
                <span className="text-success"><strong>{(parseFloat(stakeAmount) * 1.8).toFixed(4)} XLM</strong></span>
              </div>
              <div className="stake-summary-row muted">
                <span>Remaining after stake</span>
                <span>{(usableBalance - parseFloat(stakeAmount)).toFixed(4)} XLM</span>
              </div>
            </div>
          )}

          <div className="prediction-buttons">
            <button
              className="predict-up"
              onClick={() => handleCreatePrediction('up')}
              disabled={loading}
            >
              {loading ? 'Processing...' : '📈 Predict UP'}
            </button>
            <button
              className="predict-down"
              onClick={() => handleCreatePrediction('down')}
              disabled={loading}
            >
              {loading ? 'Processing...' : '📉 Predict DOWN'}
            </button>
          </div>
        </div>

        {/* Current Prediction Status */}
        <div className="prediction-info-panel">
          {prediction ? (
            <div className="prediction-status active">
              <h4>🎯 Active Prediction</h4>
              <div className="status-grid">
                <div className="status-item">
                  <span className="label">Asset</span>
                  <span className="value">{prediction.crypto.toUpperCase()}</span>
                </div>
                <div className="status-item">
                  <span className="label">Direction</span>
                  <span className={`value ${prediction.direction}`}>{prediction.direction.toUpperCase()}</span>
                </div>
                <div className="status-item">
                  <span className="label">Entry Price</span>
                  <span className="value">${prediction.startPrice.toFixed(2)}</span>
                </div>
                <div className="status-item">
                  <span className="label">Staked</span>
                  <span className="value">{prediction.stake} XLM</span>
                </div>
                <div className="status-item">
                  <span className="label">Ends In</span>
                  <span className="value">{prediction.timeframe}m</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="prediction-status empty">
              <h4>No active prediction</h4>
              <p>Choose an asset and timeframe to start earning.</p>
              <div className="mini-stats">
                <span>🏆 Total Rewards: 124.5k XLM</span>
                <span>🔥 Active Players: 842</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
