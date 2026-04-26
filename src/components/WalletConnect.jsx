import { useState } from 'react';
import * as Freighter from '@stellar/freighter-api';
import * as StellarSdk from 'stellar-sdk';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const fetchBalance = async (pubKey) => {
    try {
      // Use named export or object access based on package version
      const Server = StellarSdk.Server || StellarSdk.default?.Server;
      const server = new Server('https://horizon-testnet.stellar.org');
      
      const account = await server.loadAccount(pubKey);
      const nativeBalance = account.balances.find(b => b.asset_type === 'native');
      return nativeBalance ? nativeBalance.balance : '0';
    } catch (e) {
      console.error('Balance fetch error:', e);
      // If it's a 404, it means the account isn't funded yet on Testnet
      if (e.response?.status === 404) return '0 (Not Funded)';
      return '0';
    }
  };

  const connectWallet = async () => {
    if (connecting) return;
    setConnecting(true);
    
    try {
      console.log('Requesting permission...');
      const allowed = await Freighter.setAllowed();
      
      if (allowed) {
        const pubKey = await Freighter.getPublicKey();
        if (pubKey) {
          console.log('Got PubKey:', pubKey);
          const balance = await fetchBalance(pubKey);
          setAddress(pubKey);
          onConnect(pubKey, balance);
        } else {
          throw new Error('User denied public key request');
        }
      } else {
        throw new Error('Permission denied by user');
      }
    } catch (error) {
      console.error('Final Connection Error:', error);
      alert(`Connection Failed: ${error.message || 'Unknown error'}. Please make sure Freighter is unlocked.`);
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
          {connecting ? 'Checking Wallet...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
