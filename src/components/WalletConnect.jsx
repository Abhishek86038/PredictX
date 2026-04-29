import { useState, useEffect } from 'react';
import { connectWallet, fetchXLMBalance, checkWalletConnection } from '../services/stellarService';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

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

  const handleConnect = async () => {
    setConnecting(true);
    setError('');
    try {
      const publicKey = await connectWallet();
      setAddress(publicKey);
      
      const balance = await fetchXLMBalance(publicKey);
      onConnect(publicKey, parseFloat(balance));
    } catch (err) {
      console.error(err);
      setError('Failed to connect wallet');
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
        <button 
          onClick={handleConnect} 
          className="connect-btn"
          disabled={connecting}
        >
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
