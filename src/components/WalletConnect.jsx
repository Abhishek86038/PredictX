import { useState } from 'react';
import { Horizon } from 'stellar-sdk';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const server = new Horizon.Server('https://horizon-testnet.stellar.org');

  const fetchBalance = async (pubKey) => {
    try {
      const account = await server.loadAccount(pubKey);
      const xpollBalance = account.balances.find(b => b.asset_code === 'XPOLL');
      const xlmBalance = account.balances.find(b => b.asset_type === 'native');
      return xpollBalance ? xpollBalance.balance : (xlmBalance ? xlmBalance.balance : '0');
    } catch (err) {
      console.error('Balance fetch error:', err);
      return '0';
    }
  };

  const connectWallet = async () => {
    setError(null);
    setConnecting(true);
    
    try {
      // 1. Direct access to window.freighterApi to bypass ALL bundling/mangling issues
      const api = window.freighterApi;
      
      if (!api) {
        throw new Error('Freighter extension not found. Please install and unlock it.');
      }

      // 2. Use string-based access to be 100% safe from minifiers
      const isConnectedFn = api['isConnected'];
      const getPublicKeyFn = api['getPublicKey'];

      if (typeof isConnectedFn !== 'function' || typeof getPublicKeyFn !== 'function') {
        throw new Error('Freighter API is not ready. Please refresh the page.');
      }

      const connected = await isConnectedFn();
      if (!connected) {
        throw new Error('Freighter is locked or not connected to a network.');
      }

      const pubKey = await getPublicKeyFn();
      if (!pubKey) throw new Error('Permission denied. Please unlock your wallet.');

      const balance = await fetchBalance(pubKey);
      
      const shortAddr = pubKey.substring(0, 4) + '...' + pubKey.substring(pubKey.length - 4);
      setAddress(shortAddr);
      onConnect(pubKey, parseFloat(balance));
    } catch (err) {
      setError(err.message);
      console.error('Wallet Connection Error:', err);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    onConnect(null, 0);
  };

  return (
    <div className="wallet-connect-container">
      {address ? (
        <div className="connected-wallet">
          <span className="wallet-address" title={address}>{address}</span>
          <button onClick={disconnectWallet} className="disconnect-btn">Disconnect</button>
        </div>
      ) : (
        <div className="connect-wrapper">
          <button 
            onClick={connectWallet} 
            className="connect-btn"
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect Freighter'}
          </button>
          {error && <div className="wallet-error">{error}</div>}
        </div>
      )}
      <style>{`
        .wallet-connect-container { display: flex; flex-direction: column; align-items: flex-end; }
        .wallet-error { color: #ff4d4d; font-size: 0.7rem; margin-top: 5px; background: rgba(255, 77, 77, 0.1); padding: 5px 12px; border-radius: 4px; border: 1px solid rgba(255, 77, 77, 0.2); text-align: right; max-width: 250px; }
        .connected-wallet { background: #f0f7ff; padding: 5px 15px; border-radius: 50px; display: flex; align-items: center; gap: 10px; border: 1px solid #d0e7ff; }
        .wallet-address { font-family: monospace; font-weight: 700; color: #0066CC; }
        .disconnect-btn { background: none; border: none; color: #666; font-size: 0.8rem; cursor: pointer; text-decoration: underline; padding: 0; }
        .disconnect-btn:hover { color: #ff4d4d; }
      `}</style>
    </div>
  );
}
