import { useState, useEffect, useCallback } from 'react';
import { getLeaderboard } from '../services/leaderboardService';

export default function Leaderboard({ walletAddress }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [timeRange, setTimeRange] = useState('daily'); // daily, weekly, all-time
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(timeRange);
      setLeaderboard(data.rankings);
      
      // Find user's rank
      const userPosition = data.rankings.findIndex(u => u.address === walletAddress);
      if (userPosition >= 0) {
        setUserRank({
          rank: userPosition + 1,
          ...data.rankings[userPosition]
        });
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, walletAddress]);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const formatAddress = (address) => {
    return address.includes('...') ? address : `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="leaderboard-container">
      <header className="page-header">
        <h2>🏆 Hall of Fame</h2>
        <p className="page-subtitle">Top predictors ranked by total profit</p>
      </header>

      {/* User's Position */}
      {userRank && (
        <div className="user-position-card">
          <div className="user-rank-display">
            <span className="rank-number">#{userRank.rank}</span>
            <div className="rank-info">
              <h3>Your Position</h3>
              <p className="profit">+{userRank.profit} XPOLL</p>
              <p className="winrate">Win Rate: {userRank.winRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Time Range Selection */}
      <div className="time-range-buttons">
        {['daily', 'weekly', 'all-time'].map(range => (
          <button
            key={range}
            className={timeRange === range ? 'active' : ''}
            onClick={() => setTimeRange(range)}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Rankings Table */}
      <div className="leaderboard-table-wrapper">
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="col-rank">Rank</div>
            <div className="col-address">Predictor</div>
            <div className="col-profit">Profit</div>
            <div className="col-winrate">Win Rate</div>
            <div className="col-predictions">Predictions</div>
          </div>

          {leaderboard.map((user, idx) => (
            <div
              key={idx}
              className={`table-row ${user.address === walletAddress ? 'highlight' : ''}`}
            >
              <div className="col-rank">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
              </div>
              <div className="col-address">
                {user.address === walletAddress ? <span className="you-badge">YOU</span> : formatAddress(user.address)}
              </div>
              <div className="col-profit">
                <span className={user.profit >= 0 ? 'green' : 'red'}>
                  {user.profit >= 0 ? '+' : ''}{user.profit.toLocaleString()}
                </span>
              </div>
              <div className="col-winrate">{user.winRate}%</div>
              <div className="col-predictions">{user.totalPredictions}</div>
            </div>
          ))}
        </div>
      </div>

      {loading && <p className="loading-text">Syncing with blockchain...</p>}
    </div>
  );
}
