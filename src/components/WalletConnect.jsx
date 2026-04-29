import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { connectWallet, fetchXLMBalance, checkWalletConnection } from '../services/stellarService';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        await checkWalletConnection();
      } catch (err) {
        console.error("Error checking wallet:", err);
      }
    };
    checkExistingConnection();
  }, []);

  const handleWalletSelect = async (walletName) => {
    setIsModalOpen(false);
    setConnecting(true);
    setError('');
    try {
      const publicKey = await connectWallet(walletName);
      setAddress(publicKey);
      const balance = await fetchXLMBalance(publicKey);
      onConnect(publicKey, parseFloat(balance));
    } catch (err) {
      console.error(err);
      setError(err.message || `Failed to connect ${walletName} wallet`);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    onConnect(null, 0);
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = address;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openExplorer = () => {
    window.open(`https://stellar.expert/explorer/testnet/account/${address}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="wallet-connect">
      {error && <span className="wallet-error">{error}</span>}
      {address ? (
        <div className="connected-wallet-bar">
          <div className="wallet-status-dot" title="Connected" />
          <span className="wallet-address-chip" title={address}>{formatAddress(address)}</span>
          <div className="wallet-actions">
            <button
              className="wallet-action-btn"
              onClick={copyAddress}
              title="Copy address"
              aria-label="Copy wallet address"
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              )}
              {copied && <span className="copy-tooltip">Copied!</span>}
            </button>
            <button
              className="wallet-action-btn"
              onClick={openExplorer}
              title="View on Stellar Expert"
              aria-label="View on blockchain explorer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
            <button onClick={disconnectWallet} className="disconnect-btn">Disconnect</button>
          </div>
        </div>
      ) : (
        <>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="connect-btn"
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>

          {isModalOpen && createPortal(
            <div className="wallet-modal-overlay" onClick={() => setIsModalOpen(false)}>
              <div className="wallet-modal" onClick={e => e.stopPropagation()}>
                <div className="wallet-modal-header">
                  <h3>Connect Wallet</h3>
                  <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                </div>
                <p className="wallet-modal-subtitle">Choose your preferred Stellar wallet to continue</p>
                
                <div className="wallet-options">
                  <button className="wallet-option-btn" onClick={() => handleWalletSelect('Freighter')}>
                    <div className="wallet-icon freighter-icon">
                      <span role="img" aria-label="freighter">⚓</span>
                    </div>
                    <div className="wallet-details">
                      <span className="wallet-name">Freighter</span>
                      <span className="wallet-desc">Stellar Official Wallet</span>
                    </div>
                    <span className="wallet-badge">Recommended</span>
                  </button>

                  <button className="wallet-option-btn" onClick={() => handleWalletSelect('Albedo')}>
                    <div className="wallet-icon albedo-icon">
                      <span role="img" aria-label="albedo">☀️</span>
                    </div>
                    <div className="wallet-details">
                      <span className="wallet-name">Albedo</span>
                      <span className="wallet-desc">Browser based signer</span>
                    </div>
                  </button>

                  <button className="wallet-option-btn" onClick={() => handleWalletSelect('Rabet')}>
                    <div className="wallet-icon rabet-icon">
                      <span role="img" aria-label="rabet">🐰</span>
                    </div>
                    <div className="wallet-details">
                      <span className="wallet-name">Rabet</span>
                      <span className="wallet-desc">Web3 Ecosystem Wallet</span>
                    </div>
                  </button>
                </div>
                
                <div className="wallet-modal-footer">
                  <p>New to Stellar? <a href="https://stellar.org/ecosystem/wallets" target="_blank" rel="noopener noreferrer">Learn more about wallets</a></p>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}
