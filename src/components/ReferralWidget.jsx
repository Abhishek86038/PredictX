import { useState } from 'react';
import ToastNotification from './ToastNotification';

export default function ReferralWidget({ walletAddress, referralEarnings }) {
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState(null);

  const referralLink = walletAddress ? `${window.location.origin}?ref=${walletAddress}` : window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setNotification({ type: 'success', message: 'Referral link copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="referral-widget">
      <h3>📢 Invite Friends & Earn</h3>

      <div className="referral-info">
        <p className="referral-desc">Earn 10% of your friends' predictions forever!</p>
        <p className="referral-earnings">Referral Earnings: <strong>{referralEarnings} XPOLL</strong></p>
      </div>

      <div className="referral-link-container">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="referral-link-input"
        />
        <button
          onClick={handleCopyLink}
          className={`copy-button ${copied ? 'copied' : ''}`}
        >
          {copied ? '✓ Copied' : 'Copy Link'}
        </button>
      </div>

      <div className="referral-tips">
        <p>💡 Tips to increase referrals:</p>
        <ul>
          <li>Share on Twitter/Discord</li>
          <li>Tag crypto friends</li>
          <li>Show your winnings</li>
          <li>Host prediction tournaments</li>
        </ul>
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
