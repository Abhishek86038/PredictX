import { useState } from 'react';
import { Horizon } from 'stellar-sdk';
import * as Freighter from '@stellar/freighter-api';

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
      console.error('Error fetching balance:', err);
      return '0';
    }
  };

  const connectWallet = async () => {
    setError(null);
    setConnecting(true);
    
    try {
      // Small delay to ensure extension is injected
      await new Promise(r => setTimeout(r, 500));

      if (!await Freighter.isConnected()) {
        throw new Error('Freighter not found or locked. Please check the extension.');
      }

      const pubKey = await Freighter.getPublicKey();
      if (!pubKey) throw new Error('Permission denied. Please unlock Freighter.');

      const balance = await fetchBalance(pubKey);
      
      const shortAddr = pubKey.substring(0, 4) + '...' + pubKey.substring(pubKey.length - 4);
      setAddress(shortAddr);
      onConnect(pubKey, parseFloat(balance));
    } catch (err) {
      setError(err.message);
      console.error('Connection error:', err);
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
        .wallet-error { color: #ff4d4d; font-size: 0.7rem; margin-top: 5px; background: rgba(255, 77, 77, 0.1); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(255, 77, 77, 0.2); }
        .connected-wallet { background: #f0f7ff; padding: 5px 15px; border-radius: 50px; display: flex; align-items: center; gap: 10px; border: 1px solid #d0e7ff; }
        .wallet-address { font-family: monospace; font-weight: 700; color: #0066CC; }
        .disconnect-btn { background: none; border: none; color: #666; font-size: 0.8rem; cursor: pointer; text-decoration: underline; padding: 0; }
        .disconnect-btn:hover { color: #ff4d4d; }
      `}</style>
    </div>
  );
}
