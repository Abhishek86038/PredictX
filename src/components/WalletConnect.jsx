import { useState } from 'react';
import * as StellarSdk from 'stellar-sdk';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);

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
      // Aggressive detection loop
      let freighter = null;
      for (let i = 0; i < 10; i++) {
        freighter = window.freighterApi || window.stellar?.freighter || window.starlight;
        if (freighter) break;
        await new Promise(r => setTimeout(r, 200)); // Wait 200ms between retries
      }
      
      if (!freighter) {
        throw new Error('Freighter Wallet not detected in window object. If using Brave, check Wallet settings.');
      }

      console.log('Requesting permission...');
      if (freighter.setAllowed) {
        await freighter.setAllowed();
      }
      
      console.log('Getting public key...');
      const pubKey = await freighter.getPublicKey();
      
      if (pubKey) {
        const balance = await fetchBalance(pubKey);
        setAddress(pubKey);
        onConnect(pubKey, balance);
      } else {
        throw new Error('User denied or locked');
      }
    } catch (error) {
      console.error('Aggressive Connection Error:', error);
      alert(`FINAL PUSH: ${error.message}`);
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
          {connecting ? 'Scanning...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
