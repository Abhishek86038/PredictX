export const getUserStats = async (walletAddress) => {
  // Mock user stats
  return {
    wins: 15,
    losses: 10,
    profit: 450,
    winRate: 60,
    totalStaked: 1200,
    recentPredictions: [
      { crypto: 'bitcoin', won: true, amount: 100 },
      { crypto: 'ethereum', won: false, amount: 50 },
      { crypto: 'solana', won: true, amount: 75 },
    ]
  };
};

export const getReferralEarnings = async (walletAddress) => {
  return 125;
};

export const claimReferralBonus = async (walletAddress) => {
  return { success: true, amount: 125 };
};
