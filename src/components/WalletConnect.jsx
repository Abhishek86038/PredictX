import { useState } from 'react';
import * as StellarSdk from 'stellar-sdk';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const fetchBalance = async (pubKey) => {
    try {
      // Try Testnet first
      const serverTest = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      try {
        const account = await serverTest.loadAccount(pubKey);
        const native = account.balances.find(b => b.asset_type === 'native');
        if (native) return native.balance;
      } catch (e) {
        console.log('Not on Testnet, trying Mainnet...');
      }

      // Try Mainnet as fallback
      const serverMain = new StellarSdk.Server('https://horizon.stellar.org');
      const accountMain = await serverMain.loadAccount(pubKey);
      const nativeMain = accountMain.balances.find(b => b.asset_type === 'native');
      return nativeMain ? nativeMain.balance : '0';
    } catch (e) {
      console.error('Final Balance fetch error:', e);
      return '0';
    }
  };

  const connectWallet = async () => {
    if (connecting) return;
    setConnecting(true);
    
    try {
      let freighter = window.freighterApi || window.FreighterApi || window.stellar?.freighter;
      
      if (!freighter) {
        setShowManual(true);
        throw new Error('Wallet not detected. Using manual fallback.');
      }

      await freighter.setAllowed();
      const pubKey = await freighter.getPublicKey();
      
      if (pubKey) {
        const balance = await fetchBalance(pubKey);
        alert(`Connected! Found ${balance} XLM`);
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
      const balance = await fetchBalance(manualAddress);
      alert(`Manual Connect! Found ${balance} XLM`);
      setAddress(manualAddress);
      onConnect(manualAddress, balance);
    } else {
      alert('Invalid Stellar Address');
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
