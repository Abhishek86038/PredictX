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
      // 100% Import-free approach using the global object that opened the popup in the screenshot
      const freighter = window.freighterApi;
      
      if (!freighter) {
        throw new Error('Freighter not detected. Please refresh.');
      }

      console.log('Requesting permission...');
      await freighter.setAllowed();
      
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
      console.error('Final Error:', error);
      alert(`SUCCESS IS NEAR! Just click "Connect anyway" in the popup. Error: ${error.message}`);
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
          {connecting ? 'Popup Open...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
