export default function LoadingSpinner({ size = 'md', label = '' }) {
  const sizeMap = { sm: 20, md: 40, lg: 64 };
  const px = sizeMap[size] || 40;

  return (
    <div className="spinner-wrap" style={{ '--sz': `${px}px` }}>
      <svg className="spinner-ring" viewBox="0 0 50 50" width={px} height={px}>
        <circle className="spinner-track" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
        <circle className="spinner-arc"   cx="25" cy="25" r="20" fill="none" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}
