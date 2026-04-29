/**
 * Reusable skeleton / shimmer placeholders.
 * Usage:
 *   <SkeletonLoader type="stat-grid" />
 *   <SkeletonLoader type="price-card" />
 *   <SkeletonLoader type="list" rows={4} />
 *   <SkeletonLoader type="text" lines={2} />
 */

function Bone({ className = '', style = {} }) {
  return <div className={`skeleton-bone ${className}`} style={style} />;
}

export default function SkeletonLoader({ type = 'text', rows = 3, lines = 2 }) {
  if (type === 'stat-grid') {
    return (
      <div className="stats-grid">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="stat-card skeleton-card">
            <Bone className="skel-icon" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Bone style={{ width: '60%', height: '12px' }} />
              <Bone style={{ width: '80%', height: '22px' }} />
              <Bone style={{ width: '40%', height: '10px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'price-card') {
    return (
      <div className="price-card" style={{ gap: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Bone style={{ width: '80px', height: '14px' }} />
        <Bone style={{ width: '160px', height: '48px', borderRadius: '8px' }} />
        <Bone style={{ width: '100px', height: '28px', borderRadius: '999px' }} />
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skel-list-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              <Bone style={{ width: '40%', height: '13px' }} />
              <Bone style={{ width: '25%', height: '10px' }} />
            </div>
            <Bone style={{ width: '70px', height: '22px', borderRadius: '999px' }} />
          </div>
        ))}
      </div>
    );
  }

  // default: text lines
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Bone key={i} style={{ width: i === lines - 1 ? '60%' : '100%', height: '14px' }} />
      ))}
    </div>
  );
}
