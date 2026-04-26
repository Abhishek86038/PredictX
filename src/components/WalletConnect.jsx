import { useState } from 'react';
import * as FreighterModule from '@stellar/freighter-api';
import * as StellarSdk from 'stellar-sdk';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // Fail-safe helper to get Freighter functions
  const getFreighter = () => {
    if (window.freighterApi) return window.freighterApi;
    // Handle cases where it might be inside the module differently
    return FreighterModule.default || FreighterModule;
  };

  const fetchBalance = async (pubKey) => {
    try {
      const Server = StellarSdk.Server || StellarSdk.default?.Server;
      const server = new Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(pubKey);
      const nativeBalance = account.balances.find(b => b.asset_type === 'native');
      return nativeBalance ? nativeBalance.balance : '0';
    } catch (e) {
      console.error('Balance fetch error:', e);
      return '0';
    }
  };

  const connectWallet = async () => {
    if (connecting) return;
    setConnecting(true);
    
    try {
      const freighter = getFreighter();
      console.log('Using Freighter Instance:', freighter);

      if (!freighter || (!freighter.setAllowed && !freighter.getPublicKey)) {
        throw new Error('Freighter API not found. Please refresh or check extension.');
      }

      // Try setAllowed if available, otherwise skip to getPublicKey
      if (freighter.setAllowed) {
        await freighter.setAllowed();
      }
      
      const pubKey = await freighter.getPublicKey();
      if (pubKey) {
        const balance = await fetchBalance(pubKey);
        setAddress(pubKey);
        onConnect(pubKey, balance);
      } else {
        throw new Error('Could not retrieve Public Key');
      }
    } catch (error) {
      console.error('Connection Error:', error);
      alert(`Connection Failed: ${error.message}. Please try again.`);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    onConnect(null, 0);
  };

  return (
    <div className="wallet-connect">
      {address ? (
        <div className="connected-wallet">
          <span className="wallet-address">
            {address.substring(0, 4)}...{address.substring(address.length - 4)}
          </span>
          <button onClick={disconnectWallet} className="disconnect-btn">Disconnect</button>
        </div>
      ) : (
        <button 
          onClick={connectWallet} 
          className="connect-btn"
          disabled={connecting}
        >
          {connecting ? 'Detecting Freighter...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
