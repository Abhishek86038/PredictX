import { getUserPredictions } from './predictionService';

export const getUserStats = async (walletAddress) => {
  try {
    // Get all predictions (active and settled) for the user
    const activePredictions = await getUserPredictions(walletAddress, 'active');
    const settledPredictions = await getUserPredictions(walletAddress, 'settled');
    
    const allPredictions = [...activePredictions, ...settledPredictions];
    
    let wins = 0;
    let losses = 0;
    let profit = 0;
    let totalStaked = 0;
    
    const recentPredictions = [];

    allPredictions.forEach(p => {
      totalStaked += parseFloat(p.stake || 0);
      
      if (p.status === 'settled') {
        if (p.won) {
          wins++;
          // Profit is reward - stake
          profit += (p.reward - p.stake);
        } else {
          losses++;
          profit -= p.stake;
        }
      }
    });

    // Sort by created at descending to get recent
    const sorted = [...allPredictions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    sorted.slice(0, 5).forEach(p => {
      if (p.status === 'settled') {
        recentPredictions.push({
          crypto: p.crypto,
          won: p.won,
          amount: p.won ? (p.reward - p.stake) : p.stake
        });
      }
    });

    const totalSettled = wins + losses;
    const winRate = totalSettled > 0 ? Math.round((wins / totalSettled) * 100) : 0;

    return {
      wins,
      losses,
      profit,
      winRate,
      totalStaked,
      recentPredictions
    };
  } catch (error) {
    console.error("Failed to calculate user stats", error);
    return {
      wins: 0,
      losses: 0,
      profit: 0,
      winRate: 0,
      totalStaked: 0,
      recentPredictions: []
    };
  }
};

export const getReferralEarnings = async (_walletAddress) => {
  // Referral logic can remain mocked or use localstorage if needed
  return 0; // Removing fake earnings
};

export const claimReferralBonus = async (_walletAddress) => {
  return { success: true, amount: 0 };
};
