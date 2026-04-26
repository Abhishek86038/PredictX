import { useState, useEffect } from 'react';
import { isConnected, getPublicKey } from '@stellar/freighter-api';
import { Server } from 'stellar-sdk';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  
  const horizonServer = new Server('https://horizon-testnet.stellar.org');

  const fetchBalance = async (pubKey) => {
    try {
      const account = await horizonServer.loadAccount(pubKey);
      // Find XLM balance or XPOLL if we have an asset ID
      const nativeBalance = account.balances.find(b => b.asset_type === 'native');
      return nativeBalance ? parseFloat(nativeBalance.balance) : 0;
    } catch (e) {
      console.error('Error fetching balance:', e);
      return 0;
    }
  };

  const connectWallet = async () => {
    setConnecting(true);
    try {
      if (await isConnected()) {
        const publicKey = await getPublicKey();
        if (publicKey) {
          const balance = await fetchBalance(publicKey);
          setAddress(publicKey);
          onConnect(publicKey, balance);
        }
      } else {
        alert('Please install Freighter wallet to continue');
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
          <span className="wallet-address" title={address}>
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
