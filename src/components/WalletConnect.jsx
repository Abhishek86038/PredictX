import { useState } from 'react';
import * as StellarSdk from 'stellar-sdk';
import { isConnected, getPublicKey, setAllowed } from '@stellar/freighter-api';

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
      console.log('Scanning for Freighter...');
      
      // Try official isConnected check first
      const connected = await isConnected();
      let pubKey = null;

      if (connected) {
        await setAllowed();
        pubKey = await getPublicKey();
      } else if (window.freighterApi) {
        // Fallback to direct global access
        if (window.freighterApi.setAllowed) await window.freighterApi.setAllowed();
        pubKey = await window.freighterApi.getPublicKey();
      }

      if (pubKey) {
        const balance = await fetchBalance(pubKey);
        setAddress(pubKey);
        onConnect(pubKey, balance);
      } else {
        throw new Error('Freighter not responding. Is it unlocked and on Testnet?');
      }
    } catch (error) {
      console.error('Final Scan Error:', error);
      alert(`FINAL ATTEMPT ERROR: ${error.message}`);
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
