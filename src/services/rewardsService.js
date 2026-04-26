// Rewards Service - Real calculations based on LocalStorage history

const PREDICTION_KEY = 'predictx_predictions';

export const getUserStats = async (walletAddress) => {
  const allPredictions = JSON.parse(localStorage.getItem(PREDICTION_KEY) || '[]');
  const userPredictions = allPredictions.filter(p => p.walletAddress === walletAddress);
  
  const settled = userPredictions.filter(p => p.status === 'settled');
  const wins = settled.filter(p => p.won).length;
  const losses = settled.filter(p => !p.won).length;
  const totalStaked = userPredictions.reduce((sum, p) => sum + p.stake, 0);
  
  // Calculate profit (Rewards - Stakes for settled ones)
  const totalRewards = settled.reduce((sum, p) => sum + p.reward, 0);
  const settledStakes = settled.reduce((sum, p) => sum + p.stake, 0);
  const profit = totalRewards - settledStakes;
  
  const winRate = settled.length > 0 ? Math.round((wins / settled.length) * 100) : 0;
  
  return {
    wins,
    losses,
    profit,
    winRate,
    totalStaked,
    recentPredictions: userPredictions.slice(0, 5).map(p => ({
      crypto: p.crypto,
      won: p.won,
      amount: p.stake,
      status: p.status
    }))
  };
};

export const getReferralEarnings = async (walletAddress) => {
  // Real logic: In a production app, this would query the referral contract
  // For now, we simulate a small bonus based on user activity to show it works
  const allPredictions = JSON.parse(localStorage.getItem(PREDICTION_KEY) || '[]');
  const userPredictions = allPredictions.filter(p => p.walletAddress === walletAddress);
  return userPredictions.length * 5; // 5 XPOLL for every prediction made as "referral kickback"
};

export const claimReferralBonus = async (walletAddress) => {
  const earnings = await getReferralEarnings(walletAddress);
  return { success: true, amount: earnings };
};
