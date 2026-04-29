# 🎯 XPOLL Predictor - Level 5 Blue Belt

## 🚀 Live Production Status
- **Live URL**: [https://predict-x-pied.vercel.app](https://predict-x-pied.vercel.app)
- **GitHub Actions**: ✅ Passing (with Vercel Secrets)
- **Stellar Network**: Testnet

### ⛓️ Live Contract IDs
- **Oracle**: `CCMFDN5NULZ4NNQC7JEPHFJBNAVP4SWVNTDDPYNBJEYZAVDW73A6Z32W`
- **Staking**: `CAJDJSF6MADCT76UX572H7X4PFPBPHW22F2MNZ7ARAOLENPBYABOHY63`
- **Rewards**: `CCXFPKYSLQYEG27NYV722GFWYCVLNXRJ5SBW6KC2QE5LJILQR7HKXVY3`

---
## User Onboarding & Wallet Registration Records

| User Name | Email ID | Wallet Address |
|-----------|----------|----------------|
| Subhranil | subhranilbaul2017@gmail.com | GBTOPBOVCF5652TCZMN4YDMSBTM... |
| Dikansha Bindal | bindaldikansha@gmail.com | GB66XSKCNNHE6GUYA7BENANHHUKC... |
| Abhishek Gupta | abhishekgupta0834@gmail.com | GBEA2LH5VILCEKQC6M77GXGJ3CPJ... |
| Jayant Vaibhav | jayantvaibhavspj@gmail.com | GBQI6DPFRFZMTDO4KFUPB5D2F6WC... |
| Shashank Rai | shashankrai283@gmail.com | GD5CCTX45O4DWDT3OQ6IYDH2SK55... |

---

## User Feedback Implementation & Revision Tracking

| User Name | Email ID | Wallet Address | Feedback Implemented | Commit ID |
|-----------|----------|----------------|----------------------|-----------|
| Subhranil | subhranilbaul2017@gmail.com | GBTOPBOVCF5652TCZMN4YDMSBTM... | I currently have balance in XLM, but your website is supporting XPOLL, so this part needs more focus for better balance and token handling. | ffeb609 |
| Dikansha Bindal | bindaldikansha@gmail.com | GB66XSKCNNHE6GUYA7BENANHHUKC... | UI can be more interactive | 1e8d7b5 |
| Abhishek Gupta | abhishekgupta0834@gmail.com | GBEA2LH5VILCEKQC6M77GXGJ3CPJ... | Add smooth loading animations or skeleton effects instead of simple loading text. | 5362a53 |
| Jayant Vaibhav | jayantvaibhavspj@gmail.com | GBQI6DPFRFZMTDO4KFUPB5D2F6WC... | Added better transaction visibility and wallet action improvements | da82efa |
| Shashank Rai | shashankrai283@gmail.com | GD5CCTX45O4DWDT3OQ6IYDH2SK55... |The UI looks too simple right now, please make it more premium and modern. | df9d898 |

## 📸 App Preview
<!-- Replace the URL below with your actual screenshot path -->
![XPOLL Predictor Preview](https://via.placeholder.com/800x450?text=PredictX+Dashboard+Preview)


Real-time cryptocurrency price prediction platform with gamification, leaderboards, and token rewards on Stellar.

## ✅ Level 5 Requirements (ALL MET)

- [x] **Real User Onboarding**: Designed for 500+ active users with referral incentives.
- [x] **Production-Ready Features**: Real-time charts, automated settlement logic, and robust dashboards.
- [x] **Market Fit**: High-engagement gamified UI with live market data integration.
- [x] **Smart Contracts**: 3 modular Soroban contracts for Oracle, Staking, and Rewards.
- [x] **Real API Integration**: Seamless connection to CoinGecko for live market prices.
- [x] **Mobile First**: 100% responsive design across all devices.
- [x] **CI/CD Pipeline**: GitHub Actions ready for automated testing and deployment.
- [x] **Premium Aesthetics**: Modern UI with smooth transitions and data visualization.

## ✨ Recent Enhancements

### 🎨 Premium UI Redesign
- Complete overhaul of the frontend design for a more professional and modern aesthetic.
- Implemented a cohesive design system with glassmorphism, vibrant gradients, and smooth transitions.
- Optimized layout for better visibility and user focus across all dashboard sections.

### 🔌 Real Multi-Wallet Integration
- Added support for multiple major Stellar wallets: **Freighter, Albedo, and Rabet**.
- Improved connection flow with a dedicated, high-z-index modal portal.
- Robust state management for active wallet sessions and connection persistence.

### 💰 Intelligent Asset Handling
- Enhanced XLM to XPOLL balance handling logic for seamless asset usability.
- Real-time fetching of actual wallet balances directly from the Stellar Testnet.
- Clearer visual distinction between native XLM (for fees) and platform tokens.

### 🛠️ Connected Wallet Quick Actions
- **Instant Copy**: Clean "Copy Address" button with animated success tooltips.
- **On-Chain Verification**: Direct link to view accounts on the **Stellar Expert** explorer.
- **Shortened Address Formatting**: Premium display of truncated wallet IDs for better legibility.

### ⚡ Professional Loading Experience
- **Skeleton Loaders**: Modern shimmer placeholders for cards and lists to prevent "blank" states.
- **Premium Spinners**: Upgraded to high-fidelity animated ring spinners.
- **Contextual Loading**: Integrated micro-animations for specific actions like staking or connecting.
- **Smooth Content Reveal**: Soft fade-in transitions for data once it finishes loading.

## 🎮 Features

### Prediction Arena
- **Live Prices**: Real-time data for BTC, ETH, SOL, and ADA.
- **Dynamic Charting**: 7-day historical price trends via Recharts.
- **Multiple Timeframes**: 1h, 4h, 12h, and 24h prediction windows.
- **Instant Staking**: Simple UP/DOWN mechanics with XPOLL tokens.

### Leaderboards
- **Global Rankings**: Filterable by Daily, Weekly, and All-Time performance.
- **Performance Metrics**: Track profit, win rate, and total volume.
- **User Highlighting**: Easily find your rank in the global pool.

### User Dashboard
- **Comprehensive Analytics**: Balance tracking, ROI calculation, and win/loss breakdown.
- **Activity History**: View recent predictions and outcomes.
- **Referral Tracking**: Monitor earnings from invited friends.

## 🔗 Smart Contracts

### 1. Price Oracle Contract
- Securely stores and validates market prices.
- Provides historical data for settlement verification.
- **Path**: `smart-contract/contracts/oracle`

### 2. Prediction Staking Contract
- Manages the logic for placing bets and pooling stakes.
- Handles the state of active and settled predictions.
- **Path**: `smart-contract/contracts/prediction`

### 3. Rewards Distribution Contract
- Calculates winning distributions and referral bonuses.
- Maintains persistent user statistics on-chain.
- **Path**: `smart-contract/contracts/rewards`

## 🛠️ Technical Stack

- **Frontend**: React + Vite
- **Styling**: Vanilla CSS (Premium Design System)
- **Blockchain**: Stellar Soroban (Rust)
- **Data**: CoinGecko API
- **Charts**: Recharts

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 📊 CI/CD

Automated deployment is configured via GitHub Actions. Pushes to `main` will trigger a build and test cycle, followed by deployment to Vercel/Netlify.
