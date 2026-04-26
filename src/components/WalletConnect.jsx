import { useState } from 'react';
import * as Freighter from '@stellar/freighter-api';
import * as StellarSdk from 'stellar-sdk';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const fetchBalance = async (pubKey) => {
    try {
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(pubKey);
      const nativeBalance = account.balances.find(b => b.asset_type === 'native');
      return nativeBalance ? nativeBalance.balance : '0';
    } catch (e) {
      console.error('Error fetching balance:', e);
      return '0';
    }
  };

  const connectWallet = async () => {
    if (connecting) return;
    setConnecting(true);
    
    try {
      // 1. Request Permission first (Crucial for modern Freighter)
      console.log('Requesting permission from Freighter...');
      const isAllowed = await Freighter.setAllowed();
      
      if (isAllowed) {
        // 2. Once allowed, get the public key
        const pubKey = await Freighter.getPublicKey();
        if (pubKey) {
          const balance = await fetchBalance(pubKey);
          setAddress(pubKey);
          onConnect(pubKey, balance);
        }
      } else {
        alert('Permission denied. Please allow this site in your Freighter settings.');
      }
    } catch (error) {
      console.error('Connection Error:', error);
      // Fallback for some versions of Freighter
      try {
        const pubKey = await Freighter.getPublicKey();
        if (pubKey) {
          const balance = await fetchBalance(pubKey);
          setAddress(pubKey);
          onConnect(pubKey, balance);
          setConnecting(false);
          return;
        }
      } catch (innerError) {
        console.error('Fallback Error:', innerError);
      }
      alert('Could not connect to Freighter. Please check if the extension is open and on Testnet.');
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
          {connecting ? 'Authorizing...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
