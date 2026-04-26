import { useState, useEffect } from 'react';
import { getUserStats, getReferralEarnings } from '../services/rewardsService';
import StatCard from '../components/StatCard';
import ReferralWidget from '../components/ReferralWidget';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard({ walletAddress, tokenBalance }) {
  const [stats, setStats] = useState(null);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (walletAddress) {
      fetchStats();
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  const fetchStats = async () => {
    try {
      const userStats = await getUserStats(walletAddress);
      setStats(userStats);

      const refEarnings = await getReferralEarnings(walletAddress);
      setReferralEarnings(refEarnings);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const roi = stats.totalStaked > 0 
    ? ((stats.profit / stats.totalStaked) * 100).toFixed(2)
    : 0;

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h2>Dashboard</h2>
        <p className="page-subtitle">Your personal prediction performance and rewards</p>
      </header>

      {/* Main Stats */}
      <div className="stats-grid">
        <StatCard
          title="XPOLL Balance"
          value={`${tokenBalance.toLocaleString()}`}
          icon="💰"
          color="#4CAF50"
        />
        <StatCard
          title="Net Profit"
          value={`${stats.profit.toLocaleString()}`}
          subtitle="XPOLL"
          icon={stats.profit >= 0 ? '📈' : '📉'}
          color={stats.profit >= 0 ? '#4CAF50' : '#F44336'}
        />
        <StatCard
          title="Win Rate"
          value={`${stats.winRate}%`}
          icon="🎯"
          color="#0066CC"
        />
        <StatCard
          title="Estimated ROI"
          value={`${roi}%`}
          icon="💹"
          color="#FF9800"
        />
      </div>

      <div className="dashboard-content-grid">
        <div className="left-column">
          {/* Prediction Stats */}
          <section className="stats-section card">
            <h3>Prediction History</h3>
            <div className="stats-breakdown">
              <div className="breakdown-item">
                <span className="label">Total Predictions</span>
                <span className="value">{stats.wins + stats.losses}</span>
              </div>
              <div className="breakdown-item">
                <span className="label text-success">Wins</span>
                <span className="value text-success">{stats.wins}</span>
              </div>
              <div className="breakdown-item">
                <span className="label text-danger">Losses</span>
                <span className="value text-danger">{stats.losses}</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Total Staked</span>
                <span className="value">{stats.totalStaked} XPOLL</span>
              </div>
            </div>
          </section>

          {/* Recent Predictions */}
          <section className="recent-section card">
            <h3>Recent Activity</h3>
            {stats.recentPredictions && stats.recentPredictions.length > 0 ? (
              <ul className="recent-list">
                {stats.recentPredictions.map((pred, idx) => (
                  <li key={idx} className="recent-item">
                    <div className="recent-info">
                      <span className="recent-crypto">{pred.crypto.toUpperCase()}</span>
                      <span className="recent-time">2 hours ago</span>
                    </div>
                    <span className={`recent-result ${pred.won ? 'won' : 'lost'}`}>
                      {pred.won ? `+${pred.amount}` : `-${pred.amount}`} XPOLL
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No recent predictions found</p>
            )}
          </section>
        </div>

        <div className="right-column">
          {/* Referral Widget */}
          <ReferralWidget
            walletAddress={walletAddress}
            referralEarnings={referralEarnings}
          />
        </div>
      </div>
    </div>
  );
}
