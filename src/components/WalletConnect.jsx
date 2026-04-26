import { useState } from 'react';
import * as StellarSdk from 'stellar-sdk';

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

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
      // Aggressive retry to find ANY wallet global
      let freighter = null;
      for (let i = 0; i < 20; i++) {
        freighter = window.freighterApi || window.FreighterApi || window.stellar?.freighter;
        if (freighter) break;
        await new Promise(r => setTimeout(r, 150));
      }
      
      if (!freighter) {
        setShowManual(true);
        throw new Error('Wallet not detected. You can enter your address manually below if the extension is blocked.');
      }

      console.log('Requesting permission...');
      if (freighter.setAllowed) await freighter.setAllowed();
      
      console.log('Fetching public key...');
      const pubKey = await freighter.getPublicKey();
      
      if (pubKey) {
        const balance = await fetchBalance(pubKey);
        setAddress(pubKey);
        onConnect(pubKey, balance);
      } else {
        throw new Error('Could not get Public Key. Ensure Freighter is unlocked.');
      }
    } catch (error) {
      console.error('Final Error:', error);
      alert(`NOTICE: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleManualConnect = async () => {
    if (manualAddress && manualAddress.startsWith('G')) {
      const balance = await fetchBalance(manualAddress);
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
          <button 
            onClick={connectWallet} 
            className="connect-btn"
            disabled={connecting}
          >
            {connecting ? 'Scanning...' : 'Connect Wallet'}
          </button>
          
          {showManual && (
            <div className="manual-entry">
              <input 
                type="text" 
                placeholder="Or paste Public Key (G...)" 
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
