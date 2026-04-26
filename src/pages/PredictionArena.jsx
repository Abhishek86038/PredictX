import { useState, useEffect } from 'react';
import { createPrediction, placePrediction } from '../services/predictionService';
import { getPriceData } from '../services/priceService';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastNotification from '../components/ToastNotification';
import PriceChart from '../components/PriceChart';

export default function PredictionArena({ walletAddress, tokenBalance }) {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [selectedTimeframe, setSelectedTimeframe] = useState(60);
  const [stakeAmount, setStakeAmount] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [priceChange24h, setPriceChange24h] = useState(0);

  const timeframes = [
    { label: '1 hour', value: 60 },
    { label: '4 hours', value: 240 },
    { label: '12 hours', value: 720 },
    { label: '24 hours', value: 1440 },
  ];

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [selectedCrypto]);

  const fetchPrice = async () => {
    try {
      const data = await getPriceData(selectedCrypto);
      setCurrentPrice(data.usd);
      setPriceChange24h(data.usd_24h_change || 0);
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const handleCreatePrediction = async (direction) => {
    if (!stakeAmount || stakeAmount <= 0) {
      setNotification({ type: 'error', message: 'Enter valid stake amount' });
      return;
    }

    if (stakeAmount > tokenBalance) {
      setNotification({ type: 'error', message: 'Insufficient XPOLL balance' });
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
        parseFloat(stakeAmount)
      );

      setPrediction({
        id: result.predictionId,
        crypto: selectedCrypto,
        timeframe: selectedTimeframe,
        startPrice: currentPrice,
        direction: direction,
        stake: parseFloat(stakeAmount),
        createdAt: new Date(),
      });

      setNotification({
        type: 'success',
        message: `Prediction created! Staked ${stakeAmount} XPOLL on ${direction.toUpperCase()}`
      });

      setStakeAmount('');
    } catch (error) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-arena-container">
      <header className="page-header">
        <h2>Prediction Arena</h2>
        <p className="page-subtitle">Predict the market trend and earn XPOLL rewards</p>
      </header>

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

          <label>Stake Amount (XPOLL)</label>
          <div className="stake-input-container">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Min stake 10 XPOLL"
              min="1"
            />
            <span className="balance-text">Balance: {tokenBalance} XPOLL</span>
          </div>

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
                <span>🏆 Total Rewards: 124.5k XPOLL</span>
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
