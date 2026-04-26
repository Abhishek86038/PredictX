import { useState } from 'react';
import { getPublicKey, isConnected } from '@stellar/freighter-api';
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
    setConnecting(true);
    try {
      const connected = await isConnected();
      if (connected) {
        const pubKey = await getPublicKey();
        if (pubKey) {
          const balance = await fetchBalance(pubKey);
          setAddress(pubKey);
          onConnect(pubKey, balance);
        }
      } else {
        alert('Please install Freighter Wallet extension');
      }
    } catch (error) {
      console.error('Connection error:', error);
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
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
