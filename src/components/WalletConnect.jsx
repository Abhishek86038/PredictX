import { useState } from 'react';
import * as StellarSdk from 'stellar-sdk';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const fetchBalance = async (pubKey) => {
    console.log('Fetching balance for:', pubKey);
    try {
      // Use the most stable Horizon Testnet URL
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      
      const account = await server.loadAccount(pubKey);
      console.log('Account loaded:', account);
      
      const nativeBalance = account.balances.find(b => b.asset_type === 'native');
      
      if (nativeBalance) {
        console.log('Found Native Balance:', nativeBalance.balance);
        return nativeBalance.balance;
      } else {
        console.warn('No native balance found in account');
        return '0';
      }
    } catch (e) {
      console.error('Testnet fetch error:', e);
      // Try Mainnet just in case of confusion
      try {
        const serverMain = new StellarSdk.Server('https://horizon.stellar.org');
        const accountMain = await serverMain.loadAccount(pubKey);
        const nativeMain = accountMain.balances.find(b => b.asset_type === 'native');
        return nativeMain ? nativeMain.balance : '0';
      } catch (e2) {
        return '0';
      }
    }
  };

  const connectWallet = async () => {
    if (connecting) return;
    setConnecting(true);
    
    try {
      const freighter = window.freighterApi || window.FreighterApi || window.stellar?.freighter;
      
      if (!freighter) {
        setShowManual(true);
        throw new Error('Freighter not found. Please use manual entry.');
      }

      await freighter.setAllowed();
      const pubKey = await freighter.getPublicKey();
      
      if (pubKey) {
        const balance = await fetchBalance(pubKey);
        alert(`CONNECTED!\nAddress: ${pubKey.substring(0, 8)}...\nBalance: ${balance} XLM`);
        setAddress(pubKey);
        onConnect(pubKey, balance);
      }
    } catch (error) {
      alert(`NOTICE: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleManualConnect = async () => {
    if (manualAddress && manualAddress.startsWith('G')) {
      setConnecting(true);
      const balance = await fetchBalance(manualAddress);
      alert(`MANUAL CONNECT!\nBalance Found: ${balance} XLM`);
      setAddress(manualAddress);
      onConnect(manualAddress, balance);
      setConnecting(false);
    } else {
      alert('Invalid Stellar Address (must start with G)');
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    onConnect(null, 0);
    setShowManual(false);
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
        <div className="connection-controls">
          <button onClick={connectWallet} className="connect-btn" disabled={connecting}>
            {connecting ? 'Checking...' : 'Connect Wallet'}
          </button>
          
          {showManual && (
            <div className="manual-entry">
              <input 
                type="text" 
                placeholder="Paste Address (G...)" 
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className="manual-input"
              />
              <button onClick={handleManualConnect} className="manual-btn">Go</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
