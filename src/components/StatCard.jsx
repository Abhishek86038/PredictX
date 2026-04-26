export default function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-icon" style={{ fontSize: '2rem' }}>{icon}</div>
      <div className="stat-content">
        <p className="stat-title" style={{ margin: 0, fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>{title}</p>
        <p className="stat-value" style={{ margin: '4px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</p>
        {subtitle && <p className="stat-subtitle" style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>{subtitle}</p>}
      </div>
    </div>
  );
}
