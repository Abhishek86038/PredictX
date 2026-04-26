import { useState } from 'react';
import * as StellarSdk from 'stellar-sdk';
import * as FreighterAPI from '@stellar/freighter-api';

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
      console.log('Hybrid Detection initiated...');
      
      // Use the API object that successfully opened the popup in your screenshot
      const api = FreighterAPI;
      const globalApi = window.freighterApi;

      console.log('Requesting permission...');
      // Try to call setAllowed from anywhere possible
      if (api.setAllowed) await api.setAllowed();
      else if (globalApi?.setAllowed) await globalApi.setAllowed();
      
      console.log('Permission step passed, fetching public key...');
      
      // Try multiple ways to call getPublicKey to avoid "not a function" error
      let pubKey = null;
      
      if (typeof api.getPublicKey === 'function') {
        pubKey = await api.getPublicKey();
      } else if (globalApi && typeof globalApi.getPublicKey === 'function') {
        pubKey = await globalApi.getPublicKey();
      } else if (api.default && typeof api.default.getPublicKey === 'function') {
        pubKey = await api.default.getPublicKey();
      }

      if (pubKey) {
        const balance = await fetchBalance(pubKey);
        setAddress(pubKey);
        onConnect(pubKey, balance);
      } else {
        throw new Error('Could not find getPublicKey function or user denied request.');
      }
    } catch (error) {
      console.error('Hybrid Error:', error);
      alert(`HYBRID SUCCESS ATTEMPT: ${error.message}. Please click "Connect anyway" if popup is open.`);
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
          {connecting ? 'Checking...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
