// Rewards Service - Real stats calculated from user history

export const getUserStats = async (walletAddress) => {
  const stored = JSON.parse(localStorage.getItem('predictx_predictions') || '[]');
  const userPredictions = stored.filter(p => p.walletAddress === walletAddress);
  const settled = userPredictions.filter(p => p.status === 'settled');
  
  const wins = settled.filter(p => p.won).length;
  const losses = settled.filter(p => !p.won).length;
  const profit = settled.reduce((acc, p) => acc + (p.won ? p.reward - p.stake : -p.stake), 0);
  const totalStaked = userPredictions.reduce((acc, p) => acc + p.stake, 0);
  const winRate = settled.length > 0 ? (wins / settled.length) * 100 : 0;

  return {
    wins,
    losses,
    profit: Math.round(profit),
    winRate: Math.round(winRate),
    totalStaked: Math.round(totalStaked),
    recentPredictions: userPredictions.slice(0, 5).map(p => ({
      crypto: p.crypto,
      won: p.won,
      amount: p.stake
    }))
  };
};

export const getReferralEarnings = async (_walletAddress) => {
  // Simple simulation of referral earnings
  const stored = JSON.parse(localStorage.getItem('predictx_predictions') || '[]');
  return Math.round(stored.length * 12.5); // Earn 12.5 per prediction as bonus simulation
};

export const claimReferralBonus = async (_walletAddress) => {
  return { success: true, amount: 50 };
};
