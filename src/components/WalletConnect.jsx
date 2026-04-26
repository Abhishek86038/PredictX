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
    console.log('Connect Wallet initiated...');
    if (connecting) return;
    
    setConnecting(true);
    try {
      // Direct call to getPublicKey - this should trigger the Freighter popup
      const pubKey = await Freighter.getPublicKey();
      
      if (pubKey) {
        console.log('Public Key received:', pubKey);
        const balance = await fetchBalance(pubKey);
        setAddress(pubKey);
        onConnect(pubKey, balance);
      } else {
        console.warn('No public key returned from Freighter');
        alert('Could not get wallet address. Please ensure Freighter is unlocked and on Testnet.');
      }
    } catch (error) {
      console.error('Detailed Connection Error:', error);
      alert('Freighter connection failed. Do you have the extension installed?');
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
          style={{ cursor: connecting ? 'not-allowed' : 'pointer' }}
        >
          {connecting ? 'Waiting for Freighter...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
