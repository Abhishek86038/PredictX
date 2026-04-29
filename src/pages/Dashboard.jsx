import { useState, useEffect, useCallback } from 'react';
import { getUserStats, getReferralEarnings } from '../services/rewardsService';
import StatCard from '../components/StatCard';
import ReferralWidget from '../components/ReferralWidget';
import TokenBalanceWidget from '../components/TokenBalanceWidget';
import SkeletonLoader from '../components/SkeletonLoader';

const timeAgo = (isoStr) => {
  if (!isoStr) return '';
  const now = new Date();
  const diff = (now - new Date(isoStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function Dashboard({ walletAddress, xlmBalance, refreshBalance }) {
  const [stats, setStats] = useState(null);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
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
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      fetchStats();
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [walletAddress, fetchStats]);

  if (loading) return (
    <div className="dashboard-container">
      <header className="page-header">
        <h2>Dashboard</h2>
        <p className="page-subtitle">Your personal prediction performance and rewards</p>
      </header>

      <SkeletonLoader type="stat-grid" />

      <div className="dashboard-content-grid" style={{ marginTop: '1.5rem' }}>
        <div className="left-column">
          <section className="stats-section card">
            <SkeletonLoader type="text" lines={1} />
            <div style={{ marginTop: '1.2rem' }}>
              <SkeletonLoader type="list" rows={4} />
            </div>
          </section>
          <section className="recent-section card" style={{ marginTop: '1.5rem' }}>
            <SkeletonLoader type="text" lines={1} />
            <div style={{ marginTop: '1.2rem' }}>
              <SkeletonLoader type="list" rows={4} />
            </div>
          </section>
        </div>
        <div className="right-column">
          <div className="card" style={{ height: '260px' }}>
            <SkeletonLoader type="text" lines={6} />
          </div>
        </div>
      </div>
    </div>
  );

  const s = stats || { wins: 0, losses: 0, profit: 0, winRate: 0, totalStaked: 0, recentPredictions: [] };
  const roi = s.totalStaked > 0 ? ((s.profit / s.totalStaked) * 100).toFixed(2) : '0.00';

  return (
    <div className="dashboard-container content-fade-in">
      <header className="page-header">
        <h2>Dashboard</h2>
        <p className="page-subtitle">Your personal prediction performance and rewards</p>
      </header>

      <TokenBalanceWidget walletAddress={walletAddress} xlmBalance={xlmBalance} onBalanceRefresh={refreshBalance} />

      <div className="stats-grid">
        <StatCard title="Wallet Balance" value={parseFloat(xlmBalance || 0).toFixed(4)} subtitle="XLM (Stellar Lumens)" icon="⭐" color="#4CAF50" />
        <StatCard title="Net Profit" value={s.profit.toFixed(4)} subtitle="XLM" icon={s.profit >= 0 ? '📈' : '📉'} color={s.profit >= 0 ? '#4CAF50' : '#F44336'} />
        <StatCard title="Win Rate" value={`${s.winRate}%`} icon="🎯" color="#0066CC" />
        <StatCard title="Estimated ROI" value={`${roi}%`} icon="💹" color="#FF9800" />
      </div>

      <div className="dashboard-content-grid">
        <div className="left-column">
          <section className="stats-section card">
            <h3>Prediction History</h3>
            <div className="stats-breakdown">
              <div className="breakdown-item"><span className="label">Total Predictions</span><span className="value">{s.wins + s.losses}</span></div>
              <div className="breakdown-item"><span className="label text-success">Wins</span><span className="value text-success">{s.wins}</span></div>
              <div className="breakdown-item"><span className="label text-danger">Losses</span><span className="value text-danger">{s.losses}</span></div>
              <div className="breakdown-item"><span className="label">Total Staked</span><span className="value">{s.totalStaked.toFixed(4)} XLM</span></div>
            </div>
          </section>
          <section className="recent-section card">
            <h3>Recent Activity</h3>
            {s.recentPredictions && s.recentPredictions.length > 0 ? (
              <ul className="recent-list">
                {s.recentPredictions.map((pred, idx) => (
                  <li key={idx} className="recent-item">
                    <div className="recent-info">
                      <span className="recent-crypto">{pred.crypto.toUpperCase()}</span>
                      <span className="recent-time">{timeAgo(pred.createdAt)}</span>
                    </div>
                    <span className={`recent-result ${pred.won ? 'won' : 'lost'}`}>
                      {pred.won ? '+' : '-'}{Number(pred.amount).toFixed(4)} XLM
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
          <ReferralWidget walletAddress={walletAddress} referralEarnings={referralEarnings} />
        </div>
      </div>
    </div>
  );
}
