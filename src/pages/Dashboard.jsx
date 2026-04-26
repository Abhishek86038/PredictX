import { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getUserStats } from '../services/rewardsService';

export default function Dashboard({ walletAddress, tokenBalance }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserStats(walletAddress);
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      fetchStats();
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [walletAddress, fetchStats]);

  if (loading && !stats) return <LoadingSpinner size="lg" />;

  const roi = stats?.totalStaked > 0 
    ? ((stats.profit / stats.totalStaked) * 100).toFixed(2)
    : 0;

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h2>Dashboard</h2>
        <p className="page-subtitle">Your real-time prediction performance (Powered by Stellar)</p>
      </header>

      {!walletAddress ? (
        <div className="connect-prompt">
          <p>Please connect your wallet to view your personalized dashboard.</p>
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="stats-grid">
            <StatCard
              title="Wallet Balance"
              value={`${parseFloat(tokenBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              subtitle="XLM (Stellar Native)"
              icon="💰"
              color="#4CAF50"
            />
            <StatCard
              title="Net Profit"
              value={`${stats?.profit.toLocaleString()}`}
              subtitle="XLM"
              icon={stats?.profit >= 0 ? '📈' : '📉'}
              color={stats?.profit >= 0 ? '#4CAF50' : '#F44336'}
            />
            <StatCard
              title="Win Rate"
              value={`${stats?.winRate}%`}
              subtitle={`${stats?.wins}W - ${stats?.losses}L`}
              icon="🎯"
              color="#2196F3"
            />
            <StatCard
              title="Return on Investment"
              value={`${roi}%`}
              subtitle="Overall ROI"
              icon="📊"
              color="#9C27B0"
            />
          </div>

          {/* Activity Section */}
          <div className="dashboard-content">
            <div className="recent-activity">
              <h3>Recent Predictions</h3>
              {stats?.recentPredictions.length > 0 ? (
                <div className="activity-list">
                  {stats.recentPredictions.map((p, i) => (
                    <div key={i} className="activity-item">
                      <div className="activity-info">
                        <span className="crypto-tag">{p.crypto.toUpperCase()}</span>
                        <span className="activity-date">Amount: {p.amount} XLM</span>
                      </div>
                      <div className={`activity-result ${p.won === null ? 'pending' : (p.won ? 'won' : 'lost')}`}>
                        {p.won === null ? 'LIVE' : (p.won ? '+$' + (p.amount * 0.9).toFixed(2) : '-$' + p.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No recent activity found.</div>
              )}
            </div>

            <div className="rewards-section">
              <h3>Available Rewards</h3>
              <div className="rewards-card">
                <div className="reward-info">
                  <span className="reward-label">Staking Bonus</span>
                  <span className="reward-value">0.00 XLM</span>
                </div>
                <button className="claim-btn" disabled>Claim Rewards</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
        {icon}
      </div>
      <div className="stat-details">
        <span className="stat-title">{title}</span>
        <h3 className="stat-value">{value}</h3>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}
