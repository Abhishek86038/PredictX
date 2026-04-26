import { useState, useEffect, useCallback } from 'react';
import PriceChart from '../components/PriceChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPriceData } from '../services/priceService';
import { createPrediction } from '../services/predictionService';

export default function PredictionArena({ walletAddress, tokenBalance }) {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [selectedTimeframe, setSelectedTimeframe] = useState(60);
  const [stakeAmount, setStakeAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [prediction, setPrediction] = useState(null);

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
    const interval = setInterval(fetchPrice, 60000); 
    return () => clearInterval(interval);
  }, [fetchPrice]);

  const handleCreatePrediction = async (direction) => {
    if (!walletAddress) {
      setNotification({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    if (!stakeAmount || stakeAmount <= 0) {
      setNotification({ type: 'error', message: 'Enter valid stake amount' });
      return;
    }

    // Convert balance to number for comparison
    const currentBalance = parseFloat(tokenBalance);
    if (parseFloat(stakeAmount) > currentBalance) {
      setNotification({ type: 'error', message: `Insufficient balance. You have ${currentBalance} XLM.` });
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
        message: `Prediction created! Staked ${stakeAmount} XLM on ${direction.toUpperCase()}`
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
        <p className="page-subtitle">Predict market trends and earn rewards using your XLM</p>
      </header>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      <div className="arena-grid">
        <div className="chart-section">
          <div className="price-display">
            <div className="price-card">
              <h3>{selectedCrypto.toUpperCase()} / USD</h3>
              <div className="price-main">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className={`price-change ${priceChange24h >= 0 ? 'up' : 'down'}`}>
                {priceChange24h >= 0 ? '↑' : '↓'} {Math.abs(priceChange24h).toFixed(2)}% (24h)
              </div>
            </div>
          </div>
          <PriceChart cryptoId={selectedCrypto} />
        </div>

        <div className="action-section">
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
              placeholder="Min stake 1 XLM"
              min="1"
            />
            <span className="balance-text">Available: {parseFloat(tokenBalance).toFixed(2)} XLM</span>
          </div>

          <div className="prediction-buttons">
            <button 
              className="predict-up" 
              onClick={() => handleCreatePrediction('up')}
              disabled={loading}
            >
              {loading ? '...' : '📈 Predict UP'}
            </button>
            <button 
              className="predict-down" 
              onClick={() => handleCreatePrediction('down')}
              disabled={loading}
            >
              {loading ? '...' : '📉 Predict DOWN'}
            </button>
          </div>

          {prediction && (
            <div className="active-prediction-card">
              <h4>Current Trade</h4>
              <p>{prediction.crypto.toUpperCase()} {prediction.direction.toUpperCase()}</p>
              <p>Entry: ${prediction.startPrice.toLocaleString()}</p>
              <div className="status-badge">LIVE</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
