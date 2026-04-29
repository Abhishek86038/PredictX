import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { connectWallet, fetchXLMBalance, checkWalletConnection } from '../services/stellarService';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Optionally check if already connected
    const checkExistingConnection = async () => {
      try {
        const connected = await checkWalletConnection();
        if (connected) {
          // You could automatically connect here if desired, 
          // but often it's better to let the user initiate.
        }
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
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <div className="wallet-connect">
      {error && <span className="wallet-error">{error}</span>}
      {address ? (
        <div className="connected-wallet">
          <span className="wallet-address" title={address}>{formatAddress(address)}</span>
          <button onClick={disconnectWallet} className="disconnect-btn">Disconnect</button>
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
