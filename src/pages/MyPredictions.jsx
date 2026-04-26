import { useState, useEffect } from 'react';
import { getUserPredictions } from '../services/predictionService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyPredictions({ walletAddress }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // active, settled

  useEffect(() => {
    if (walletAddress) {
      fetchPredictions();
    }
  }, [walletAddress, filter]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const data = await getUserPredictions(walletAddress, filter);
      setPredictions(data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-predictions-container">
      <header className="page-header">
        <h2>My Predictions</h2>
        <p className="page-subtitle">Track your active and historical market calls</p>
      </header>

      <div className="filter-tabs">
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={filter === 'settled' ? 'active' : ''}
          onClick={() => setFilter('settled')}
        >
          Settled
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : predictions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No {filter} predictions found</p>
          {filter === 'active' && <button className="btn-primary">Start Predicting</button>}
        </div>
      ) : (
        <div className="predictions-list">
          {predictions.map((pred) => (
            <div key={pred.id} className="prediction-card-wide">
              <div className="card-left">
                <div className="asset-info">
                  <span className="asset-name">{pred.crypto.toUpperCase()}</span>
                  <span className={`direction-badge ${pred.direction}`}>
                    {pred.direction === 'up' ? '📈 BULLISH' : '📉 BEARISH'}
                  </span>
                </div>
                <div className="time-info">
                  Created: {new Date(pred.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="card-middle">
                <div className="detail-row">
                  <span className="label">Entry Price</span>
                  <span className="value">${pred.startPrice.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Stake</span>
                  <span className="value">{pred.stake} XPOLL</span>
                </div>
                <div className="detail-row">
                  <span className="label">Timeframe</span>
                  <span className="value">{pred.timeframe} minutes</span>
                </div>
              </div>

              <div className="card-right">
                {filter === 'settled' ? (
                  <div className={`result-box ${pred.won ? 'won' : 'lost'}`}>
                    <div className="result-label">{pred.won ? 'WINNER' : 'LOST'}</div>
                    <div className="result-amount">
                      {pred.won ? `+${pred.reward}` : `-${pred.stake}`} XPOLL
                    </div>
                  </div>
                ) : (
                  <div className="live-box">
                    <div className="live-label">LIVE</div>
                    <div className="live-timer">Processing...</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
